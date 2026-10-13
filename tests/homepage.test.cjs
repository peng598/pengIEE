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
  assert.match(homepage, /<details class="category-card">/);
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
