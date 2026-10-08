import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = dirname(dirname(fileURLToPath(import.meta.url)));
const topics = JSON.parse(await readFile(join(siteDir, '_data', 'hardware_topics.json'), 'utf8'));

for (const topic of topics) {
  const relativePath = `${topic.url.replace(/^\/hardware\//, '').replace(/\/$/, '')}/index.md`;
  const filePath = join(siteDir, 'hardware', relativePath);
  const title = `${topic.branch} · ${topic.leaf}`;
  const quote = (value) => JSON.stringify(value);
  const frontMatter = [
    '---',
    'layout: hardware-topic',
    `title: ${quote(title)}`,
    `category: ${quote(topic.root)}`,
    `summary: ${quote(topic.summary)}`,
    `permalink: ${quote(topic.url)}`,
    `topic_root: ${quote(topic.root)}`,
    `topic_branch: ${quote(topic.branch)}`,
    '---',
    ''
  ].join('\n');
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, frontMatter, 'utf8');
}

console.log(`Generated ${topics.length} hardware topic pages.`);
