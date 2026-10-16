// Read-only check of the public PDF response, not just HEAD (COS changes GET).
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const catalog = JSON.parse(await readFile(new URL('../assets/reference-library.json', import.meta.url), 'utf8'));
const url = catalog.files.find((file) => file.title === '硬件开发笔记-电阻').cosUrl;
if (!url) throw new Error('公开 COS 链接已移除；请通过 SCF /api/reference/{id}/read 验证受保护接口。');
const origin = 'https://peng598.github.io';
const preflight = await fetch(url, { method: 'OPTIONS', headers: {
  Origin: origin, 'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'range'
} });
assert.equal(preflight.status, 200, 'Range CORS preflight must succeed');
assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
const response = await fetch(url, { headers: { Origin: origin, Range: 'bytes=0-15' } });
assert.equal(response.status, 206, 'Cloud must support partial reads');
assert.equal(response.headers.get('access-control-allow-origin'), origin);
for (const header of ['content-range', 'accept-ranges', 'content-length']) {
  assert.ok(response.headers.get('access-control-expose-headers')?.toLowerCase().includes(header), `Expose ${header} to PDF.js`);
}
assert.ok(Buffer.from(await response.arrayBuffer()).toString().startsWith('%PDF-'));
console.log('PASS: public PDF bytes, range requests, and production-origin CORS.');
console.log('COS download disposition: ' + response.headers.get('content-disposition') + ' (handled by the canvas reader).');
