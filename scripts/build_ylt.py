#!/usr/bin/env python3
"""Fetch YLT from javascripture and write per-book JSON for Torah."""

from __future__ import annotations

import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "data" / "bibles" / "ylt"
YLT_URL = (
    "https://raw.githubusercontent.com/javascripture/javascripture/"
    "gh-pages/bibles/YLT.json"
)
TORAH = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"]

FI_TAG_RE = re.compile(r"<\s*/?\s*F\s*I\s*>", re.IGNORECASE)


def fetch_text(url: str) -> str:
    with urllib.request.urlopen(url, timeout=180) as resp:
        return resp.read().decode("utf-8")


def strip_fi_tags(text: str) -> str:
    return FI_TAG_RE.sub("", text)


def tokens_to_verse(tokens: list | str) -> str:
    """javascripture YLT stores each verse as a plain string, not token tuples."""
    if isinstance(tokens, str):
        text = tokens
    else:
        parts: list[str] = []
        for token in tokens:
            if not token:
                continue
            if isinstance(token, str):
                parts.append(token.strip())
            elif isinstance(token, (list, tuple)) and token:
                parts.append(str(token[0]).strip())
        text = " ".join(parts)
        text = re.sub(r"\s+([,.;:!?])", r"\1", text)

    text = strip_fi_tags(text)
    return text.strip()


def main() -> None:
    books = sys.argv[1:] or TORAH
    print(f"Fetching {YLT_URL}…")
    data = json.loads(fetch_text(YLT_URL))
    OUT.mkdir(parents=True, exist_ok=True)

    for book in books:
        if book not in data["books"]:
            print(f"skip {book}: not in YLT")
            continue
        verses: dict[str, str] = {}
        for ci, chapter in enumerate(data["books"][book], start=1):
            for vi, verse_data in enumerate(chapter, start=1):
                text = tokens_to_verse(verse_data)
                if text:
                    verses[f"{ci}:{vi}"] = text
        path = OUT / f"{book}.json"
        path.write_text(json.dumps(verses, ensure_ascii=False), encoding="utf-8")
        print(f"  {book}: {len(verses)} verses → {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()