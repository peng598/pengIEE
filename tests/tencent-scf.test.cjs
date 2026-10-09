const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createServer, MAX_BODY_BYTES } = require('../serverless/tencent-scf/server');

const origin = 'https://peng598.github.io';
const env = { DEEPSEEK_API_KEY: 'test-only-secret', DEEPSEEK_MODEL: 'test-model' };
const payload = { messages: [{ role: 'user', content: '解释电容的作用' }] };
const answer = () => Response.json({ choices: [{ message: { content: '电容可以储存电荷。' } }], debug: 'private' });

async function fixture(t, overrides = {}) {
  const server = createServer({ env, fetchImpl: async () => answer(), ...overrides });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  const base = `http://127.0.0.1:${server.address().port}`;
  return {
    base,
    post: (body = payload, options = {}) => fetch(`${base}/chat`, {
      method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify(body), ...options
    })
  };
}

test('forwards article context but uses only server-side model, key and output limit', async (t) => {
  let forwarded;
  const app = await fixture(t, { fetchImpl: async (url, options) => {
    forwarded = { url: String(url), ...options, body: JSON.parse(options.body) };
    return answer();
  } });
  const messages = [{ role: 'system', content: '笔记摘录：电容滤波' }, ...payload.messages];
  const response = await app.post({ messages, model: 'attacker-model', stream: true, max_tokens: 999999, apiUrl: 'https://evil.example' });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(forwarded.url, 'https://api.deepseek.com/chat/completions');
  assert.equal(forwarded.headers.Authorization, `Bearer ${env.DEEPSEEK_API_KEY}`);
  assert.equal(forwarded.redirect, 'error');
  assert.deepEqual(forwarded.body, { model: 'test-model', messages, stream: false, temperature: 0.2, max_tokens: 2048 });
  assert.deepEqual(await response.json(), { choices: [{ message: { role: 'assistant', content: '电容可以储存电荷。' } }] });
});

test('preflight succeeds without a configured key; other and missing origins cannot call AI', async (t) => {
  let calls = 0;
  const app = await fixture(t, { env: {}, fetchImpl: async () => { calls++; return answer(); } });
  const preflight = await fetch(`${app.base}/chat`, {
    method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'POST' }
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-headers'), 'Content-Type');
  for (const headers of [{ Origin: 'https://evil.example' }, {}]) {
    const response = await app.post(payload, { headers });
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('access-control-allow-origin'), null);
  }
  assert.equal(calls, 0);
});

test('exact origin list allows explicit local development origin only', async (t) => {
  const app = await fixture(t, { env: { ...env, ALLOWED_ORIGINS: `${origin},http://127.0.0.1:4173` } });
  for (const [source, status] of [['http://127.0.0.1:4173', 200], [`${origin}.evil.example`, 403]]) {
    const response = await app.post(payload, { headers: { Origin: source, 'Content-Type': 'application/json' } });
    assert.equal(response.status, status);
  }
});

test('health reports configuration only; missing or unsafe config never calls upstream', async (t) => {
  for (const invalid of [{}, { ...env, DEEPSEEK_MODEL: '' }, { ...env, DEEPSEEK_API_URL: 'http://example.com' },
    { ...env, DEEPSEEK_API_URL: 'https://example.com?key=secret' }, { ...env, MAX_OUTPUT_TOKENS: '-1' }]) {
    const app = await fixture(t, { env: invalid, fetchImpl: async () => assert.fail('must not call upstream') });
    assert.equal((await app.post()).status, 503);
    const health = await fetch(`${app.base}/health`);
    assert.equal(health.status, 503);
    assert.deepEqual(await health.json(), { status: 'configuration_required' });
  }
  const app = await fixture(t);
  assert.deepEqual(await (await fetch(`${app.base}/health`)).json(), { status: 'ready' });
});

