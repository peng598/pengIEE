'use strict';

function createReferenceStore(env, dependencies = {}) {
  const COS = dependencies.COS || require('cos-nodejs-sdk-v5');
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
  return {
    async health() {
      const acl = await cos.getBucketAcl(bucket);
      if ((acl.Grants || []).some(grant => /\/global\/All(?:Users|AuthenticatedUsers)$/.test(grant.Grantee?.URI || ''))) {
        throw new Error('Bucket must be private');
      }
      try {
        const result = await cos.getBucketPolicy(bucket);
        const policy = typeof result.Policy === 'string' ? JSON.parse(result.Policy) : result.Policy;
        const statements = policy?.Statement || policy?.statement || [];
        if (statements.some(statement => String(statement.Effect || statement.effect).toLowerCase() === 'allow')) {
          throw new Error('Bucket policy must not grant access');
        }
      } catch (error) {
        // COS returns either the SDK error name or numeric 404 when no bucket policy exists.
        if (error.code !== 'NoSuchBucketPolicy' && String(error.code) !== '404' && error.statusCode !== 404) throw error;
      }
    },
    async getReferenceObject(key, range) {
      const result = await cos.getObject({ ...bucket, Key: key, ...(range ? { Range: range } : {}) });
      return {
        body: Buffer.from(result.Body),
        contentLength: Number(result.ContentLength || result.Body?.length || 0),
        contentRange: result.ContentRange || '',
        etag: result.ETag || ''
      };
    },
    async headReferenceObject(key) {
      const result = await cos.headObject({ ...bucket, Key: key });
      return { contentLength: Number(result.ContentLength || 0), etag: result.ETag || '' };
    }
  };
}

module.exports = { createReferenceStore };
