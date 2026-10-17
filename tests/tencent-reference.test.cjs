const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../serverless/tencent-scf/server');
const { createReferenceStore } = require('../serverless/tencent-scf/reference-store');

const origin = 'https://peng598.github.io';
const file = require('../assets/reference-library.json').files.find(item => item.published);
const path = `/api/reference/${file.id}/read`;

async function fixture(t, options = {}) {
  const calls = [];
  const store = options.store || {
    async health() {},
    async getReferenceObject(key, range) {
      calls.push({ key, range });
      const [, start, end] = /^bytes=(\d+)-(\d+)$/.exec(range);
      const body = Buffer.from('%PDF-1.7\n').subarray(0, Number(end) - Number(start) + 1);
      return { body, contentLength: body.length, contentRange: `bytes ${start}-${end}/${file.bytes}` };
    },
    async headReferenceObject(key) {
      calls.push({ key, head: true });
      return { contentLength: file.bytes };
    }
  };
  const env = {
    REFERENCE_READ_ENABLED: 'true', COS_BUCKET: 'pengiee-1502711662',
    COS_REGION: 'ap-guangzhou', ...options.env
  };
  const server = createServer({ env, referenceStore: store });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (route, init = {}) => fetch(base + route, { headers: { Origin: origin, ...init.headers }, ...init });
  return { request, calls };
}

test('anonymous visitors can read private references in bounded ranges without an account service', async t => {
  const app = await fixture(t);
  assert.equal((await app.request('/api/reference/health')).status, 200);
  const read = await app.request(path, { headers: { Origin: origin, Range: 'bytes=0-5' } });
  assert.equal(read.status, 206);
  assert.equal(read.headers.get('content-type'), 'application/pdf');
  assert.match(read.headers.get('content-disposition'), /^inline/);
  assert.equal(read.headers.get('content-range'), `bytes 0-5/${file.bytes}`);
  assert.equal(await read.text(), '%PDF-1');
  assert.deepEqual(app.calls[0], { key: file.key, range: 'bytes=0-5' });
  const initial = await app.request(path);
  assert.equal(initial.status, 206);
  assert.equal(initial.headers.get('accept-ranges'), 'bytes');
  assert.equal(initial.headers.get('content-range'), `bytes 0-262143/${file.bytes}`);
  assert.equal(app.calls[1].range, 'bytes=0-262143');
  assert.equal((await app.request(path, { method: 'HEAD' })).status, 200);
  assert.equal((await app.request('/api/admin/reference/' + file.id + '/download')).status, 503);
});

test('reader rejects other origins, unknown IDs and oversized or invalid ranges', async t => {
  const app = await fixture(t);
  assert.equal((await app.request(path, { headers: { Origin: 'https://example.com' } })).status, 403);
  assert.equal((await app.request(path, { headers: { Origin: '' } })).status, 403);
  assert.equal((await app.request('/api/reference/' + '0'.repeat(32) + '/read')).status, 404);
  assert.equal((await app.request(path, { headers: { Origin: origin, Range: 'bytes=0-99999999' } })).status, 206);
  assert.equal(app.calls[0].range, 'bytes=0-262143');
  assert.equal((await app.request(path, { headers: { Origin: origin, Range: `bytes=${file.bytes}-` } })).status, 416);
  assert.equal((await app.request(path, { headers: { Origin: origin, Range: 'bytes=0-5,9-10' } })).status, 416);
});

test('reader remains unavailable until private COS health succeeds', async t => {
  const disabled = await fixture(t, { env: { REFERENCE_READ_ENABLED: 'false' } });
  assert.equal((await disabled.request('/api/reference/health')).status, 503);
  const unsafe = await fixture(t, { store: { health: async () => { throw new Error('public bucket'); } } });
  assert.equal((await unsafe.request('/api/reference/health')).status, 503);
  assert.equal((await unsafe.request(path)).status, 503);
});

test('missing COS bucket policy may be reported as numeric 404', async () => {
  let policyError = Object.assign(new Error('missing policy'), { code: 404, statusCode: 404 });
  class COS {
    async getBucketAcl() { return { Grants: [] }; }
    async getBucketPolicy() { throw policyError; }
  }
  const store = createReferenceStore({ COS_BUCKET: 'pengiee-1502711662', COS_REGION: 'ap-guangzhou' }, { COS });
  await store.health();
  policyError = Object.assign(new Error('denied'), { code: 403, statusCode: 403 });
  await assert.rejects(() => store.health(), /denied/);
});
