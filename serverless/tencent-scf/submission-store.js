'use strict';

// This module is loaded only when private submissions are enabled, so AI-only deployments still work.
function createStore(env, dependencies = {}) {
  const mysql = dependencies.mysql || require('mysql2/promise');
  const COS = dependencies.COS || require('cos-nodejs-sdk-v5');
  const pool = mysql.createPool({
    host: env.DB_HOST, port: Number(env.DB_PORT || 3306), user: env.DB_USER,
    password: env.DB_PASSWORD, database: env.DB_NAME,
    charset: 'utf8mb4', timezone: 'Z', connectionLimit: 3, queueLimit: 20,
    connectTimeout: 5000,
    ssl: env.DB_TLS_CA ? { ca: env.DB_TLS_CA.replace(/\\n/g, '\n'), rejectUnauthorized: true } : undefined
  });
  // SCF execution-role credentials rotate; read them on each signing request.
  const cos = new COS({
    getAuthorization(options, callback) {
      callback({
        Authorization: COS.getAuthorization({
          SecretId: env.TENCENTCLOUD_SECRETID,
          SecretKey: env.TENCENTCLOUD_SECRETKEY,
          Method: options.Method, Pathname: options.Pathname,
          Query: options.Query, Headers: options.Headers, Expires: 60
        }),
        SecurityToken: env.TENCENTCLOUD_SESSIONTOKEN
      });
    },
    Timeout: 20000
  });
  const bucket = { Bucket: env.COS_BUCKET, Region: env.COS_REGION };
  const query = async (sql, params = []) => (await pool.execute(sql, params))[0];
  return {
    async health() {
      await query('SELECT 1 FROM users LIMIT 1');
      await query('SELECT 1 FROM sessions LIMIT 1');
      await query('SELECT 1 FROM submissions LIMIT 1');
      await query('SELECT 1 FROM rate_limits LIMIT 1');
      // Fail closed if the bucket grants any public/authenticated-group ACL.
      const acl = await cos.getBucketAcl(bucket);
      if ((acl.Grants || []).some(g => /\/global\/All(?:Users|AuthenticatedUsers)$/.test(g.Grantee?.URI || ''))) {
        throw new Error('Bucket must be private');
      }
      // This application uses CAM role permissions, not bucket-policy Allow grants.
      // Reject Allow policies conservatively, including anonymous read policies that bypass ACL.
      try {
        const result = await cos.getBucketPolicy(bucket);
        const policy = typeof result.Policy === 'string' ? JSON.parse(result.Policy) : result.Policy;
        const statements = policy?.Statement || policy?.statement || [];
        if (statements.some(s => String(s.Effect || s.effect).toLowerCase() === 'allow')) throw new Error('Bucket policy must not grant access');
      } catch (error) { if (error.code !== 'NoSuchBucketPolicy') throw error; }
    },
    findUser: async email => (await query('SELECT * FROM users WHERE email = ?', [email]))[0],
    async createUser(user) {
      await query('INSERT INTO users (id,email,password_hash) VALUES (?,?,?)', [user.id, user.email, user.password_hash]);
    },
    async addSession(hash, id, expires, passwordHash) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [rows] = await connection.execute('SELECT password_hash,disabled FROM users WHERE id=? FOR UPDATE', [id]);
        if (!rows[0] || rows[0].disabled || rows[0].password_hash !== passwordHash) throw new Error('Account changed; sign in again');
        await connection.execute('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)', [hash,id,expires]);
        await connection.commit();
      } catch (error) { await connection.rollback(); throw error; }
      finally { connection.release(); }
    },
    async sessionUser(hash, now) {
      return (await query('SELECT u.id,u.email,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.disabled=FALSE', [hash, now]))[0];
    },
    async revokeSession(hash) { await query('DELETE FROM sessions WHERE token_hash=?', [hash]); },
    async changePassword(id, hash, previousHash) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [rows] = await connection.execute('SELECT password_hash FROM users WHERE id=? FOR UPDATE', [id]);
        if (rows[0]?.password_hash !== previousHash) throw new Error('Account changed; sign in again');
        await connection.execute('UPDATE users SET password_hash=? WHERE id=?', [hash, id]);
        await connection.execute('DELETE FROM sessions WHERE user_id=?', [id]);
        await connection.commit();
      } catch (error) { await connection.rollback(); throw error; }
      finally { connection.release(); }
    },
    async consumeRate(key, limit, expires) {
      // Fixed-window keys are HMACs; the conditional UPDATE is atomic across SCF instances.
      await query('INSERT IGNORE INTO rate_limits (bucket,hits,expires_at) VALUES (?,0,?)', [key, expires]);
      const result = await query('UPDATE rate_limits SET hits=hits+1 WHERE bucket=? AND hits<?', [key, limit]);
      return result.affectedRows === 1;
    },
    async reserveSubmission(row, maxBytes, maxCount) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await connection.execute('SELECT id FROM users WHERE id=? FOR UPDATE', [row.user_id]);
        const [rows] = await connection.execute('SELECT COUNT(*) AS count, COALESCE(SUM(file_size),0) AS bytes FROM submissions WHERE user_id=?', [row.user_id]);
        if (Number(rows[0].count) >= maxCount || Number(rows[0].bytes) + row.file_size > maxBytes) {
          const error = new Error('quota'); error.code = 'QUOTA'; throw error;
        }
        const columns = ['id','user_id','title','category','level','description','source','object_key','file_name','file_size'];
        await connection.execute('INSERT INTO submissions (' + columns.join(',') + ') VALUES (' + columns.map(() => '?').join(',') + ')', columns.map(key => row[key]));
        await connection.commit();
      } catch (error) { await connection.rollback(); throw error; }
      finally { connection.release(); }
    },
    async completeSubmission(id) { await query("UPDATE submissions SET status='pending' WHERE id=? AND status='uploading'", [id]); },
    async discardSubmission(id) { await query("DELETE FROM submissions WHERE id=? AND status='uploading'", [id]); },
    async submission(id) { return (await query("SELECT * FROM submissions WHERE id=? AND status<>'uploading'", [id]))[0]; },
    async listSubmissions(offset) {
      const rows = await query("SELECT s.id,s.title,s.category,s.level,s.description,s.source,s.file_name,s.file_size,s.status,s.created_at,u.email FROM submissions s JOIN users u ON u.id=s.user_id WHERE s.status<>'uploading' ORDER BY s.created_at DESC,s.id DESC LIMIT 21 OFFSET " + offset);
      return { submissions: rows.slice(0,20), next_offset: rows.length > 20 ? offset + 20 : null };
    },
    async review(id) {
      const result = await query("UPDATE submissions SET status='reviewed' WHERE id=? AND status IN ('pending','reviewed')", [id]);
      return result.affectedRows > 0;
    },
    putObject: (key, data) => cos.putObject({ ...bucket, Key: key, Body: data, ACL: 'private', ContentType: 'application/octet-stream' }),
    deleteObject: key => cos.deleteObject({ ...bucket, Key: key }),
    async getObject(key) { return Buffer.from((await cos.getObject({ ...bucket, Key: key })).Body); },
    async getReferenceObject(key, range) {
      const result = await cos.getObject({ ...bucket, Key: key, ...(range ? { Range: range } : {}) });
      return {
        body: Buffer.from(result.Body),
        contentLength: Number(result.ContentLength || result.Body?.length || 0),
        contentRange: result.ContentRange || '',
        contentType: result.ContentType || 'application/pdf',
        etag: result.ETag || ''
      };
    },
    async headReferenceObject(key) {
      const result = await cos.headObject({ ...bucket, Key: key });
      return {
        contentLength: Number(result.ContentLength || 0),
        contentType: result.ContentType || 'application/pdf',
        etag: result.ETag || ''
      };
    },
    close: () => pool.end(),
    pool
  };
}

module.exports = { createStore };
