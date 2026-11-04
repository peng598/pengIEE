import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const errors = [];
const baseline = process.argv.find((argument) => argument.startsWith('--base='))?.slice(7);
const field = (source, key) => {
  const raw = source.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim() || '';
  if (raw.startsWith('"')) { try { return JSON.parse(raw); } catch { return raw; } }
  return raw.replace(/^'|'$/g, '');
};
const notes = fs.readdirSync(path.join(root, 'notes')).filter((name) => name.endsWith('.md')).map((name) => {
  const source = read(`notes/${name}`);
  const front = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!front) errors.push(`Missing front matter: ${name}`);
  return { file: `notes/${name}`, title: field(front?.[1] || '', 'title'), url: field(front?.[1] || '', 'permalink'), body: source.slice(front?.[0].length || 0) };
});
const urls = new Set(notes.map((note) => note.url));
if (urls.size !== notes.length) errors.push('Duplicate note permalinks');
for (const note of notes) if (!note.title || !note.url) errors.push(`Missing note identity: ${note.file}`);
for (const note of notes) {
  if ((note.body.match(/^```/gm) || []).length % 2) errors.push(`Unclosed code fence: ${note.file}`);
}
if (baseline) for (const note of notes) {
  const original = execFileSync('git', ['show', `${baseline}:${note.file}`], { cwd: root, encoding: 'utf8' });
  if (field(original, 'permalink') !== note.url) errors.push(`Changed permalink: ${note.file}`);
  const current = read(note.file);
  if (field(original, 'source') !== field(current, 'source')) errors.push(`Changed source attribution: ${note.file}`);
  for (const asset of new Set(original.match(/\/assets\/[^\s'"<>)}]+/g) || [])) {
    if (!current.includes(asset)) errors.push(`Original asset removed: ${note.file} -> ${asset}`);
  }
}
const topics = JSON.parse(read('_data/hardware_topics.json'));
const referenceFiles = new Map(JSON.parse(read('assets/reference-library.json')).files.map((file) => [file.id, file]));
const identities = new Set();
for (const topic of topics) {
  const identity = [topic.root, topic.branch, topic.leaf].join('/');
  if (identities.has(identity)) errors.push(`Duplicate topic: ${identity}`);
  identities.add(identity);
  if (urls.has(topic.url)) errors.push(`Duplicate URL: ${topic.url}`);
  urls.add(topic.url);
  if (!topic.content?.trim()) errors.push(`Empty topic: ${identity}`);
  if (!fs.existsSync(path.join(root, topic.url, 'index.md'))) errors.push(`Missing topic page: ${topic.url}`);
  for (const note of topic.notes || []) {
    if (!notes.some((entry) => entry.url === note.url)) errors.push(`Unknown related note: ${topic.url} -> ${note.url}`);
  }
  for (const image of topic.images || []) {
    if (image.src.startsWith('/') && !fs.existsSync(path.join(root, image.src))) errors.push(`Missing image: ${image.src}`);
  }
  for (const pdf of topic.pdfs || []) {
    if (pdf.reference_id && referenceFiles.get(pdf.reference_id)?.key !== pdf.catalog_key) errors.push(`Unmatched reference: ${topic.url} -> ${pdf.title}`);
  }
}
const tree = JSON.parse(read('_data/knowledge_tree.json'));
for (const group of tree.slice(0, 2)) {
  for (const branch of group.children) {
    for (const leaf of branch.children) {
      const identity = [group.title, branch.title, leaf].join('/');
      if (!identities.has(identity)) errors.push(`Navigation topic has no content: ${identity}`);
    }
  }
}
const related = JSON.parse(read('_data/related_notes.json'));
for (const group of related.groups) for (const url of group.notes) {
  if (!notes.some((note) => note.url === url)) errors.push(`Unknown related-group URL: ${url}`);
}
for (const file of fs.readdirSync(root).filter((name) => /\.(md|html)$/.test(name))) {
  const url = field(read(file), 'permalink');
  if (url) urls.add(url);
}
urls.add('/');
const checkLink = (sourceFile, raw) => {
  let target = raw.trim().replace(/^<|>$/g, '').replace(/\s+["'][\s\S]*$/, '');
  if (!target.startsWith('/') || target.startsWith('//')) return;
  target = target.split(/[?#]/)[0].replace(/^\/pengIEE(?=\/)/, '');
  try { target = decodeURIComponent(target); } catch { errors.push(`Invalid link encoding in ${sourceFile}`); return; }
  if (target && !urls.has(target) && !fs.existsSync(path.join(root, target))) errors.push(`Broken local link: ${sourceFile} -> ${target}`);
};
for (const entry of [...notes, ...topics.map((topic) => ({ file: topic.url, body: topic.content }))]) {
  const body = entry.body.replace(/```[\s\S]*?```/g, '');
  for (const match of body.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) checkLink(entry.file, match[1]);
  for (const match of body.matchAll(/\{\{\s*['"]([^'"]+)['"]\s*\|\s*relative_url\s*\}\}/g)) checkLink(entry.file, match[1]);
}
const report = {
  notes: notes.length,
  hardwareTopics: topics.length,
  totalNoteCharacters: notes.reduce((sum, note) => sum + note.body.length, 0),
  shortestNotes: notes.toSorted((a, b) => a.body.length - b.body.length).slice(0, 8).map((note) => ({ file: note.file, characters: note.body.length })),
  errors: [...new Set(errors)]
};
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
