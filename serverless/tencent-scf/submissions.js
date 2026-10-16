'use strict';

const { randomBytes, randomUUID, scrypt, timingSafeEqual, createHmac } = require('node:crypto');
const { promisify } = require('node:util');
const { findReference } = require('./reference-catalog');
const derive = promisify(scrypt);
const MiB = 1024 * 1024;
const PASSWORD_OPTIONS = { N: 32768, r: 8, p: 3, maxmem: 64 * MiB };
const CATEGORIES = ['嵌入式系统','实时系统与软件','硬件基础与电源','PCB 与信号完整性','模拟、音频与声学','测试与工程经验','其他'];
const LEVELS = ['基础','核心设计','工程实战'];
const EXTENSIONS = ['pdf','md','txt','zip','png','jpg','jpeg','webp','gif'];
class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
function bounded(value, fallback, min, max) {
  const n = value === undefined || value === '' ? fallback : Number(value);
  if (!Number.isInteger(n) || n < min || n > max) throw new Error('Invalid setting');
  return n;
}
function settings(env) {
  if (env.SUBMISSIONS_ENABLED !== 'true' || Buffer.byteLength(env.AUTH_SECRET || '') < 32) throw new Error('Not configured');
  return {
    secret: env.AUTH_SECRET,
    maxFile: bounded(env.MAX_UPLOAD_BYTES, 4 * MiB, 1, 4 * MiB),
    maxUserBytes: bounded(env.MAX_USER_STORAGE_BYTES, 100 * MiB, 1, 1024 * MiB),
    maxFiles: bounded(env.MAX_USER_FILES, 100, 1, 10000),
    sessionMs: bounded(env.SESSION_HOURS, 12, 1, 24) * 3600000
  };
}
async function passwordHash(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await derive(password, salt, 32, PASSWORD_OPTIONS);
  return 'scrypt-v1$' + salt + '$' + hash.toString('hex');
}
async function passwordMatches(password, record) {
  const parts = String(record || '').split('$');
  const valid = parts[0] === 'scrypt-v1' && /^[a-f0-9]{32}$/.test(parts[1]) && /^[a-f0-9]{64}$/.test(parts[2]);
  // Still do a real hash for nonexistent users to reduce account timing leaks.
  const hash = await derive(password, valid ? parts[1] : '0'.repeat(32), 32, PASSWORD_OPTIONS);
  return valid && timingSafeEqual(hash, Buffer.from(parts[2], 'hex'));
}
function emailValue(value) {
  if (typeof value !== 'string') throw new ApiError(400, '请输入有效邮箱。');
  const email = value.trim().toLowerCase();
  if (email.length > 180 || !/^[\x21-\x7e]+$/.test(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, '请输入有效邮箱。');
  return email;
}
function passwordValue(value) {
  if (typeof value !== 'string' || value.length < 10 || value.length > 128) throw new ApiError(400, '密码长度需要为 10 至 128 位。');
  return value;
}
function readBody(req, max, timeout = 15000) {
  return new Promise((resolve, reject) => {
    let size = 0, finished = false;
    const chunks = [];
    const timer = setTimeout(() => done(new ApiError(408, '接收超时，请重试。')), timeout);
    const done = (error, value) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      req.off('data', data); req.off('end', end); req.off('aborted', aborted); req.off('error', aborted);
      if (error) { req.resume(); reject(error); } else resolve(value);
    };
    const data = chunk => {
      size += chunk.length;
      if (size > max) return done(new ApiError(413, '上传内容超过大小限制。'));
      chunks.push(chunk);
    };
    const end = () => done(null, Buffer.concat(chunks));
    const aborted = () => done(new ApiError(400, '请求已取消。'));
    req.on('data', data); req.on('end', end); req.on('aborted', aborted); req.on('error', aborted);
    if (Number(req.headers['content-length']) > max) done(new ApiError(413, '上传内容超过大小限制。'));
  });
}
async function jsonBody(req) {
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) throw new ApiError(415, '请使用 JSON 请求。');
  const bytes = await readBody(req, 8192);
  try {
    const data = JSON.parse(bytes.toString('utf8'));
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
    return data;
  } catch { throw new ApiError(400, '请求格式不正确。'); }
}
function text(form, key, max) {
  const value = form.get(key);
  if (form.getAll(key).length !== 1 || typeof value !== 'string' || !value.trim() || value.length > max) throw new ApiError(400, '请检查资料信息的必填项及长度。');
  return value.trim();
}
function validMagic(extension, data) {
  const starts = hex => data.subarray(0, hex.length / 2).equals(Buffer.from(hex, 'hex'));
  if (extension === 'pdf') return data.subarray(0,5).toString() === '%PDF-';
  if (extension === 'png') return starts('89504e470d0a1a0a');
  if (['jpg','jpeg'].includes(extension)) return starts('ffd8ff');
  if (extension === 'gif') return ['GIF87a','GIF89a'].includes(data.subarray(0,6).toString());
  if (extension === 'webp') return data.subarray(0,4).toString() === 'RIFF' && data.subarray(8,12).toString() === 'WEBP';
  if (extension === 'zip') return starts('504b0304') || starts('504b0506') || starts('504b0708');
  try { new TextDecoder('utf-8', { fatal: true }).decode(data); return !data.includes(0); } catch { return false; }
}

