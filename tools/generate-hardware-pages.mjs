import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = dirname(dirname(fileURLToPath(import.meta.url)));
const topicsPath = join(siteDir, '_data', 'hardware_topics.json');
const existingTopics = JSON.parse(await readFile(topicsPath, 'utf8'));
const powerTopics = JSON.parse(await readFile(join(siteDir, '_data', 'power_topics_expansion.json'), 'utf8'));
const topics = [...existingTopics.filter((topic) => topic.root !== '电源设计'), ...powerTopics];
await writeFile(topicsPath, `${JSON.stringify(topics, null, 2)}\n`, 'utf8');

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
  let body = '';
  try {
    const existing = await readFile(filePath, 'utf8');
    const header = existing.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n)?/);
    if (!header) throw new Error(`Refusing to overwrite a page without front matter: ${filePath}`);
    body = existing.slice(header[0].length);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await writeFile(filePath, frontMatter + body, 'utf8');
}

console.log(`Generated ${topics.length} hardware topic pages.`);
