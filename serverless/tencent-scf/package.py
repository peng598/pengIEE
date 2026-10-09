"""Build a secret-free SCF ZIP, preserving Unix executable mode on Windows."""

from hashlib import sha256
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

source = Path(__file__).resolve().parent
output = source.parents[1] / "tmp" / "pengiee-tencent-scf.zip"
output.parent.mkdir(parents=True, exist_ok=True)
files = {"server.js": 0o100644, "scf_bootstrap": 0o100755}

# An explicit allowlist prevents .env, credentials and local test files from entering the ZIP.
with ZipFile(output, "w", compression=ZIP_DEFLATED) as archive:
    for name, mode in files.items():
        data = (source / name).read_bytes().replace(b"\r\n", b"\n")
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
        assert archive.read(name) == (source / name).read_bytes().replace(b"\r\n", b"\n")

print(f"Verified SCF package: {output}")
print(f"SHA256: {sha256(output.read_bytes()).hexdigest()}")
print("Root files: server.js (0644), scf_bootstrap (0755, LF)")