function referenceRange(value) {
  if (!value) return null;
  const match = /^bytes=(\d+)-(\d*)$/.exec(String(value).trim());
  if (!match) throw new ApiError(416, '只支持单段 PDF 范围读取。');
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : null;
  if (!Number.isSafeInteger(start) || (end !== null && (!Number.isSafeInteger(end) || end < start))) {
    throw new ApiError(416, 'PDF 范围参数无效。');
  }
  return `bytes=${start}-${end === null ? '' : end}`;
}

function fileName(value) {
  return String(value || 'reference.pdf').replace(/[\\"\r\n]/g, '_').slice(0, 180) || 'reference.pdf';
}

function createSubmissionHandler({ env = process.env, store: providedStore, now = Date.now } = {}) {
  let config, store, readyUntil = 0, active = 0;
  try {
    config = settings(env);
    if (providedStore) store = providedStore;
    else {
      for (const key of ['DB_HOST','DB_USER','DB_PASSWORD','DB_NAME','COS_BUCKET','COS_REGION']) if (!env[key]) throw new Error('Missing binding');
      if (!/^[a-z0-9-]+-\d+$/.test(env.COS_BUCKET) || !/^[a-z]+-[a-z]+(?:-[a-z]+)?$/.test(env.COS_REGION)) throw new Error('Invalid COS configuration');
      store = require('./submission-store').createStore(env);
    }
  } catch { config = null; }
  const digest = value => createHmac('sha256', config.secret).update(value).digest('hex');
  const rate = async (key, limit, windowMs) => {
    const time = now();
    const end = (Math.floor(time / windowMs) + 1) * windowMs;
    if (!await store.consumeRate(digest('rate:' + key + ':' + Math.floor(time / windowMs)), limit, end)) throw new ApiError(429, '操作过于频繁，请稍后再试。');
  };
  const sessionHash = req => {
    const token = (req.headers.authorization || '').match(/^Bearer ([a-f0-9]{64})$/)?.[1];
    if (!token) throw new ApiError(401, '请先登录。');
    return digest('session:' + token);
  };
  const authenticate = async req => {
    const user = await store.sessionUser(sessionHash(req), now());
    if (!user) throw new ApiError(401, '登录已失效，请重新登录。');
    return user;
  };
  const newSession = async user => {
    const token = randomBytes(32).toString('hex');
    await store.addSession(digest('session:' + token), user.id, now() + config.sessionMs, user.password_hash);
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  };
  async function ensureReady() {
    if (!config || !store) throw new ApiError(503, '账号与私密存储服务尚未配置，请联系站长。');
    if (now() >= readyUntil) {
      try { await store.health(); readyUntil = now() + 30000; }
      catch { throw new ApiError(503, '数据库或私有存储暂不可用，请联系站长。'); }
    }
  }
  const handler = async (req, res, send, url) => {
    if (!url.pathname.startsWith('/api/')) return false;
    const path = url.pathname;
    try {
      if (req.method === 'OPTIONS') { send(204); return true; }
      if (active >= 3) throw new ApiError(429, '账号服务当前繁忙，请稍后重试。');
      active++;
      try {
        await ensureReady();
        if (path === '/api/health' && req.method === 'GET') {
          send(200, { status: 'ready', max_upload_bytes: config.maxFile }); return true;
        }
        const readMatch = path.match(/^\/api\/reference\/([a-f0-9]{32})\/read$/);
        if (readMatch && ['GET', 'HEAD'].includes(req.method)) {
          if (!req.headers.origin) throw new ApiError(403, '请求缺少网站来源。');
          const file = findReference(readMatch[1]);
          if (!file) throw new ApiError(404, '参考资料不存在或尚未上架。');
          const range = req.method === 'GET' ? referenceRange(req.headers.range) : null;
          const object = req.method === 'HEAD'
            ? await store.headReferenceObject(file.key)
            : await store.getReferenceObject(file.key, range);
          res.statusCode = range ? 206 : 200;
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(fileName(file.title + '.pdf'))}`);
          res.setHeader('Cache-Control', 'private, no-store');
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Length, Content-Range, Content-Type, ETag');
          if (object.contentRange) res.setHeader('Content-Range', object.contentRange);
          if (object.etag) res.setHeader('ETag', object.etag);
          if (object.contentLength) res.setHeader('Content-Length', String(object.contentLength));
          res.setHeader('X-Content-Type-Options', 'nosniff');
          if (req.method === 'HEAD') res.end(); else res.end(object.body);
          return true;
        }
        if (!req.headers.origin) throw new ApiError(403, '请求缺少网站来源。');
        if (['/api/auth/register','/api/auth/login'].includes(path) && req.method === 'POST') {
          await rate('auth:global', 120, 60000);
          const body = await jsonBody(req);
          const email = emailValue(body.email);
          const password = passwordValue(body.password);
          await rate('auth:email:' + email, 10, 15 * 60000);
          if (path.endsWith('/register')) {
            await rate('register:global', 20, 3600000);
            if (await store.findUser(email)) throw new ApiError(409, '此邮箱已注册，请登录。');
            const user = { id: randomUUID(), email, password_hash: await passwordHash(password), role: 'user' };
            // Never grant admin privileges based on an unverified email or client-supplied role.
            try { await store.createUser(user); }
            catch (error) { if (error.code === 'ER_DUP_ENTRY') throw new ApiError(409, '此邮箱已注册，请登录。'); throw error; }
            send(201, await newSession(user)); return true;
          }
          const user = await store.findUser(email);
          if (!await passwordMatches(password, user?.password_hash) || user.disabled) throw new ApiError(401, '邮箱或密码不正确。');
          send(200, await newSession(user)); return true;
        }
        const user = await authenticate(req);
        if (path === '/api/auth/me' && req.method === 'GET') { send(200, { user }); return true; }
        if (path === '/api/auth/logout' && req.method === 'POST') {
          await store.revokeSession(sessionHash(req)); send(200, { ok: true }); return true;
        }
        if (path === '/api/auth/password' && req.method === 'POST') {
          await rate('password:' + user.id, 5, 15 * 60000);
          const body = await jsonBody(req);
          const current = passwordValue(body.current_password);
          const next = passwordValue(body.new_password);
          const record = await store.findUser(user.email);
          if (!await passwordMatches(current, record.password_hash)) throw new ApiError(400, '当前密码不正确。');
          await store.changePassword(user.id, await passwordHash(next), record.password_hash);
          send(200, { ok: true, message: '密码已修改，所有设备需要重新登录。' }); return true;
        }
        if (path === '/api/submissions' && req.method === 'POST') {
          await rate('upload:' + user.id, 5, 60000);
          if (!/^multipart\/form-data;.*boundary=/i.test(req.headers['content-type'] || '')) throw new ApiError(415, '请使用文件上传表单。');
          const bytes = await readBody(req, config.maxFile + 65536);
          let form;
          try { form = await new Request('http://localhost', { method: 'POST', headers: { 'Content-Type': req.headers['content-type'] }, body: bytes }).formData(); }
          catch { throw new ApiError(400, '上传表单格式不正确。'); }
          const fields = { title: text(form,'title',120), category: text(form,'category',80), level: text(form,'level',40), description: text(form,'description',1000), source: text(form,'source',600) };
          if (!CATEGORIES.includes(fields.category) || !LEVELS.includes(fields.level)) throw new ApiError(400, '请选择有效分类和层级。');
          const file = form.get('file');
          if (!file || typeof file.arrayBuffer !== 'function' || form.getAll('file').length !== 1 || !file.size) throw new ApiError(400, '请选择一个非空文件。');
          if (file.size > config.maxFile) throw new ApiError(413, '文件超过大小限制。');
          const filename = file.name;
          if (!filename || filename.length > 180 || /[\x00-\x1f\x7f/\\]/.test(filename)) throw new ApiError(400, '文件名无效。');
          const extension = filename.split('.').pop().toLowerCase();
          const content = Buffer.from(await file.arrayBuffer());
          if (!EXTENSIONS.includes(extension) || !validMagic(extension, content)) throw new ApiError(415, '文件类型或内容不受支持，请检查扩展名和格式。');
          const id = randomUUID();
          const row = { id, user_id: user.id, ...fields, file_name: filename, file_size: file.size, object_key: 'private/' + user.id + '/' + id };
          try { await store.reserveSubmission(row, config.maxUserBytes, config.maxFiles); }
          catch (error) { if (error.code === 'QUOTA') throw new ApiError(413, '已达到个人上传额度，请联系站长。'); throw error; }
          try { await store.putObject(row.object_key, content); await store.completeSubmission(id); }
          catch (error) {
            // Keep the reservation if COS deletion fails; never lose track of an orphan file.
            try { await store.deleteObject(row.object_key); await store.discardSubmission(id); } catch { /* Operator cleanup of uploading rows. */ }
            throw error;
          }
          send(201, { submission: { id, title: row.title, status: 'pending' } }); return true;
        }
        if (path.startsWith('/api/admin/')) {
          // Database-backed role check on every request; no authority from token payloads or form fields.
          if (user.role !== 'admin') throw new ApiError(403, '只有管理员可以查看和下载资料。');
          if (path === '/api/admin/submissions' && req.method === 'GET') {
            const offset = Number(url.searchParams.get('offset') || 0);
            if (!Number.isSafeInteger(offset) || offset < 0 || offset > 1000000) throw new ApiError(400, '分页参数无效。');
            send(200, await store.listSubmissions(offset)); return true;
          }
          const referenceDownload = path.match(/^\/api\/admin\/reference\/([a-f0-9]{32})\/download$/);
          if (referenceDownload && req.method === 'GET') {
            const file = findReference(referenceDownload[1]);
            if (!file) throw new ApiError(404, '参考资料不存在或尚未上架。');
            const object = await store.getReferenceObject(file.key);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName(file.title + '.pdf'))}`);
            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('Content-Length', String(object.contentLength || object.body.length));
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.end(object.body); return true;
          }
          const match = path.match(/^\/api\/admin\/submissions\/([a-f0-9-]{36})\/(download|review)$/);
          if (match && match[2] === 'review' && req.method === 'POST') {
            if (!await store.review(match[1])) throw new ApiError(404, '资料不存在。');
            send(200, { ok: true }); return true;
          }
          if (match && match[2] === 'download' && req.method === 'GET') {
            const row = await store.submission(match[1]);
            if (!row) throw new ApiError(404, '资料不存在。');
            const content = await store.getObject(row.object_key);
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', "attachment; filename=\"download\"; filename*=UTF-8''" + encodeURIComponent(row.file_name).replace(/['()]/g, c => '%' + c.charCodeAt(0).toString(16)));
            res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
            res.end(content); return true;
          }
        }
        throw new ApiError(404, '接口不存在。');
      } finally { active--; }
    } catch (error) {
      req.resume();
      const status = error instanceof ApiError ? error.status : 503;
      if (status === 429) res.setHeader('Retry-After', '60');
      if ([408,413].includes(status)) res.setHeader('Connection', 'close');
      send(status, { error: { message: error instanceof ApiError ? error.message : '账号或存储服务暂不可用，请稍后重试。' } });
    }
    return true;
  };
  handler.close = async () => store?.close?.();
  return handler;
}

module.exports = { createSubmissionHandler, passwordHash, passwordMatches };
