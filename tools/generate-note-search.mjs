import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const notesDir = path.join(root, 'notes');
const config = fs.readFileSync(path.join(root, '_config.yml'), 'utf8');
const baseurl = config.match(/^baseurl:\s*(\S+)\s*$/m)?.[1]?.replace(/^['"]|['"]$/g, '') || '';

function field(frontMatter, name) {
  const raw = frontMatter.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1]?.trim() || '';
  if (raw.startsWith('"') && raw.endsWith('"')) {
    try { return JSON.parse(raw); } catch { return raw.slice(1, -1); }
  }
  if (raw.startsWith("'") && raw.endsWith("'")) return raw.slice(1, -1).replace(/''/g, "'");
  return raw;
}

const notes = fs.readdirSync(notesDir).filter(name => name.endsWith('.md')).map(name => {
  const source = fs.readFileSync(path.join(notesDir, name), 'utf8');
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/);
  if (!match) throw new Error(`${name} has no front matter`);
  const frontMatter = match[1];
  const title = field(frontMatter, 'title');
  const category = field(frontMatter, 'category');
  const permalink = field(frontMatter, 'permalink');
  if (!title || !category || !/^\/notes\/[^?#]+\/$/.test(permalink)) {
    throw new Error(`${name} has an incomplete public note identity`);
  }
  return {
    title,
    category,
    summary: field(frontMatter, 'summary'),
    url: baseurl + permalink,
    content: source.slice(match[0].length)
  };
}).sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));

const output = path.join(root, 'notes-search.json');
fs.writeFileSync(output, JSON.stringify(notes) + '\n');
console.log(`Indexed ${notes.length} public notes.`);
