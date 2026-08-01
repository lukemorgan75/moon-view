#!/usr/bin/env python3
"""Vendor Torah Hebrew + JPS texts from Sefaria Export into public/data/bibles/.

Why: the app previously fetched these at runtime from storage.googleapis.com
via a public CORS proxy (allorigins). That proxy often times out (408) or
fails entirely in Safari/production, and the Sefaria books index alone is ~20MB.

Run: python3 scripts/build_sefaria_texts.py
     npm run build-sefaria
"""

from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_HEBREW = ROOT / "public" / "data" / "bibles" / "hebrew"
OUT_JPS = ROOT / "public" / "data" / "bibles" / "jps"

BOOKS_JSON_URL = (
    "https://raw.githubusercontent.com/Sefaria/Sefaria-Export/master/books.json"
)
HEBREW_VERSION = "Miqra according to the Masorah"
JPS_VERSION = "Tanakh The Holy Scriptures, published by JPS"

# App corpus is Torah only for Hebrew/JPS columns.
TORAH_BOOKS = [
    "Genesis",
    "Exodus",
    "Leviticus",
    "Numbers",
    "Deuteronomy",
]


def encode_url(url: str) -> str:
    """Percent-encode path segments so spaces and commas are valid URLs."""
    parsed = urllib.parse.urlparse(url)
    parts = parsed.path.split("/")
    path = "/".join(
        urllib.parse.quote(seg, safe="") if seg else "" for seg in parts
    )
    return urllib.parse.urlunparse(
        (parsed.scheme, parsed.netloc, path, "", parsed.query, "")
    )


def fetch_json(url: str, timeout: int = 180) -> object:
    encoded = encode_url(url)
    req = urllib.request.Request(
        encoded,
        headers={"User-Agent": "moon-view-build-sefaria/1.0"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def write_compact_text(dest: Path, text: object) -> None:
    """Store only the chapter/verse matrix used by the viewer."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    payload = {"text": text}
    dest.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )


def main() -> int:
    print("Loading Sefaria books index…")
    t0 = time.time()
    try:
        data = fetch_json(BOOKS_JSON_URL, timeout=120)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        print(f"Failed to load books index: {exc}", file=sys.stderr)
        return 1

    entries = data["books"] if isinstance(data, dict) else data
    index: dict[tuple[str, str, str], str] = {}
    for entry in entries:
        title = entry.get("title")
        language = entry.get("language")
        version = entry.get("versionTitle")
        json_url = entry.get("json_url")
        if title and language and version and json_url:
            index[(title, language, version)] = json_url
    print(f"  indexed {len(index)} versions in {time.time() - t0:.1f}s")

    errors = 0
    for book in TORAH_BOOKS:
        print(f"\n=== {book} ===")
        for language, version, out_dir, label in (
            ("Hebrew", HEBREW_VERSION, OUT_HEBREW, "Hebrew"),
            ("English", JPS_VERSION, OUT_JPS, "JPS"),
        ):
            url = index.get((book, language, version))
            if not url:
                print(f"  MISSING {label} URL for {book}", file=sys.stderr)
                errors += 1
                continue
            dest = out_dir / f"{book}.json"
            try:
                payload = fetch_json(url)
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
                print(f"  Failed {label}: {exc}", file=sys.stderr)
                errors += 1
                continue
            text = payload.get("text") if isinstance(payload, dict) else None
            if text is None:
                print(f"  No text field in {label} payload", file=sys.stderr)
                errors += 1
                continue
            write_compact_text(dest, text)
            chapters = len(text) if isinstance(text, list) else "?"
            print(
                f"  {label:6} → {dest.relative_to(ROOT)} "
                f"({dest.stat().st_size:,} bytes, {chapters} chapters)"
            )

    if errors:
        print(f"\nFinished with {errors} error(s).", file=sys.stderr)
        return 1
    print("\nDone. Hebrew + JPS Torah texts are local under public/data/bibles/.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
