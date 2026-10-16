import { createReadStream } from 'node:fs';
import { readFile, rename, stat, writeFile } from 'node:fs/promises';
import { createHmac, createHash } from 'node:crypto';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

const siteDir = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceRoot = process.env.HARDWARE_DOCUMENTS_DIR || 'E:\\硬件文档';
const manifestPath = join(siteDir, 'assets', 'reference-library.json');
const tempManifestPath = `${manifestPath}.tmp`;
const allowedCategories = new Set([
  '01.元器件基础',
  '02.电源设计',
  '03.大厂技术资料',
  '04.优质电子书'
]);
const bucket = process.env.COS_BUCKET || 'pengiee-1502711662';
const region = process.env.COS_REGION || 'ap-guangzhou';
const apiHost = `${bucket}.cos.${region}.myqcloud.com`;
const dryRun = process.argv.includes('--dry-run');
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number.parseInt(limitArg.slice('--limit='.length), 10) : Infinity;

function encodeRFC3986(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

function encodeObjectKey(key) {
  return key.split('/').map(encodeRFC3986).join('/');
}

function sha1(value) {
  return createHash('sha1').update(value).digest('hex');
}

function signPut(signingPath, secretId, secretKey, contentType) {
  const now = Math.floor(Date.now() / 1000);
  const keyTime = `${now - 60};${now + 3600}`;
  // COS v5 uses the lowercase hexadecimal HMAC result as the next HMAC key.
  const signKey = createHmac('sha1', secretKey).update(keyTime).digest('hex');
  const headers = {
    'content-type': contentType,
    host: apiHost,
    'x-cos-acl': 'private'
  };
  const headerNames = Object.keys(headers).sort();
  const canonicalHeaders = headerNames
    .map((name) => `${name}=${encodeRFC3986(headers[name].trim())}`)
    .join('&');
  const httpString = `put\n${signingPath}\n\n${canonicalHeaders}\n`;
  const stringToSign = `sha1\n${keyTime}\n${sha1(httpString)}\n`;
  const signature = createHmac('sha1', signKey).update(stringToSign).digest('hex');
  const authorization = [
    'q-sign-algorithm=sha1',
    `q-ak=${secretId}`,
    `q-sign-time=${keyTime}`,
    `q-key-time=${keyTime}`,
    `q-header-list=${headerNames.join(';')}`,
    'q-url-param-list=',
    `q-signature=${signature}`
  ].join('&');
  return { headers, authorization };
}

function putObject(requestPath, signingPath, filePath, size, secretId, secretKey) {
  const contentType = 'application/pdf';
  const { headers: signedHeaders, authorization } = signPut(signingPath, secretId, secretKey, contentType);
  const headers = {
    ...signedHeaders,
    authorization,
    'content-length': size
  };

  return new Promise((resolve, reject) => {
    const request = https.request({ hostname: apiHost, method: 'PUT', path: requestPath, headers, timeout: 600_000 }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        if (response.statusCode >= 200 && response.statusCode < 300) resolve();
        else reject(new Error(`COS PUT ${response.statusCode}: ${body.slice(0, 700)}`));
      });
    });
    request.on('timeout', () => request.destroy(new Error('COS 上传超时')));
    request.on('error', reject);
    const stream = createReadStream(filePath);
    stream.on('error', (error) => request.destroy(error));
    stream.pipe(request);
  });
}

