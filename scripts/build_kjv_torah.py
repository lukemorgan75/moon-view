#!/usr/bin/env python3
"""Vendor Torah KJV JSON into public/data/bibles/kjv/ (same layout as Pauline books).

Source: https://github.com/aruljohn/Bible-kjv
Run: python3 scripts/build_kjv_torah.py
     npm run build-kjv-torah
"""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "data" / "bibles" / "kjv"
BASE = "https://raw.githubusercontent.com/aruljohn/Bible-kjv/master"

# Filenames match book-meta kjvFile for Torah.
TORAH_KJV_FILES = [
    "Genesis.json",
    "Exodus.json",
    "Leviticus.json",
    "Numbers.json",
    "Deuteronomy.json",
]


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    errors = 0
    for name in TORAH_KJV_FILES:
        url = f"{BASE}/{name}"
        dest = OUT / name
        print(f"GET {url}")
        try:
            req = urllib.request.Request(
                url, headers={"User-Agent": "moon-view-build-kjv/1.0"}
            )
            with urllib.request.urlopen(req, timeout=120) as resp:
                raw = resp.read()
            # Validate shape before writing.
            data = json.loads(raw.decode("utf-8"))
            if not data.get("chapters"):
                print(f"  unexpected payload for {name}", file=sys.stderr)
                errors += 1
                continue
            dest.write_bytes(raw)
            print(
                f"  -> {dest.relative_to(ROOT)} "
                f"({len(raw):,} bytes, {len(data['chapters'])} chapters)"
            )
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            print(f"  Failed {name}: {exc}", file=sys.stderr)
            errors += 1

    if errors:
        return 1
    print("Done. Torah KJV is local under public/data/bibles/kjv/.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
