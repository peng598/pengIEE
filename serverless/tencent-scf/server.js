'use strict';

const http = require('node:http');

const MAX_BODY_BYTES = 180000;
const MAX_RESPONSE_BYTES = 1024 * 1024;
const DEFAULT_ORIGIN = 'https://peng598.github.io';

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function numberSetting(value, fallback, min, max) {
  if (!value) return fallback;
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new Error('Invalid numeric configuration');
  }
  return number;
}

function loadConfig(env) {
  const apiKey = (env.DEEPSEEK_API_KEY || '').trim();
  const model = (env.DEEPSEEK_MODEL || '').trim();
  const apiUrl = new URL(env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions');
  if (!apiKey || !model || /[\r\n]/.test(apiKey) || apiUrl.protocol !== 'https:' ||
      apiUrl.username || apiUrl.password || apiUrl.search || apiUrl.hash) {
    throw new Error('Invalid upstream configuration');
  }
  return {
    apiKey, model, apiUrl,
    timeoutMs: numberSetting(env.UPSTREAM_TIMEOUT_MS, 50000, 1000, 55000),
    maxTokens: numberSetting(env.MAX_OUTPUT_TOKENS, 2048, 1, 8192),
    maxConcurrent: numberSetting(env.MAX_CONCURRENT_REQUESTS, 2, 1, 10)
  };
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    const timer = setTimeout(() => finish(new HttpError(408, '请求内容接收超时。')), 10000);
    function finish(error, value) {
      clearTimeout(timer);
      req.removeListener('data', onData);
      req.removeListener('end', onEnd);
      req.removeListener('aborted', onAborted);
      req.removeListener('error', onError);
      if (error) {
        req.resume();
        reject(error);
      } else resolve(value);
    }
    function onData(chunk) {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) return finish(new HttpError(413, '请求内容过大，请缩短对话。'));
      chunks.push(chunk);
    }
    function onEnd() {
      let value;
      try { value = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
      catch { return finish(new HttpError(400, '请求必须是有效的 JSON。')); }
      finish(null, value);
    }
    function onAborted() { finish(new HttpError(400, '请求已取消。')); }
    function onError() { finish(new HttpError(400, '请求读取失败。')); }
    req.on('data', onData);
    req.on('end', onEnd);
    req.on('aborted', onAborted);
    req.on('error', onError);
  });
}

function getMessages(body) {
  if (!Array.isArray(body?.messages) || body.messages.length < 1 || body.messages.length > 12) {
    throw new HttpError(400, '请提供 1 至 12 条对话消息。');
  }
  const messages = body.messages.map((message) => {
    if (!message || !['system', 'user', 'assistant'].includes(message.role) ||
        typeof message.content !== 'string' || !message.content.trim() || message.content.length > 12000) {
      throw new HttpError(400, '对话消息格式不正确，或单条消息超过 12000 个字符。');
    }
    return { role: message.role, content: message.content };
  });
  if (!messages.some((message) => message.role === 'user')) {
    throw new HttpError(400, '请提供需要提问的内容。');
  }
  return messages;
}

async function readAnswer(response) {
  if (!response.ok) {
    await response.body?.cancel();
    if (response.status === 429) throw new HttpError(429, '模型服务请求过多或额度不足，请稍后再试。');
    if (response.status === 401 || response.status === 403) {
      throw new HttpError(502, '模型服务鉴权失败，请检查腾讯云中的 API Key 配置。');
    }
    throw new HttpError(502, '模型服务暂时不可用，请检查服务地址、模型 ID 或稍后重试。');
  }
  const reader = response.body?.getReader();
  if (!reader) throw new HttpError(502, '模型服务返回内容为空。');
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        throw new HttpError(502, '模型服务返回内容过大。');
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  let data;
  try { data = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new HttpError(502, '模型服务返回格式不正确。'); }
  const answer = data?.choices?.[0]?.message?.content;
  if (typeof answer !== 'string' || !answer.trim()) {
    throw new HttpError(502, '模型服务未返回回答，请稍后重试。');
  }
  // Only expose the answer, never upstream debug fields, headers or error bodies.
  return { choices: [{ message: { role: 'assistant', content: answer } }] };
}

function createServer({ env = process.env, fetchImpl = globalThis.fetch } = {}) {
  const origins = new Set((env.ALLOWED_ORIGINS || env.ALLOWED_ORIGIN || DEFAULT_ORIGIN)
    .split(',').map((origin) => origin.trim()).filter(Boolean));
  let config;
  try { config = loadConfig(env); } catch { /* Report configuration failure without revealing values. */ }
  let activeRequests = 0;

  const server = http.createServer(async (req, res) => {
    // Preserve a handled response even if a client disconnects while uploading.
    req.on('error', () => {});
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Vary', 'Origin');
    const send = (status, value) => {
      if (res.destroyed || res.writableEnded) return;
      res.statusCode = status;
      res.end(value === undefined ? undefined : JSON.stringify(value));
    };
    const origin = req.headers.origin;
    if (origin && !origins.has(origin)) {
      req.resume();
      return send(403, { error: { message: '该网站未获准调用此接口。' } });
    }
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Max-Age', '600');
    }

    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      if (pathname === '/health' && req.method === 'GET') {
        return send(config ? 200 : 503, { status: config ? 'ready' : 'configuration_required' });
      }
      if (!['/', '/chat', '/chat/completions'].includes(pathname)) throw new HttpError(404, '接口不存在。');
      if (req.method === 'OPTIONS') return send(204);
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST, OPTIONS');
        throw new HttpError(405, '请通过网站发送 POST 请求。');
      }
      if (!origin) throw new HttpError(403, '请求缺少网站来源。');
      if (!config) throw new HttpError(503, 'AI 服务配置未完成，请检查腾讯云函数环境变量。');
      if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) {
        throw new HttpError(415, '请求格式必须为 application/json。');
      }
      if (Number(req.headers['content-length']) > MAX_BODY_BYTES) {
        throw new HttpError(413, '请求内容过大，请缩短对话。');
      }
      const messages = getMessages(await readJson(req));
      if (res.destroyed) return;
      if (activeRequests >= config.maxConcurrent) throw new HttpError(429, 'AI 助手当前较忙，请稍后再试。');
      activeRequests += 1;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), config.timeoutMs);
      const onClose = () => controller.abort();
      res.once('close', onClose);
      try {
        const upstream = await fetchImpl(config.apiUrl, {
          method: 'POST',
          redirect: 'error',
          signal: controller.signal,
          headers: { 'Authorization': `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: config.model, messages, stream: false, temperature: 0.2, max_tokens: config.maxTokens
          })
        });
        send(200, await readAnswer(upstream));
      } catch (error) {
        if (controller.signal.aborted) throw new HttpError(504, '模型响应超时，请缩短问题后重试。');
        if (error instanceof HttpError) throw error;
        throw new HttpError(502, '暂时无法连接模型服务，请稍后再试。');
      } finally {
        clearTimeout(timer);
        res.removeListener('close', onClose);
        activeRequests -= 1;
      }
    } catch (error) {
      req.resume();
      const status = error instanceof HttpError ? error.status : 500;
      if (status === 413 || status === 408) res.setHeader('Connection', 'close');
      send(status, { error: { message: error instanceof HttpError ? error.message : 'AI 接口暂时不可用。' } });
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  return server;
}

if (require.main === module) {
  const port = Number(process.env.PORT || 9000);
  createServer().listen(port, '0.0.0.0', () => console.log(`PENGIEE AI proxy listening on ${port}`));
}

module.exports = { createServer, MAX_BODY_BYTES };
