#!/usr/bin/env python3
"""Build per-book Locke paraphrase JSON from a public-domain OCR text.

Source: John Locke, "A Paraphrase and Notes on the Epistles of St. Paul"
(1832 Google-digitized edition on Internet Archive).

Locke covers only: Galatians, I & II Corinthians, Romans, Ephesians.
"""

from __future__ import annotations

import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "data" / "bibles" / "locke"
CACHE = ROOT / "scripts" / ".cache" / "locke1832.txt"
SRC_URL = (
    "https://archive.org/download/aparaphraseandn00lockgoog/"
    "aparaphraseandn00lockgoog_djvu.txt"
)

CHAPTERS = {
    "Galatians": 6,
    "I Corinthians": 16,
    "II Corinthians": 13,
    "Romans": 16,
    "Ephesians": 6,
}

ROMAN = {
    k: i
    for i, k in enumerate(
        "I II III IV V VI VII VIII IX X XI XII XIII XIV XV XVI".split(), 1
    )
}


def ensure_source() -> str:
    CACHE.parent.mkdir(parents=True, exist_ok=True)
    if not CACHE.exists() or CACHE.stat().st_size < 100_000:
        print(f"Downloading {SRC_URL} …")
        urllib.request.urlretrieve(SRC_URL, CACHE)
    return CACHE.read_text(encoding="utf-8", errors="replace")


def parse_ch(tok: str) -> int | None:
    tok = tok.strip(" .").upper()
    if tok.isdigit():
        return int(tok)
    return ROMAN.get(tok)


def clean(s: str) -> str:
    s = s.replace("\u00ad", "")
    s = re.sub(r"-\n", "", s)
    s = re.sub(r"\s*\n\s*", " ", s)
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"\*+", "", s)
    s = re.sub(r"\s+([,.;:!?])", r"\1", s)
    for a, b in [
        ("mc,", "me,"),
        ("jrou", "you"),
        ("Gk)d", "God"),
        ("Grod", "God"),
        ("Grospel", "Gospel"),
        ("aposde", "apostle"),
        ("Seace", "peace"),
        ("tod peace", "and peace"),
        ("Ood ", "God "),
        ("Ix)rd", "Lord"),
        ("ourliord", "our Lord"),
    ]:
        s = s.replace(a, b)
    return s.strip(" |")


def extract_verses(block: str) -> dict[int, str]:
    block = block.strip()
    if not block:
        return {}
    parts = re.split(r"(?:(?<=\n)|^)\s*(\d{1,3})\s+(?=[A-Za-z(])", block)
    verses: dict[int, str] = {}
    i = 1
    while i + 1 < len(parts):
        try:
            num = int(parts[i])
        except ValueError:
            i += 2
            continue
        body = clean(parts[i + 1])
        if body and 1 <= num <= 176:
            if num not in verses or len(body) > len(verses[num]):
                verses[num] = body
        i += 2
    return verses


def find_spans(text: str) -> list[tuple[str, int, int]]:
    markers: list[tuple[int, str]] = []
    g = text.find("TO THE \n\n\n\nGALATIANS.")
    if g < 0:
        g = text.find("GALATIANS.", 40000)
    if g >= 0:
        markers.append((g, "Galatians"))

    c1 = text.find("FIRST EPISTLE")
    if c1 < 0:
        m = re.search(r"CHAPTER I\b", text[170000:200000])
        c1 = 170000 + m.start() if m else -1
    if c1 >= 0:
        markers.append((c1, "I Corinthians"))

    c2 = text.find("SECOND EPISTLE")
    if c2 >= 0:
        markers.append((c2, "II Corinthians"))

    ro = text.find("ROMANS.", 500000)
    if ro >= 0:
        markers.append((ro, "Romans"))

    ep = text.find("EPHESIANS", 900000)
    if ep >= 0:
        markers.append((ep, "Ephesians"))

    markers.sort()
    seen: set[str] = set()
    uniq: list[tuple[int, str]] = []
    for pos, book in markers:
        if book in seen:
            continue
        seen.add(book)
        uniq.append((pos, book))

    spans: list[tuple[str, int, int]] = []
    for i, (pos, book) in enumerate(uniq):
        end = uniq[i + 1][0] if i + 1 < len(uniq) else len(text)
        spans.append((book, pos, end))
    return spans


def parse_book(chunk: str, max_ch: int) -> dict[str, str]:
    result: dict[str, str] = {}
    chapter = 1
    last_v = 0
    mode: str | None = None
    buf: list[str] = []

    def flush() -> None:
        nonlocal buf, chapter, last_v
        if not buf:
            return
        body = "\n".join(buf)
        buf = []
        verses = extract_verses(body)
        for vnum, vtext in sorted(verses.items()):
            if last_v and vnum < last_v and vnum <= 5 and last_v >= 8:
                if chapter < max_ch:
                    chapter += 1
            if chapter > max_ch:
                continue
            key = f"{chapter}:{vnum}"
            if key not in result or len(vtext) > len(result[key]):
                result[key] = vtext
            last_v = vnum

    for line in chunk.split("\n"):
        stripped = line.strip()
        m = re.match(r"CHAPTER\s+([IVXLC0-9]+)\b", stripped, re.I)
        if m:
            flush()
            mode = None
            n = parse_ch(m.group(1))
            if n and 1 <= n <= max_ch:
                chapter = n
                last_v = 0
            continue

        m = re.match(r"CHAP(?:TER)?\.?\s+([IVXLC0-9]+)\b", stripped, re.I)
        if m and re.search(r"GALAT|CORINTH|ROMAN|EPHES", stripped, re.I):
            n = parse_ch(m.group(1))
            if n and 1 <= n <= max_ch and n != chapter:
                flush()
                mode = None
                chapter = n
                last_v = 0
            continue

        if re.match(r"^PARAPHRASE\.\s*$", stripped):
            flush()
            mode = "paraphrase"
            buf = []
            continue

        if re.match(r"^(TEXT|NOTES|CONTENTS)\.\s*$", stripped) or re.match(
            r"^SECTION\b", stripped, re.I
        ):
            flush()
            mode = None
            continue

        if mode == "paraphrase":
            buf.append(line)

    flush()
    return {k: v for k, v in result.items() if int(k.split(":")[0]) <= max_ch}


def main() -> None:
    text = ensure_source()
    spans = find_spans(text)
    print("Book spans:")
    for book, start, end in spans:
        print(f"  {book}: {start}–{end}")

    OUT.mkdir(parents=True, exist_ok=True)
    summary: dict[str, int] = {}
    for book, start, end in spans:
        verses = parse_book(text[start:end], CHAPTERS[book])
        path = OUT / f"{book}.json"
        path.write_text(
            json.dumps(verses, ensure_ascii=False, indent=2, sort_keys=True),
            encoding="utf-8",
        )
        summary[book] = len(verses)
        print(f"  wrote {path.name}: {len(verses)} verses")

    meta = {
        "source": {
            "author": "John Locke",
            "work": (
                "A Paraphrase and Notes on the Epistles of St. Paul to the "
                "Galatians, First and Second Corinthians, Romans, and Ephesians"
            ),
            "edition": "1832 (Internet Archive / Google Books OCR)",
            "url": "https://archive.org/details/aparaphraseandn00lockgoog",
            "books": list(CHAPTERS),
            "note": (
                "OCR-derived reading text. Locke treated only these five "
                "epistles. Gaps and OCR noise may remain."
            ),
        },
        "verse_counts": summary,
    }
    (OUT / "index.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print("Done.", summary)


if __name__ == "__main__":
    main()
    sys.exit(0)
