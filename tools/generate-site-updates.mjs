import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(root, process.argv[2] || '_data/site_updates.json');
const history = execFileSync('git', [
  'log', '-n', '80', '--date=short', '--pretty=format:%x1e%H%x09%ad%x09%s', '--name-only'
], { cwd: root, encoding: 'utf8' });

function titleFromFile(file) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) return path.basename(file, path.extname(file));
  const frontMatter = fs.readFileSync(fullPath, 'utf8').match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  const title = frontMatter?.[1].match(/^title:\s*(.+)$/m)?.[1].trim();
  return title?.replace(/^['"]|['"]$/g, '') || path.basename(file, path.extname(file));
}

function summarize(files, subject) {
  const notes = files.filter(file => /^notes\/.*\.md$/.test(file));
  if (notes.length) {
    const titles = notes.slice(0, 3).map(titleFromFile).join('、');
    return { kind: '笔记', title: `更新 ${titles}${notes.length > 3 ? ` 等 ${notes.length} 篇` : ''}` };
  }
  const hardware = files.filter(file => /^hardware\/.*\.(md|html)$/.test(file));
  if (hardware.length) {
    const titles = hardware.slice(0, 2).map(titleFromFile).join('、');
    return { kind: '硬件文档', title: `更新 ${titles}${hardware.length > 2 ? ` 等 ${hardware.length} 个页面` : ''}` };
  }
  if (files.some(file => file === 'formulas.md' || /^_data\/formula/.test(file) || /^assets\/formula/.test(file))) {
    return { kind: '公式', title: subject || '公式与计算内容更新' };
  }
  if (files.some(file => file === 'resources.md' || file === '_data/resources.yml' || /^assets\/reference-library/.test(file))) {
    return { kind: '资料', title: subject || '参考资料更新' };
  }
  if (files.some(file => file === 'index.html' || file === 'notes-search.json' || /^assets\/home\./.test(file))) {
    return { kind: '首页', title: subject || '首页与导航更新' };
  }
  return null;
}

const updates = [];
for (const block of history.split('\x1e').filter(Boolean)) {
  const [header, ...files] = block.trim().split(/\r?\n/).filter(Boolean);
  const [sha, date, ...subjectParts] = header.split('\t');
  if (!/^[0-9a-f]{40}$/.test(sha)) continue;
  const summary = summarize(files, subjectParts.join('\t').trim());
  if (!summary) continue;
  updates.push({
    date,
    kind: summary.kind,
    title: summary.title,
    url: `https://github.com/peng598/pengIEE/commit/${sha}`
  });
  if (updates.length === 4) break;
}

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(updates, null, 2) + '\n');
console.log(`Generated ${updates.length} site update entries.`);