test('invalid JSON, messages, routes and methods fail before upstream request', async (t) => {
  const app = await fixture(t, { fetchImpl: async () => assert.fail('must not call upstream') });
  assert.equal((await app.post(payload, { body: '{bad json' })).status, 400);
  assert.equal((await app.post(payload, { headers: { Origin: origin, 'Content-Type': 'text/plain' } })).status, 415);
  for (const body of [null, {}, { messages: [] }, { messages: Array(13).fill(payload.messages[0]) },
    { messages: [{ role: 'tool', content: 'bad' }] }, { messages: [{ role: 'system', content: 'no user' }] },
    { messages: [{ role: 'user', content: ' ' }] }, { messages: [{ role: 'user', content: 'a'.repeat(12001) }] }]) {
    assert.equal((await app.post(body)).status, 400);
  }
  assert.equal((await fetch(`${app.base}/`)).status, 405);
  assert.equal((await fetch(`${app.base}/wrong`)).status, 404);
});

test('enforces actual byte limit on chunked requests without Content-Length', async (t) => {
  const app = await fixture(t, { fetchImpl: async () => assert.fail('must not call upstream') });
  assert.equal((await app.post({ padding: 'x'.repeat(MAX_BODY_BYTES) })).status, 413);
  const response = await new Promise((resolve, reject) => {
    const request = http.request(`${app.base}/chat`, {
      method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    request.on('error', reject);
    request.write('a'.repeat(100000));
    request.end('b'.repeat(100000));
  });
  assert.equal(response.status, 413);
  assert.match(response.body, /请求内容过大/);
});

test('upstream errors and redirects are sanitized, never returned verbatim', async (t) => {
  for (const status of [302, 400, 401, 403, 429, 500]) {
    const app = await fixture(t, { fetchImpl: async () => new Response(`secret ${env.DEEPSEEK_API_KEY}`, { status }) });
    const response = await app.post();
    assert.equal(response.status, status === 429 ? 429 : 502);
    assert.equal(response.headers.get('access-control-allow-origin'), origin);
    assert.doesNotMatch(await response.text(), /test-only-secret/);
  }
  const app = await fixture(t, { fetchImpl: async () => { throw new Error(env.DEEPSEEK_API_KEY); } });
  const response = await app.post();
  assert.equal(response.status, 502);
  assert.doesNotMatch(await response.text(), /test-only-secret/);
});

test('invalid, empty and oversized upstream responses fail safely', async (t) => {
  for (const raw of ['not JSON', '{}', JSON.stringify({ choices: [{ message: { content: '' } }] }), 'a'.repeat(1024 * 1024 + 1)]) {
    const app = await fixture(t, { fetchImpl: async () => new Response(raw) });
    assert.equal((await app.post()).status, 502);
  }
});

test('timeout aborts stalled upstream and restores the concurrency slot', async (t) => {
  let calls = 0;
  const app = await fixture(t, { env: { ...env, UPSTREAM_TIMEOUT_MS: '1000', MAX_CONCURRENT_REQUESTS: '1' },
    fetchImpl: async (_url, { signal }) => {
      if (++calls > 1) return answer();
      return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }));
    }
  });
  const response = await app.post();
  assert.equal(response.status, 504);
  assert.match(await response.text(), /超时/);
  assert.equal((await app.post()).status, 200);
});

test('timeout covers upstream response body, not just response headers', async (t) => {
  const app = await fixture(t, { env: { ...env, UPSTREAM_TIMEOUT_MS: '1000' },
    fetchImpl: async (_url, { signal }) => new Response(new ReadableStream({
      start(controller) { signal.addEventListener('abort', () => controller.error(new Error('aborted')), { once: true }); }
    }))
  });
  assert.equal((await app.post()).status, 504);
});

test('concurrent request limit rejects excess traffic and recovers after success', async (t) => {
  let release, started;
  const pending = new Promise((resolve) => { release = resolve; });
  const entered = new Promise((resolve) => { started = resolve; });
  const app = await fixture(t, { env: { ...env, MAX_CONCURRENT_REQUESTS: '1' },
    fetchImpl: async () => { started(); await pending; return answer(); }
  });
  const first = app.post();
  await entered;
  try { assert.equal((await app.post()).status, 429); }
  finally { release(); }
  assert.equal((await first).status, 200);
  assert.equal((await app.post()).status, 200);
});
