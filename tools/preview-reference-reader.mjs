// Focused preview of the actual reader components, without requiring Ruby.
// Only the published catalog's PDFs are proxied, on the loopback interface.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = JSON.parse(await readFile(resolve(root, 'assets/reference-library.json'), 'utf8'));
const published = new Map(catalog.files.map((file, index) => [String(index), file.cosUrl]));
const previewCatalog = { ...catalog, files: catalog.files.map((file, index) => ({
  ...file, cosUrl: file.cosUrl ? `/__cos/${index}` : null
})) };
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.wasm': 'application/wasm', '.pdf': 'application/pdf' };

createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    res.setHeader('Cache-Control', 'no-store');
    if (pathname === '/resources/' || pathname === '/') {
      let source = await readFile(resolve(root, 'resources.md'), 'utf8');
      source = source.replace(/^---[\s\S]*?---\s*/, '').replace(/\{% if site.data.resources.size > 0 %\}[\s\S]*?\{% endif %\}/, '')
        .replace(/\{% assign[^%]*%\}/g, '').replace(/\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}/g, '$1');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PDF reader preview</title><link rel="stylesheet" href="/assets/site.css"><main style="max-width:1120px;padding:16px;margin:auto">' + source + '</main></html>');
    }
    if (pathname === '/assets/reference-library.json') {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(previewCatalog));
    }
    if (pathname.startsWith('/__cos/')) {
      const url = published.get(pathname.slice('/__cos/'.length));
      if (!url) { res.writeHead(404); return res.end(); }
      const aborter = new AbortController();
      res.on('close', () => aborter.abort());
      const upstream = await fetch(url, { headers: {
        Origin: 'https://peng598.github.io', ...(req.headers.range ? { Range: req.headers.range } : {})
      }, signal: aborter.signal });
      for (const name of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'content-disposition']) {
        if (upstream.headers.has(name)) res.setHeader(name, upstream.headers.get(name));
      }
      res.writeHead(upstream.status);
      await pipeline(Readable.fromWeb(upstream.body), res);
      return;
    }
    const file = resolve(root, '.' + decodeURIComponent(pathname));
    if (!pathname.startsWith('/assets/') || !file.startsWith(resolve(root, 'assets') + sep)) {
      res.writeHead(404); return res.end();
    }
    res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch (error) {
    if (!res.headersSent && !res.destroyed) { res.writeHead(404); res.end('Not found'); }
    else res.destroy();
  }
}).listen(4186, '127.0.0.1', () => console.log('Reader preview: http://127.0.0.1:4186/resources/'));
