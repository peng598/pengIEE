const { test } = require('node:test');
const assert = require('node:assert/strict');
const catalog = require('../_data/formula_catalog.json');
const guides = require('../_data/formula_guides.json');

test('every catalog formula has one complete guide', () => {
  const ids = catalog.flatMap((domain) => domain.formulas.map((formula) => formula.id));
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(Object.keys(guides).sort(), ids.sort());

  for (const id of ids) {
    assert.equal(guides[id].length, 4, `${id} needs purpose, parameters, scenario and usage`);
    for (const field of guides[id]) {
      assert.equal(typeof field, 'string', id);
      assert.ok(field.trim().length >= 8, `${id} has an empty or incomplete guide field`);
    }
  }
});
