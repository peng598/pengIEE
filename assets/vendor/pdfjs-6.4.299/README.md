PDF.js 6.4.299, Apache-2.0 (see LICENSE).

Source: https://registry.npmjs.org/pdfjs-dist/-/pdfjs-dist-6.4.299.tgz
Package SHA-512 (base64): AVl138zALtfaAPvADulE0PZThbYzCBS79nL4pOSL/6Sm/4AH5A21BD9VHt97OlCuzJuCpmeZtAtkinisF4Vb1g==

Vendored unchanged from the official npm package:
- legacy/build/pdf.min.mjs and pdf.worker.min.mjs
- cmaps/, standard_fonts/, wasm/, and their bundled licenses

The legacy build includes compatibility polyfills. All runtime assets are served
by the site so reading does not depend on an external JavaScript CDN. The sandbox
bundle is intentionally omitted; PDF JavaScript is not executed by this reader.
