const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const homepage = read('index.html');
const layout = read('_layouts/default.html');
const categories = [...read('_data/note_categories.yml').matchAll(/^- name: (.+)$/gm)].map((match) => match[1].trim());
const notes = fs.readdirSync(path.join(root, 'notes')).filter((name) => name.endsWith('.md'));
const noteCategories = new Set(notes.map((name) => {
  const content = read(path.join('notes', name));
  const frontMatter = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(frontMatter, `${name} needs front matter`);
  const category = frontMatter[1].match(/^category:\s*"?([^"\r\n]+)"?\s*$/m);
  assert.ok(category, `${name} needs a category`);
  return category[1].trim();
}));

test('every public note category is available from the homepage', () => {
  assert.equal(categories.length, new Set(categories).size, 'category labels must be unique');
  assert.deepEqual(new Set(categories), noteCategories);
  assert.match(homepage, /site\.data\.note_categories/);
  assert.match(homepage, /item\.url contains '\/notes\/'/);
  assert.match(layout, /item\.url contains '\/notes\/'/);
  assert.match(homepage, /<details class="work-domain">/);
  assert.match(homepage, /href="\{\{ item\.url \| relative_url \}\}"/);
});

test('navigation targets real homepage sections, without a prescribed learning path', () => {
  for (const anchor of ['knowledge-areas', 'hardware-docs']) {
    assert.ok(homepage.includes(`id="${anchor}"`), `${anchor} section is missing`);
    assert.ok(layout.includes(`#${anchor}`), `${anchor} navigation link is missing`);
  }
  assert.match(homepage, /site\.data\.knowledge_tree/);
  assert.match(homepage, /leaf_topic\.url \| relative_url/);
  assert.doesNotMatch(homepage, /学习路径|嵌入式主线|课程笔记/);
});

test('hardware sidebar shows only the first two directory groups without deleting their content', () => {
  const tree = JSON.parse(read('_data/knowledge_tree.json'));
  assert.deepEqual(tree.slice(0, 2).map((root) => root.title), ['电子基础知识', '电源设计']);
  assert.equal(tree.length, 7, 'the full hardware directory must remain available to other pages');
  assert.match(layout, /for root in site\.data\.knowledge_tree limit:2/);
});

test('homepage search covers the published notes without indexing hardware pages', () => {
  const index = JSON.parse(read('notes-search.json'));
  assert.match(homepage, /data-note-search/);
  assert.match(homepage, /data-search-results/);
  assert.equal(index.length, notes.length);
  assert.ok(index.every(item => item.title && item.category && item.url.startsWith('/pengIEE/notes/') && item.content));
  assert.match(read('.github/workflows/pages.yml'), /node tools\/generate-note-search\.mjs/);
  assert.match(read('assets/home.js'), /fetch\(search\.dataset\.indexUrl/);
});

test('updates are generated at build time and login is on the homepage', () => {
  const workflow = read('.github/workflows/pages.yml');
  const updates = JSON.parse(read('_data/site_updates.json'));
  assert.match(workflow, /node tools\/generate-site-updates\.mjs/);
  assert.ok(updates.length > 0);
  assert.ok(updates.every(item => item.date && item.kind && item.title && item.url.startsWith('https://github.com/peng598/pengIEE/commit/')));
  assert.match(homepage, /data-home-login-form/);
  assert.match(homepage, /data-home-auth-status/);
  assert.doesNotMatch(layout, /<a[^>]+>账号登录<\/a>/);
  assert.match(read('assets/home.js'), /账号服务暂未开通/);
});
