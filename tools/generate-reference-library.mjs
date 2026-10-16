import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceRoot = process.env.HARDWARE_DOCUMENTS_DIR || 'E:\\硬件文档';
const outputPath = join(siteDir, 'assets', 'reference-library.json');
const publicCategoryNames = new Set([
  '01.元器件基础',
  '02.电源设计',
  '03.大厂技术资料',
  '04.优质电子书'
]);
let previousCatalog = { files: [] };
try {
  previousCatalog = JSON.parse(await readFile(outputPath, 'utf8'));
} catch {
  // First generation starts with no published links.
}
const previousByKey = new Map(previousCatalog.files.map((file) => [file.key, file]));

const referenceId = (key) => createHash('sha256').update(key, 'utf8').digest('hex').slice(0, 32);

const normalize = (value) => value.split(sep).join('/');
const topLevelDirectories = (await readdir(sourceRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && publicCategoryNames.has(entry.name))
  .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }));

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const collected = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) collected.push(...await walk(absolutePath));
    else if (entry.isFile()) {
      const fileStat = await stat(absolutePath);
      collected.push({ absolutePath, name: entry.name, bytes: fileStat.size });
    }
  }
  return collected;
}

const categories = [];
const files = [];
let totalFiles = 0;
let totalBytes = 0;
let totalPdfs = 0;
let totalPdfBytes = 0;
let withheldPdfs = 0;

for (const directory of topLevelDirectories) {
  const rootPath = join(sourceRoot, directory.name);
  const found = await walk(rootPath);
  const pdfs = found.filter((file) => file.name.toLowerCase().endsWith('.pdf'));
  const bytes = found.reduce((sum, file) => sum + file.bytes, 0);
  const pdfBytes = pdfs.reduce((sum, file) => sum + file.bytes, 0);
  const reason = null;

  totalFiles += found.length;
  totalBytes += bytes;
  totalPdfs += pdfs.length;
  totalPdfBytes += pdfBytes;
  if (reason) withheldPdfs += pdfs.length;

  categories.push({
    title: directory.name,
    files: found.length,
    pdfs: pdfs.length,
    bytes,
    pdfBytes,
    withheld: Boolean(reason),
    reason
  });

  if (reason) continue;
  for (const file of pdfs) {
    const key = normalize(relative(sourceRoot, file.absolutePath));
    const folder = normalize(relative(rootPath, dirname(file.absolutePath)));
    const previous = previousByKey.get(key);
    files.push({
      id: previous?.id || referenceId(key),
      key,
      title: file.name.replace(/\.pdf$/i, ''),
      category: directory.name,
      folder: folder === '.' ? '' : folder,
      bytes: file.bytes,
      published: Boolean(previous?.published || previous?.cosUrl || previous?.publicationStatus === '已上线'),
      publicationStatus: previous?.publicationStatus || '待 COS 上架'
    });
  }
}

files.sort((a, b) => a.category.localeCompare(b.category, 'zh-CN', { numeric: true })
  || a.folder.localeCompare(b.folder, 'zh-CN', { numeric: true })
  || a.title.localeCompare(b.title, 'zh-CN', { numeric: true }));

const catalog = {
  version: 1,
  summary: {
    categories: categories.length,
    files: totalFiles,
    pdfs: totalPdfs,
    pdfBytes: totalPdfBytes,
    bytes: totalBytes,
    listedPdfs: files.length,
    withheldPdfs
  },
  categories,
  files
};

await writeFile(outputPath, `${JSON.stringify(catalog)}\n`, 'utf8');
console.log(`Generated ${files.length} listed PDF entries (${withheldPdfs} withheld by category) at ${outputPath}`);
