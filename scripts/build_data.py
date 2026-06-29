#!/usr/bin/env python3
"""Build compact per-book morph + English JSON for the parallel viewer."""

from __future__ import annotations

import json
import re
import sys
import urllib.request
from pathlib import Path

from biblical_transliteration import HebrewTransliterator

HEBREW_TR = HebrewTransliterator()

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "data"

MORPHHB_BASE = (
    "https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc"
)
JS_BIBLES_BASE = (
    "https://raw.githubusercontent.com/javascripture/javascripture/gh-pages/bibles"
)

JS_BOOK_ALIASES: dict[str, str] = {
    "Song of Songs": "Song of Solomon",
    "Revelation": "Revelation of John",
}

MORPHGNT_BASE = "https://raw.githubusercontent.com/morphgnt/sblgnt/master"

NT_MORPHGNT: dict[str, tuple[str, str]] = {
    "Matthew": ("61-Mt-morphgnt.txt", "Mt"),
    "Mark": ("62-Mk-morphgnt.txt", "Mk"),
    "Luke": ("63-Lk-morphgnt.txt", "Lk"),
    "John": ("64-Jn-morphgnt.txt", "Jn"),
    "Acts": ("65-Ac-morphgnt.txt", "Ac"),
    "Romans": ("66-Ro-morphgnt.txt", "Ro"),
    "I Corinthians": ("67-1Co-morphgnt.txt", "1Co"),
    "II Corinthians": ("68-2Co-morphgnt.txt", "2Co"),
    "Galatians": ("69-Ga-morphgnt.txt", "Ga"),
    "Ephesians": ("70-Eph-morphgnt.txt", "Eph"),
    "Philippians": ("71-Php-morphgnt.txt", "Php"),
    "Colossians": ("72-Col-morphgnt.txt", "Col"),
    "I Thessalonians": ("73-1Th-morphgnt.txt", "1Th"),
    "II Thessalonians": ("74-2Th-morphgnt.txt", "2Th"),
    "I Timothy": ("75-1Ti-morphgnt.txt", "1Ti"),
    "II Timothy": ("76-2Ti-morphgnt.txt", "2Ti"),
    "Titus": ("77-Tit-morphgnt.txt", "Tit"),
    "Philemon": ("78-Phm-morphgnt.txt", "Phm"),
    "Hebrews": ("79-Heb-morphgnt.txt", "Heb"),
    "James": ("80-Jas-morphgnt.txt", "Jas"),
    "I Peter": ("81-1Pe-morphgnt.txt", "1Pe"),
    "II Peter": ("82-2Pe-morphgnt.txt", "2Pe"),
    "I John": ("83-1Jn-morphgnt.txt", "1Jn"),
    "II John": ("84-2Jn-morphgnt.txt", "2Jn"),
    "III John": ("85-3Jn-morphgnt.txt", "3Jn"),
    "Jude": ("86-Jud-morphgnt.txt", "Jud"),
    "Revelation": ("87-Re-morphgnt.txt", "Re"),
}

SEFARIA_TO_MORPHHB: dict[str, str] = {
    "Genesis": "Gen",
    "Exodus": "Exod",
    "Leviticus": "Lev",
    "Numbers": "Num",
    "Deuteronomy": "Deut",
    "Joshua": "Josh",
    "Judges": "Judg",
    "I Samuel": "1Sam",
    "II Samuel": "2Sam",
    "I Kings": "1Kgs",
    "II Kings": "2Kgs",
    "Isaiah": "Isa",
    "Jeremiah": "Jer",
    "Ezekiel": "Ezek",
    "Hosea": "Hos",
    "Joel": "Joel",
    "Amos": "Amos",
    "Obadiah": "Obad",
    "Jonah": "Jonah",
    "Micah": "Mic",
    "Nahum": "Nah",
    "Habakkuk": "Hab",
    "Zephaniah": "Zeph",
    "Haggai": "Hag",
    "Zechariah": "Zech",
    "Malachi": "Mal",
    "Psalms": "Ps",
    "Proverbs": "Prov",
    "Job": "Job",
    "Song of Songs": "Song",
    "Ruth": "Ruth",
    "Lamentations": "Lam",
    "Ecclesiastes": "Eccl",
    "Esther": "Esth",
    "Daniel": "Dan",
    "Ezra": "Ezra",
    "Nehemiah": "Neh",
    "I Chronicles": "1Chr",
    "II Chronicles": "2Chr",
}

