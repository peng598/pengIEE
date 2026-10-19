const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const chrome = process.env.CHROME_PATH || (process.platform === 'win32'
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : '/usr/bin/google-chrome');

function fixturePdf(withOutline = true) {
  const stream = (page) => {
    const content = `BT /F1 24 Tf 50 700 Td (Page ${page}) Tj ET`;
    return `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`;
  };
  const objects = [
    withOutline ? '<< /Type /Catalog /Pages 2 0 R /Outlines 10 0 R /PageMode /UseOutlines >>'
      : '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R 5 0 R 7 0 R] /Count 3 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 9 0 R >> >> /Contents 4 0 R >>',
    stream(1),
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 9 0 R >> >> /Contents 6 0 R >>',
    stream(2),
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 9 0 R >> >> /Contents 8 0 R >>',
    stream(3),
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ];
  if (withOutline) objects.push(
    '<< /Type /Outlines /First 11 0 R /Last 12 0 R /Count 2 >>',
    '<< /Title (First section) /Parent 10 0 R /Next 12 0 R /Dest [3 0 R /Fit] >>',
    '<< /Title (Last section) /Parent 10 0 R /Prev 11 0 R /Dest [7 0 R /Fit] >>'
  );
  let pdf = '%PDF-1.7\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}

async function captureScreenshot(port, profile, mobile, target) {
  const child = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run',
    `--window-size=${mobile ? '390,844' : '1280,900'}`, `--user-data-dir=${profile}`,
    '--remote-debugging-port=0', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  try {
    const activePort = path.join(profile, 'DevToolsActivePort');
    for (let attempt = 0; attempt < 100 && !fs.existsSync(activePort); attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.ok(fs.existsSync(activePort), 'Chrome debugging port did not start');
    const debuggingPort = Number(fs.readFileSync(activePort, 'utf8').split('\n')[0]);
    const tabs = await (await fetch(`http://127.0.0.1:${debuggingPort}/json/list`)).json();
    const tab = tabs.find((item) => item.type === 'page');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', reject, { once: true });
    });
    let id = 0;
    const requests = new Map();
    ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      const request = requests.get(message.id);
      if (!request) return;
      requests.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
    });
    const call = (method, params = {}) => new Promise((resolve, reject) => {
      const next = ++id;
      requests.set(next, { resolve, reject });
      ws.send(JSON.stringify({ id: next, method, params }));
    });
    await call('Page.enable');
    await call('Page.navigate', { url: `http://127.0.0.1:${port}/${mobile ? '?mobile=1' : ''}` });
    let result = '';
    for (let attempt = 0; attempt < 200; attempt += 1) {
      const response = await call('Runtime.evaluate', {
        expression: "document.querySelector('#result')?.textContent",
        returnByValue: true
      });
      result = response.result?.value || '';
      if (result.startsWith('PASS') || result.startsWith('FAIL')) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!result.startsWith('PASS')) {
      const diagnostics = await call('Runtime.evaluate', {
        expression: `JSON.stringify({page:document.querySelector('[data-reader-number]')?.value,
          status:document.querySelector('[data-reader-status]')?.textContent,
          scroll:document.querySelector('[data-reader-stage]')?.scrollTop,
          slots:[...document.querySelectorAll('.pdf-page')].map(e=>({top:e.offsetTop,canvas:!!e.querySelector('canvas'),text:e.textContent}))})`,
        returnByValue: true
      });
      throw new Error(result + '\n' + diagnostics.result?.value);
    }
    const screenshot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(target, Buffer.from(screenshot.data, 'base64'));
    ws.close();
  } finally {
    child.kill();
    await new Promise((resolve) => child.once('close', resolve));
  }
}

