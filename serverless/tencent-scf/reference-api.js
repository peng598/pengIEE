'use strict';

const { findReference } = require('./reference-catalog');
const CHUNK_BYTES = 262144;

function createReferenceHandler({ env = process.env, store: providedStore, now = Date.now } = {}) {
  let store, readyUntil = 0;
  if (env.REFERENCE_READ_ENABLED === 'true' &&
      /^[a-z0-9-]+-\d+$/.test(env.COS_BUCKET || '') &&
      /^[a-z]+-[a-z]+(?:-[a-z]+)?$/.test(env.COS_REGION || '')) {
    store = providedStore || require('./reference-store').createReferenceStore(env);
  }
  async function ensureReady() {
    if (!store) return false;
    if (now() >= readyUntil) {
      try { await store.health(); readyUntil = now() + 30000; }
      catch { return false; }
    }
    return true;
  }
  return async (req, res, send, url) => {
    const path = url.pathname;
    if (path !== '/api/reference/health' && !/^\/api\/reference\/[^/]+\/read$/.test(path)) return false;
    if (!store && path !== '/api/reference/health') return false;
    if (req.method === 'OPTIONS') { send(204); return true; }
    if (!['GET', 'HEAD'].includes(req.method)) { send(405, { error: { message: '请求方式不支持。' } }); return true; }
    if (!await ensureReady()) { send(503, { error: { message: '参考资料阅读服务尚未就绪。' } }); return true; }
    if (path === '/api/reference/health') { send(200, { status: 'ready' }); return true; }
    if (!req.headers.origin) { send(403, { error: { message: '请求缺少网站来源。' } }); return true; }
    const id = /^\/api\/reference\/([a-f0-9]{32})\/read$/.exec(path)?.[1];
    const file = id && findReference(id);
    if (!file) { send(404, { error: { message: '参考资料不存在或尚未上架。' } }); return true; }
    let range;
    if (req.method === 'GET') {
      const match = req.headers.range
        ? /^bytes=(\d+)-(\d*)$/.exec(String(req.headers.range).trim())
        : ['bytes=0-', '0', ''];
      const start = match && Number(match[1]);
      const end = match && match[2] ? Number(match[2]) : file.bytes - 1;
      if (!match || !Number.isSafeInteger(file.bytes) || file.bytes < 1 ||
          !Number.isSafeInteger(start) || start >= file.bytes ||
          !Number.isSafeInteger(end) || end < start) {
        send(416, { error: { message: '只支持有效的单段 PDF 范围读取。' } }); return true;
      }
      range = `bytes=${start}-${Math.min(end, start + CHUNK_BYTES - 1, file.bytes - 1)}`;
    }
    try {
      const object = req.method === 'HEAD'
        ? await store.headReferenceObject(file.key)
        : await store.getReferenceObject(file.key, range);
      res.statusCode = range ? 206 : 200;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent((file.title + '.pdf').replace(/[\\"\r\n]/g, '_').slice(0, 180))}`);
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Length, Content-Range, Content-Type, ETag');
      if (range) {
        const [, start, end] = /^bytes=(\d+)-(\d+)$/.exec(range);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${file.bytes}`);
      }
      if (object.etag) res.setHeader('ETag', object.etag);
      if (object.contentLength) res.setHeader('Content-Length', String(object.contentLength));
      if (req.method === 'HEAD') res.end(); else res.end(object.body);
    } catch {
      send(503, { error: { message: '云端文档暂不可用，请稍后重试。' } });
    }
    return true;
  };
}

module.exports = { createReferenceHandler };
