"""Package the extension runtime files into store-pack.zip for Chrome Web Store upload.

Run AFTER `npm run build:extension` so rules.js/chapters.js carry the latest shared
engine. Only runtime files are included — never tests, README, or build scripts.
The manifest version must be greater than the published one; verify it inside the
zip, not just on disk (the zip carries the manifest).
"""
import os
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXT = os.path.join(ROOT, "extension")
OUT = os.path.join(ROOT, "store-pack.zip")

# Runtime file set (matches the published package). Icons + store icon included.
FILES = [
    "manifest.json",
    "background.js",
    "content.js",
    "options.html",
    "options.js",
    "blocked.html",
    "blocked.js",
    "rules.js",
    "chapters.js",
    "icon-16.png",
    "icon-32.png",
    "icon-48.png",
    "icon-128.png",
    "store-icon-128.png",
    "store-icon.svg",
]

missing = [f for f in FILES if not os.path.exists(os.path.join(EXT, f))]
if missing:
    raise SystemExit(f"Missing extension files (run npm run build:extension?): {missing}")

with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    for f in FILES:
        z.write(os.path.join(EXT, f), f)

# Verify the version actually inside the zip.
with zipfile.ZipFile(OUT) as z:
    import json
    manifest = json.loads(z.read("manifest.json"))
    names = z.namelist()
print(f"Wrote {OUT} ({os.path.getsize(OUT)} bytes)")
print(f"Version inside zip: {manifest['version']}")
print(f"Files: {len(names)}")
