const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

test('private PDF ranges stay bounded and retry transient failures', async () => {
  const { protectedTransport } = await import(
    pathToFileURL(path.resolve(__dirname, '../assets/pdf-reader.js')).href
  );
  const chunk = 262144;
  const total = chunk * 10;
  const received = new Map();
  const failures = [];
  let chunks = 0;
  let active = 0, peak = 0;
  const attempts = new Map();
  const originalFetch = global.fetch;
  global.fetch = async (_url, options) => {
    const [, begin, last] = /^bytes=(\d+)-(\d+)$/.exec(options.headers.Range);
    const end = Number(last) + 1;
    const count = (attempts.get(Number(begin)) || 0) + 1;
    attempts.set(Number(begin), count);
    active += 1;
    peak = Math.max(peak, active);
    try {
      await new Promise((resolve) => setTimeout(resolve, 8));
      if (active > 2 || (Number(begin) === chunk * 3 && count === 1)) {
        throw new TypeError('transient network failure');
      }
      return {
        status: 206,
        headers: new Headers({ 'Content-Range': `bytes ${begin}-${last}/${total}` }),
        arrayBuffer: async () => new Uint8Array(end - Number(begin)).buffer
      };
    } finally { active -= 1; }
  };
  try {
    class Transport {
      constructor(length, initialData) {
        assert.equal(length, total);
        assert.equal(initialData.length, chunk);
      }
      onDataRange(begin, data) { received.set(begin, data.length); }
    }
    const transport = await protectedTransport(
      { PDFDataRangeTransport: Transport },
      { readUrl: 'https://example.test/api/reference/0123456789abcdef0123456789abcdef/read', bytes: total },
      (error) => failures.push(error),
      () => { chunks += 1; }
    );
    for (let begin = chunk; begin < total; begin += chunk) {
      transport.requestDataRange(begin, begin + chunk);
    }
    for (let attempt = 0; attempt < 200 && received.size < 9; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    assert.equal(received.size, 9);
    assert.equal(failures.length, 0);
    assert.equal(chunks, 10);
    assert.ok(peak <= 2, `peak concurrency was ${peak}`);
    assert.equal(attempts.get(chunk * 3), 2);
    transport.abort();
  } finally { global.fetch = originalFetch; }
});
