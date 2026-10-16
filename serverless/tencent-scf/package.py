"""Build a secret-free SCF ZIP, preserving Unix executable mode on Windows."""

from hashlib import sha256
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

source = Path(__file__).resolve().parent
output = source.parents[1] / "tmp" / "pengiee-tencent-scf.zip"
output.parent.mkdir(parents=True, exist_ok=True)
files = {
    "server.js": 0o100644,
    "submissions.js": 0o100644,
    "submission-store.js": 0o100644,
    "reference-catalog.js": 0o100644,
    "reference-library.json": 0o100644,
    "package.json": 0o100644,
    "scf_bootstrap": 0o100755,
}
source_files = {name: source / name for name in files}
source_files["reference-library.json"] = source.parents[1] / "assets" / "reference-library.json"
dependencies = source / "node_modules"
if not (dependencies / "mysql2" / "package.json").exists() or not (
    dependencies / "cos-nodejs-sdk-v5" / "package.json"
).exists():
    raise SystemExit("Install production dependencies first: pnpm install --prod --frozen-lockfile --config.node-linker=hoisted --ignore-scripts")
for path in sorted(dependencies.rglob("*")):
    relative = path.relative_to(source)
    # Hoisted layout is required; hidden package-manager stores and executable shims aren't runtime code.
    if any(part.startswith(".") for part in relative.parts[1:]):
        continue
    if path.is_symlink():
        raise SystemExit(f"Symlink dependency found: {relative}; use node-linker=hoisted")
    if path.is_file():
        files[relative.as_posix()] = 0o100644

# An explicit allowlist prevents .env, credentials and local test files from entering the ZIP.
def packaged_bytes(name):
    data = source_files.get(name, source / name).read_bytes()
    return data if name.startswith("node_modules/") else data.replace(b"\r\n", b"\n")


with ZipFile(output, "w", compression=ZIP_DEFLATED) as archive:
    for name, mode in files.items():
        data = packaged_bytes(name)
        entry = ZipInfo(name)
        entry.create_system = 3
        entry.external_attr = mode << 16
        entry.compress_type = ZIP_DEFLATED
        archive.writestr(entry, data)

with ZipFile(output) as archive:
    assert archive.namelist() == list(files)
    assert archive.testzip() is None
    bootstrap = archive.getinfo("scf_bootstrap")
    assert bootstrap.create_system == 3 and bootstrap.external_attr >> 16 == 0o100755
    assert archive.read("scf_bootstrap").startswith(b"#!/bin/bash\n")
    assert b"\r" not in archive.read("scf_bootstrap")
    for name in files:
        assert archive.read(name) == packaged_bytes(name)

print(f"Verified SCF package: {output}")
print(f"SHA256: {sha256(output.read_bytes()).hexdigest()}")
print(f"Verified {len(files)} source/dependency files; bootstrap is executable (0755, LF).")