async function uploadWithRetry(file, requestPath, signingPath, sourcePath, secretId, secretKey) {
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await putObject(requestPath, signingPath, sourcePath, file.bytes, secretId, secretKey);
      return;
    } catch (error) {
      const transient = ['ECONNRESET', 'ETIMEDOUT', 'EPIPE', 'EAI_AGAIN'].includes(error.code)
        || /COS 上传超时/.test(error.message)
        || /^COS PUT (429|500|502|503|504):/.test(error.message)
        || /HTTP (429|500|502|503|504)/.test(error.message);
      if (!transient || attempt === maxAttempts) throw error;
      const delayMs = 1000 * (2 ** (attempt - 1));
      console.warn(`[重试] ${file.key}：网络或服务临时错误，${delayMs / 1000} 秒后重试（${attempt + 1}/${maxAttempts}）。`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

let persistQueue = Promise.resolve();
function persist(catalog) {
  persistQueue = persistQueue
    .then(() => writeFile(tempManifestPath, `${JSON.stringify(catalog)}\n`, 'utf8'))
    .then(() => rename(tempManifestPath, manifestPath));
  return persistQueue;
}

const catalog = JSON.parse(await readFile(manifestPath, 'utf8'));
const publicFiles = catalog.files.filter((file) => allowedCategories.has(file.category));
if (publicFiles.length !== catalog.files.length || catalog.categories.some((category) => !allowedCategories.has(category.title))) {
  throw new Error('索引中包含图片范围以外的目录；已停止，未上传任何文件。');
}
if (!Number.isInteger(limit) && limit !== Infinity) throw new Error('--limit 必须是正整数。');
if (limit < 1) throw new Error('--limit 必须大于 0。');

const pending = publicFiles.filter((file) => !file.published).slice(0, limit);
let totalBytes = 0;
for (const file of pending) {
  const sourcePath = join(sourceRoot, ...file.key.split('/'));
  const sourceStat = await stat(sourcePath);
  if (sourceStat.size !== file.bytes) throw new Error(`源文件大小与索引不符：${file.key}`);
  if (sourceStat.size > 5 * 1024 ** 3) throw new Error(`单个文件超过 COS 单次上传上限：${file.key}`);
  totalBytes += sourceStat.size;
}

console.log(`目标桶：${bucket}（${region}）`);
console.log(`范围：01–04；本次待上传 ${pending.length} 份，${(totalBytes / 1024 ** 3).toFixed(2)} GiB`);
if (dryRun) {
  for (const file of pending.slice(0, 5)) console.log(`预览：${file.key}（${file.bytes} bytes）`);
  if (pending.length > 5) console.log(`另有 ${pending.length - 5} 份未展开显示。`);
  process.exit(0);
}

const secretId = process.env.TENCENTCLOUD_SECRETID;
const secretKey = process.env.TENCENTCLOUD_SECRETKEY;
if (!secretId || !secretKey) throw new Error('缺少本机环境变量 TENCENTCLOUD_SECRETID / TENCENTCLOUD_SECRETKEY。');
if (!pending.length) {
  console.log('所有索引文件都已有 COS 链接，无需重复上传。');
  process.exit(0);
}

let completed = 0;
let nextIndex = 0;
let firstError = null;
const workers = Array.from({ length: Math.min(3, pending.length) }, async () => {
  while (!firstError) {
    const index = nextIndex++;
    if (index >= pending.length) return;
    const file = pending[index];
    const sourcePath = join(sourceRoot, ...file.key.split('/'));
    const requestPath = `/${encodeObjectKey(file.key)}`;
    // COS canonicalizes the object pathname as the raw key; the HTTP request path is URL-encoded.
    const signingPath = `/${file.key}`;
    try {
      await uploadWithRetry(file, requestPath, signingPath, sourcePath, secretId, secretKey);
      file.published = true;
      file.publicationStatus = '已上线';
      completed += 1;
      console.log(`[${completed}/${pending.length}] 已上传并验证：${file.key}`);
      if (completed % 5 === 0 || completed === pending.length) await persist(catalog);
    } catch (error) {
      firstError = new Error(`${file.key}：${error.message}`);
      return;
    }
  }
});

await Promise.all(workers);
if (completed % 5 !== 0 && completed > 0) await persist(catalog);
if (firstError) throw firstError;
console.log(`完成：${completed} 份文件已上传到私有 COS；网页将通过受保护接口在线阅读。`);
