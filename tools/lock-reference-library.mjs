import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const siteDir = dirname(dirname(fileURLToPath(import.meta.url)));
const catalog = JSON.parse(await readFile(join(siteDir, 'assets', 'reference-library.json'), 'utf8'));
const bucket = process.env.COS_BUCKET || 'pengiee-1502711662';
const region = process.env.COS_REGION || 'ap-guangzhou';
const dryRun = process.argv.includes('--dry-run');
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number.parseInt(limitArg.slice('--limit='.length), 10) : Infinity;

if (!Number.isInteger(limit) && limit !== Infinity) throw new Error('--limit 必须是正整数。');
if (limit < 1) throw new Error('--limit 必须大于 0。');

const secretId = process.env.TENCENTCLOUD_SECRETID;
const secretKey = process.env.TENCENTCLOUD_SECRETKEY;
if (!dryRun && (!secretId || !secretKey)) {
  throw new Error('缺少本机环境变量 TENCENTCLOUD_SECRETID / TENCENTCLOUD_SECRETKEY。');
}

const files = catalog.files.filter((file) => file.published).slice(0, limit);
console.log(`目标桶：${bucket}（${region}）；将锁定 ${files.length} 个已发布对象。`);
if (dryRun) {
  for (const file of files.slice(0, 5)) console.log(`预览：${file.key}`);
  if (files.length > 5) console.log(`另有 ${files.length - 5} 份未展开显示。`);
  process.exit(0);
}

const { createRequire } = await import('node:module');
const require = createRequire(join(siteDir, 'serverless', 'tencent-scf', 'package.json'));
const COS = require('cos-nodejs-sdk-v5');
const cos = new COS({ SecretId: secretId, SecretKey: secretKey, Timeout: 20000 });
await cos.putBucketAcl({ Bucket: bucket, Region: region, ACL: 'private' });
console.log('桶 ACL 已设为 private；如果控制台仍有公共策略，请一并删除该策略。');
let completed = 0;
for (const file of files) {
  await cos.putObjectAcl({ Bucket: bucket, Region: region, Key: file.key, ACL: 'private' });
  completed += 1;
  if (completed % 20 === 0 || completed === files.length) console.log(`[${completed}/${files.length}] 已设为 private`);
}
console.log('完成：所有已发布参考资料对象均已设为 private。');