const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/assets/pdf-reader.css"></head><body>
<dialog class="reference-reader" data-reference-reader>
<div class="reference-reader-shell">
<header class="reference-reader-header"><div class="reference-reader-heading">
<p>PDF READER</p><h2 data-reader-title></h2></div>
<div class="reference-reader-actions"><button data-reader-toc-toggle aria-expanded="false">目录</button><button data-reader-close>×</button></div></header>
<div class="pdf-toolbar"><div class="pdf-page-controls"><label>第 <input type="number" data-reader-number> /
<span data-reader-total>—</span> 页</label><button data-reader-jump>跳转</button></div>
<select data-reader-zoom><option value="fit">适合宽度</option><option value="1">100%</option></select>
<button data-reader-rotate>旋转</button></div>
<div class="pdf-reader-content"><button class="pdf-toc-backdrop" data-reader-toc-backdrop hidden></button>
<aside class="pdf-toc" data-reader-toc hidden><div class="pdf-toc-heading"><strong>文档目录</strong><button data-reader-toc-close>×</button></div>
<nav data-reader-outline></nav></aside>
<div class="pdf-stage" data-reader-stage><div class="pdf-notice" data-reader-notice hidden>
<strong data-reader-error-title></strong><p data-reader-error></p><button data-reader-retry>重试</button></div>
<div class="pdf-pages" data-reader-page></div></div></div>
<div class="pdf-status" data-reader-status></div></div></dialog>
<pre id="result">running</pre>
<script type="module">
import { createPdfReader } from '/assets/pdf-reader.js';
const reader = createPdfReader(document.querySelector('dialog'));
const one = (selector) => document.querySelector(selector);
const params = new URLSearchParams(location.search);
const noOutline = params.has('no-outline');
const wait = async (condition) => {
  for (let i = 0; i < 120; i++) {
    if (condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Timed out: ' + condition.toString());
};
try {
  reader.open({ title: 'Browser fixture', readUrl: location.origin + (noOutline ? '/fixture-no-outline.pdf' : '/fixture.pdf') });
  await wait(() => one('[data-reader-page] canvas'));
  if (one('[data-reader-total]').textContent !== '3') throw new Error('Page count');
  if (document.querySelectorAll('.pdf-page').length !== 3) throw new Error('Continuous slots');
  if (noOutline) await wait(() => one('[data-reader-outline]').textContent.includes('没有内置章节书签'));
  else await wait(() => one('[data-reader-outline] button'));
  const mobile = params.has('mobile');
  if (mobile && !one('[data-reader-toc]').hidden) throw new Error('Mobile contents should start closed');
  one('[data-reader-stage]').scrollTop = document.querySelectorAll('.pdf-page')[1].offsetTop;
  await wait(() => one('[data-reader-number]').value === '2' && document.querySelectorAll('.pdf-page')[1].querySelector('canvas'));
  one('[data-reader-number]').value = '3';
  one('[data-reader-jump]').click();
  await wait(() => one('[data-reader-number]').value === '3' && document.querySelectorAll('.pdf-page')[2].querySelector('canvas'));
  if (one('[data-reader-toc]').hidden) one('[data-reader-toc-toggle]').click();
  if (one('[data-reader-toc]').hidden) throw new Error('Contents toggle');
  if (noOutline) {
    one('[data-reader-number]').value = '1';
    one('[data-reader-jump]').click();
  } else {
    [...document.querySelectorAll('[data-reader-outline] button')].find((button) => button.textContent === 'First section').click();
  }
  await wait(() => one('[data-reader-number]').value === '1');
  if (mobile && !noOutline && !one('[data-reader-toc]').hidden) throw new Error('Mobile contents should close after jump');
  one('[data-reader-zoom]').value = '1';
  one('[data-reader-zoom]').dispatchEvent(new Event('change'));
  await wait(() => document.querySelectorAll('.pdf-page')[0].querySelector('canvas'));
  one('[data-reader-rotate]').click();
  await wait(() => document.querySelectorAll('.pdf-page')[0].querySelector('canvas'));
  one('[data-reader-zoom]').value = 'fit';
  one('[data-reader-zoom]').dispatchEvent(new Event('change'));
  await wait(() => document.querySelectorAll('.pdf-page')[0].querySelector('canvas'));
  if (one('[data-reader-download]')) throw new Error('Download control exposed');
  one('#result').textContent = 'PASS continuous scrolling, jump, outline, zoom, rotate';
} catch (error) {
  one('#result').textContent = 'FAIL ' + error.stack;
}
</script></body></html>`;

async function runReaderTest(mobile, noOutline = false) {
  const pdf = fixturePdf();
  const pdfWithoutOutline = fixturePdf(false);
  const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url?.startsWith('/?')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } else if (req.url === '/fixture.pdf') {
      res.writeHead(200, { 'Content-Type': 'application/pdf' });
      res.end(pdf);
    } else if (req.url === '/fixture-no-outline.pdf') {
      res.writeHead(200, { 'Content-Type': 'application/pdf' });
      res.end(pdfWithoutOutline);
    } else if (req.url?.startsWith('/assets/')) {
      const target = path.resolve(root, req.url.slice(1).split('?')[0]);
      if (!target.startsWith(path.join(root, 'assets') + path.sep) || !fs.existsSync(target)) {
        res.writeHead(404); res.end(); return;
      }
      const mime = target.endsWith('.css') ? 'text/css' : target.endsWith('.mjs') || target.endsWith('.js')
        ? 'text/javascript' : 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      fs.createReadStream(target).pipe(res);
    } else { res.writeHead(404); res.end(); }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'pengiee-reader-test-'));
  try {
    const port = server.address().port;
    const output = await new Promise((resolve, reject) => {
      const child = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run',
        `--window-size=${mobile ? '390,844' : '1280,900'}`,
        `--user-data-dir=${profile}`, '--virtual-time-budget=18000', '--dump-dom',
        `http://127.0.0.1:${port}/${mobile ? '?mobile=1' : noOutline ? '?no-outline=1' : ''}`], { windowsHide: true });
      let stdout = '', stderr = '';
      child.stdout.on('data', (chunk) => { stdout += chunk; });
      child.stderr.on('data', (chunk) => { stderr += chunk; });
      child.once('error', reject);
      child.once('close', (code) => code === 0 && stdout
        ? resolve(stdout) : reject(new Error(`Chrome exit ${code}: ${stderr.slice(-2000)}`)));
    });
    assert.match(output, /PASS continuous scrolling, jump, outline, zoom, rotate/);
    if (process.env.READER_SCREENSHOT && !noOutline) {
      const target = path.resolve(process.env.READER_SCREENSHOT + (mobile ? '-mobile.png' : '-desktop.png'));
      await captureScreenshot(port, profile, mobile, target);
      assert.ok(fs.existsSync(target));
    }
  } finally {
    server.close();
    if (profile.startsWith(path.join(os.tmpdir(), 'pengiee-reader-test-'))) {
      fs.rmSync(profile, { recursive: true, force: true });
    }
  }
}

test('continuous PDF reader works on desktop Chromium', { skip: !fs.existsSync(chrome) }, () => runReaderTest(false));
test('continuous PDF reader works on narrow Chromium', { skip: !fs.existsSync(chrome) }, () => runReaderTest(true));
test('PDF without bookmarks still offers page jumping', { skip: !fs.existsSync(chrome) }, () => runReaderTest(false, true));