VERSE_RE = re.compile(
    r'<verse osisID="([^"]+)">(.*?)</verse>', re.DOTALL
)
WORD_RE = re.compile(r'<w ([^>]+)>(.*?)</w>', re.DOTALL)
ATTR_RE = re.compile(r'(\w+)="([^"]*)"')


def fetch_text(url: str) -> str:
    with urllib.request.urlopen(url, timeout=120) as resp:
        return resp.read().decode("utf-8")


def lemma_to_strong(lemma: str) -> str:
    tail = lemma.split("/")[-1].strip()
    return tail.split()[0]


def clean_surface(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", text)
    return text.replace("/", "").strip()


def parse_morph_book(xml: str, morph_id: str) -> dict[str, list[dict[str, str]]]:
    prefix = f"{morph_id}."
    verses: dict[str, list[dict[str, str]]] = {}

    for osis_id, body in VERSE_RE.findall(xml):
        if not osis_id.startswith(prefix):
            continue
        parts = osis_id.split(".")
        if len(parts) != 3:
            continue
        key = f"{parts[1]}:{parts[2]}"
        words: list[dict[str, str]] = []

        for attrs, surface in WORD_RE.findall(body):
            attr_map = dict(ATTR_RE.findall(attrs))
            lemma = attr_map.get("lemma", "")
            if not lemma:
                continue
            surface_clean = clean_surface(surface)
            words.append(
                {
                    "t": surface_clean,
                    "s": lemma_to_strong(lemma),
                    "l": lemma,
                    "m": attr_map.get("morph", ""),
                    "tr": HEBREW_TR.transliterate(surface_clean),
                }
            )

        if words:
            verses[key] = words

    return verses


def tokens_to_verse(tokens: list) -> str:
    parts: list[str] = []
    for token in tokens:
        if not token:
            continue
        word = str(token[0]).strip()
        if word:
            parts.append(word)
    text = " ".join(parts)
    return re.sub(r"\s+([,.;:!?])", r"\1", text).strip()


def parse_js_bible_book(chapters: list) -> dict[str, str]:
    verses: dict[str, str] = {}
    for chapter_idx, chapter in enumerate(chapters, start=1):
        for verse_idx, tokens in enumerate(chapter, start=1):
            text = tokens_to_verse(tokens)
            if text:
                verses[f"{chapter_idx}:{verse_idx}"] = text
    return verses


def write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))


def _compact_strongs_js(raw: str, var_name: str, xlit_key: str) -> dict:
    marker = f"var {var_name} = "
    if marker not in raw:
        raise RuntimeError(f"Could not parse Strong's dictionary JS ({var_name})")
    start = raw.index(marker) + len(marker)
    end = raw.rindex("};") + 1
    data = json.loads(raw[start:end])
    return {
        k: {
            "lemma": v.get("lemma", ""),
            "xlit": v.get(xlit_key, ""),
            "def": v.get("strongs_def", ""),
            "kjv": v.get("kjv_def", ""),
        }
        for k, v in data.items()
    }


def build_greek_lemma_index(greek: dict) -> dict[str, str]:
    index: dict[str, str] = {}
    for key, row in greek.items():
        lemma = (row.get("lemma") or "").strip().lower()
        if not lemma or lemma in index:
            continue
        index[lemma] = key[1:] if key.startswith("G") else key
    return index


def clean_greek_surface(text: str) -> str:
    return text.strip("⸂⸃.,;:!?\"'()[]")


