const { test } = require('node:test');
const assert = require('node:assert/strict');
const catalog = require('../_data/formula_catalog.json');
const guides = require('../_data/formula_guides.json');
const expansion = require('../_data/formula_expansion.json');
const deepGuides = require('../_data/formula_deep.json');

test('all original and expanded formulas have useful guidance', () => {
  assert.deepEqual(expansion.map((domain) => domain.id), catalog.map((domain) => domain.id));
  const originalIds = catalog.flatMap((domain) => domain.formulas.map((formula) => formula.id));
  const newFormulas = expansion.flatMap((domain) => domain.formulas.map((formula) => ({ ...formula, domainId: domain.id })));
  const ids = [...originalIds, ...newFormulas.map((formula) => formula.id)];
  assert.equal(new Set(ids).size, ids.length, 'formula IDs must be unique');
  assert.equal(ids.length, 288);
  assert.deepEqual(Object.keys(guides).sort(), originalIds.sort());

  for (const id of originalIds) {
    assert.equal(guides[id].length, 4, `${id} needs purpose, parameters, scenario and usage`);
    for (const field of guides[id]) {
      assert.equal(typeof field, 'string', id);
      assert.ok(field.trim().length >= 8, `${id} has an empty or incomplete guide field`);
    }
  }

  for (const formula of newFormulas) {
    assert.ok(formula.id.startsWith(`${formula.domainId}.`), formula.id);
    assert.ok(formula.title && formula.expression && formula.conditions, formula.id);
    assert.equal(formula.guide.length, 4, formula.id);
    for (const index of [0, 1, 3]) {
      assert.ok(formula.guide[index]?.trim().length >= 8, `${formula.id} missing required explanation ${index}`);
    }
    if (formula.guide[2] !== null) assert.ok(formula.guide[2]?.trim().length >= 8, formula.id);
    if (formula.deep) {
      for (const [label, text] of formula.deep) {
        assert.ok(label?.trim() && text?.trim().length >= 16, `${formula.id} has an incomplete deep explanation`);
      }
    }
  }

  for (const [id, sections] of Object.entries(deepGuides)) {
    assert.ok(originalIds.includes(id), `${id} has no matching original formula`);
    assert.ok(sections.length >= 1, id);
    for (const [label, text] of sections) {
      assert.ok(label?.trim() && text?.trim().length >= 16, `${id} has an incomplete deep explanation`);
    }
  }
});
