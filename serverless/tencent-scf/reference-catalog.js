'use strict';

// The catalog is packaged with the function. Only IDs are accepted by the API;
// callers cannot choose an arbitrary COS object key.
let catalog;
try { catalog = require('./reference-library.json'); }
catch { catalog = require('../../assets/reference-library.json'); }
const files = new Map((catalog.files || []).filter((file) =>
  /^[a-f0-9]{32}$/.test(file.id) && file.published && typeof file.key === 'string'
).map((file) => [file.id, file]));

function findReference(id) {
  return files.get(id) || null;
}

module.exports = { findReference };