def parse_morphgnt_book(
    text: str,
    lemma_index: dict[str, str],
    greek: dict,
) -> tuple[dict[str, list[dict[str, str]]], dict[str, str]]:
    verses: dict[str, list[dict[str, str]]] = {}
    greek_text: dict[str, str] = {}

    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        parts = line.split()
        if len(parts) < 7:
            continue
        refcode = parts[0]
        if len(refcode) < 6:
            continue
        chapter = int(refcode[2:4])
        verse = int(refcode[4:6])
        key = f"{chapter}:{verse}"
        surface = clean_greek_surface(parts[4])
        lemma = clean_greek_surface(parts[6]).lower()
        strong = lemma_index.get(lemma, "")
        xlit = ""
        if strong:
            row = greek.get(f"G{strong}", {})
            xlit = row.get("xlit") or row.get("translit") or ""

        verses.setdefault(key, []).append(
            {
                "t": surface,
                "s": strong,
                "l": parts[6],
                "m": parts[2],
                "tr": xlit,
            }
        )
        if surface:
            prev = greek_text.get(key, "")
            greek_text[key] = f"{prev} {surface}".strip() if prev else surface

    return verses, greek_text


def build_nt_book(
    book: str,
    asv: dict,
    greek_strongs: dict,
    lemma_index: dict[str, str],
) -> None:
    remote, morph_id = NT_MORPHGNT[book]
    print(f"Building {book} (Greek NT)…")
    raw = fetch_text(f"{MORPHGNT_BASE}/{remote}")
    morph, greek_verses = parse_morphgnt_book(raw, lemma_index, greek_strongs)
    write_json(OUT / "morph" / f"{morph_id}.json", morph)
    write_json(OUT / "greek" / f"{book}.json", greek_verses)

    rsv_count = 0
    js_book = JS_BOOK_ALIASES.get(book, book)
    if js_book in asv["books"]:
        rsv_verses = parse_js_bible_book(asv["books"][js_book])
        write_json(OUT / "bibles" / "rsv" / f"{book}.json", rsv_verses)
        rsv_count = len(rsv_verses)

    print(f"  morph {len(morph)}, greek {len(greek_verses)}, rsv {rsv_count}")


def build_strongs_dict() -> None:
    he_url = (
        "https://raw.githubusercontent.com/openscriptures/strongs/master/"
        "hebrew/strongs-hebrew-dictionary.js"
    )
    he_raw = fetch_text(he_url)
    hebrew = _compact_strongs_js(he_raw, "strongsHebrewDictionary", "xlit")
    write_json(OUT / "strongs-hebrew.json", hebrew)
    print(f"strongs-hebrew.json ({len(hebrew)} entries)")

    gr_url = (
        "https://raw.githubusercontent.com/openscriptures/strongs/master/"
        "greek/strongs-greek-dictionary.js"
    )
    gr_raw = fetch_text(gr_url)
    greek = _compact_strongs_js(gr_raw, "strongsGreekDictionary", "translit")
    write_json(OUT / "strongs-greek.json", greek)
    print(f"strongs-greek.json ({len(greek)} entries)")


def main() -> None:
    default_books = list(SEFARIA_TO_MORPHHB.keys()) + list(NT_MORPHGNT.keys())
    books = sys.argv[1:] or default_books

    print("Fetching javascripture ASV (RSV source)…")
    asv = json.loads(fetch_text(f"{JS_BIBLES_BASE}/ASV.json"))

    build_strongs_dict()
    greek_strongs = json.loads((OUT / "strongs-greek.json").read_text(encoding="utf-8"))
    lemma_index = build_greek_lemma_index(greek_strongs)

    for book in books:
        if book in NT_MORPHGNT:
            build_nt_book(book, asv, greek_strongs, lemma_index)
            continue

        morph_id = SEFARIA_TO_MORPHHB.get(book)
        if not morph_id:
            print(f"skip {book}: no morph mapping")
            continue

        print(f"Building {book}…")
        xml = fetch_text(f"{MORPHHB_BASE}/{morph_id}.xml")
        morph = parse_morph_book(xml, morph_id)
        write_json(OUT / "morph" / f"{morph_id}.json", morph)

        rsv_count = 0
        js_book = JS_BOOK_ALIASES.get(book, book)
        if js_book in asv["books"]:
            asv_verses = parse_js_bible_book(asv["books"][js_book])
            write_json(OUT / "bibles" / "rsv" / f"{book}.json", asv_verses)
            rsv_count = len(asv_verses)

        print(f"  morph {len(morph)}, rsv {rsv_count}")


if __name__ == "__main__":
    main()