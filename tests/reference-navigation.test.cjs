const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const catalog = JSON.parse(read('assets/reference-library.json'));
const technicalCategory = '03.大厂技术资料';

test('reference sidebar omits the publishing note and shows the source-based technical directory', () => {
  const page = read('resources.md');
  const script = read('assets/reference-library.js');
  assert.doesNotMatch(page, /发布说明|reference-privacy-note/);
  assert.match(script, /title === technicalCategory \? '技术资料'/);
  assert.match(script, /renderTechnicalDirectory\(state\.catalog\.files\.filter/);
  assert.match(script, /file\.folder\.split\('\/'\)/);
});

test('technical PDF index retains original COS keys and exact source folder paths', () => {
  const files = catalog.files.filter((file) => file.category === technicalCategory);
  assert.equal(files.length, catalog.categories.find((category) => category.title === technicalCategory).pdfs);
  const firstLevel = new Set();
  for (const file of files) {
    assert.ok(file.key.startsWith(`${technicalCategory}/`));
    assert.equal(file.folder, file.key.slice(technicalCategory.length + 1).split('/').slice(0, -1).join('/'));
    firstLevel.add(file.folder.split('/')[0]);
  }
  assert.deepEqual(firstLevel, new Set([
    '大厂参考设计方案', '华硕', '华为', '华为海思', '上海贝尔', '上汽', '中兴', 'ADI', 'CYPRESS', 'microchip'
  ]));
});
