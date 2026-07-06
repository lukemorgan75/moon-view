#!/usr/bin/env python3
"""Apply YLT root highlights to a natural-mode Genesis Word document."""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W_NS}

ROOT_FILL = {
    "bara": "C9B8E8",      # lavender / purple
    "asah": "A8D4FF",      # blue
    "toledot": "F2A8A8",   # red
    "qadash": "FFC980",    # orange
}

SCRIPT_DIR = Path(__file__).resolve().parent
EXPORT_SCRIPT = SCRIPT_DIR / "export-ylt-root-highlights.mjs"


def qn(tag: str) -> str:
    return f"{{{W_NS}}}{tag}"


def export_verses(tmp_json: Path) -> list[dict]:
    subprocess.run(
        ["node", str(EXPORT_SCRIPT), str(tmp_json)],
        check=True,
        cwd=SCRIPT_DIR.parent,
    )
    payload = json.loads(tmp_json.read_text())
    return payload["verses"]


def extract_doc_text(root: ET.Element) -> str:
    parts: list[str] = []
    for node in root.iter():
        if node.tag == qn("t") and node.text:
            parts.append(node.text)
    return "".join(parts)


def tokenize_like_js(text: str) -> list[dict]:
    tokens: list[dict] = []
    for match in re.finditer(r"[A-Za-z']+|\s+|[^A-Za-z'\s]+", text):
        part = match.group(0)
        if re.fullmatch(r"[A-Za-z']+", part):
            tokens.append({"type": "word", "text": part})
        elif part.isspace():
            tokens.append({"type": "space", "text": part})
        else:
            tokens.append({"type": "punct", "text": part})
    return tokens


def tokenize_body_runs(body: ET.Element) -> list[dict]:
    tokens: list[dict] = []
    for paragraph in body.findall("w:p", NS):
        for run in paragraph.findall("w:r", NS):
            text_node = run.find("w:t", NS)
            if text_node is None or not text_node.text:
                continue
            tokens.extend(tokenize_like_js(text_node.text))
    return tokens


def tokens_to_text(tokens: list[dict]) -> str:
    return "".join(token["text"] for token in tokens)


def word_token_spans(tokens: list[dict]) -> list[tuple[int, int, int]]:
    """Map each word token to (token_index, start, end) char offsets."""
    spans: list[tuple[int, int, int]] = []
    cursor = 0
    for index, token in enumerate(tokens):
        if token["type"] != "word":
            cursor += len(token["text"])
            continue
        start = cursor
        end = cursor + len(token["text"])
        spans.append((index, start, end))
        cursor = end
    return spans


def token_index_at_char(spans: list[tuple[int, int, int]], char_pos: int) -> int | None:
    for token_index, start, end in spans:
        if start <= char_pos < end:
            return token_index
    return None


def assign_roots_from_verses(
    doc_text: str,
    doc_tokens: list[dict],
    verses: list[dict],
) -> list[str | None]:
    roots: list[str | None] = [None] * len(doc_tokens)
    spans = word_token_spans(doc_tokens)
    char_cursor = 0
    matched = 0

    for verse in verses:
        words = verse["words"]
        if not words:
            continue

        pattern = r"\s*".join(re.escape(entry["text"]) for entry in words)
        match = re.search(pattern, doc_text[char_cursor:])
        if not match:
            continue

        start = char_cursor + match.start()
        end = char_cursor + match.end()
        pos = start

        for entry in words:
            expected = entry["text"]
            root = entry.get("root")
            idx = doc_text.find(expected, pos, end)
            if idx < 0:
                break

            token_index = token_index_at_char(spans, idx)
            if token_index is not None and root:
                roots[token_index] = root
                matched += 1

            pos = idx + len(expected)

        char_cursor = end

    print(f"Matched {matched} rooted words in document")
    return roots


def clear_run_highlight(rpr: ET.Element | None) -> None:
    if rpr is None:
        return
    for child in list(rpr):
        if child.tag in {qn("highlight"), qn("shd")}:
            rpr.remove(child)


def apply_shading(rpr: ET.Element, fill: str) -> None:
    clear_run_highlight(rpr)
    shd = ET.Element(qn("shd"))
    shd.set(qn("val"), "clear")
    shd.set(qn("color"), "auto")
    shd.set(qn("fill"), fill)
    rpr.append(shd)


def split_run_by_roots(
    run: ET.Element,
    text: str,
    roots: list[str | None],
    root_iter: list[int],
) -> list[ET.Element]:
    if not text:
        return [run]

    pieces: list[tuple[str, str | None]] = []
    for token in tokenize_like_js(text):
        root = roots[root_iter[0]] if root_iter[0] < len(roots) else None
        root_iter[0] += 1
        if token["type"] == "word":
            pieces.append((token["text"], root))
        else:
            pieces.append((token["text"], None))

    merged: list[tuple[str, str | None]] = []
    for segment, root in pieces:
        if merged and merged[-1][1] == root:
            merged[-1] = (merged[-1][0] + segment, root)
        else:
            merged.append((segment, root))

    if len(merged) == 1 and merged[0][1] is None:
        clear_run_highlight(run.find("w:rPr", NS))
        t = run.find("w:t", NS)
        if t is not None:
            t.text = merged[0][0]
        return [run]

    new_runs: list[ET.Element] = []
    original_rpr = run.find("w:rPr", NS)
    for segment, root in merged:
        new_run = ET.Element(qn("r"))
        if original_rpr is not None:
            imported = ET.fromstring(ET.tostring(original_rpr))
            clear_run_highlight(imported)
            if root and root in ROOT_FILL:
                apply_shading(imported, ROOT_FILL[root])
            new_run.append(imported)
        elif root and root in ROOT_FILL:
            rpr = ET.Element(qn("rPr"))
            apply_shading(rpr, ROOT_FILL[root])
            new_run.append(rpr)

        t = ET.SubElement(new_run, qn("t"))
        if segment.startswith(" ") or segment.endswith(" "):
            t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
        t.text = segment
        new_runs.append(new_run)

    return new_runs


def process_paragraph(paragraph: ET.Element, roots: list[str | None], root_iter: list[int]) -> None:
    children = list(paragraph)
    for child in children:
        if child.tag != qn("r"):
            continue
        t = child.find("w:t", NS)
        if t is None or t.text is None:
            clear_run_highlight(child.find("w:rPr", NS))
            continue
        new_runs = split_run_by_roots(child, t.text, roots, root_iter)
        if len(new_runs) == 1 and new_runs[0] is child:
            continue
        index = list(paragraph).index(child)
        paragraph.remove(child)
        for offset, new_run in enumerate(new_runs):
            paragraph.insert(index + offset, new_run)


def apply_highlights(docx_in: Path, docx_out: Path, verses: list[dict]) -> None:
    work = docx_out.parent / "_ylt_docx_work"
    if work.exists():
        shutil.rmtree(work)
    with zipfile.ZipFile(docx_in, "r") as zf:
        zf.extractall(work)

    doc_xml = work / "word" / "document.xml"
    tree = ET.parse(doc_xml)
    root = tree.getroot()
    body = root.find("w:body", NS)
    if body is None:
        raise RuntimeError("Missing document body")

    doc_tokens = tokenize_body_runs(body)
    doc_text = tokens_to_text(doc_tokens)
    roots = assign_roots_from_verses(doc_text, doc_tokens, verses)
    root_iter = [0]

    for paragraph in body.findall("w:p", NS):
        process_paragraph(paragraph, roots, root_iter)

    ET.register_namespace("w", W_NS)
    tree.write(doc_xml, encoding="UTF-8", xml_declaration=True)

    if docx_out.exists():
        docx_out.unlink()
    with zipfile.ZipFile(docx_out, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for file_path in sorted(work.rglob("*")):
            if file_path.is_file():
                zf.write(file_path, file_path.relative_to(work).as_posix())

    shutil.rmtree(work)


def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: apply-ylt-docx-highlights.py <input.docx> <output.docx>")
        sys.exit(1)

    docx_in = Path(sys.argv[1]).resolve()
    docx_out = Path(sys.argv[2]).resolve()
    tmp_json = docx_out.parent / "_ylt_highlights.json"

    verses = export_verses(tmp_json)
    apply_highlights(docx_in, docx_out, verses)
    tmp_json.unlink(missing_ok=True)
    print(f"Wrote highlighted document to {docx_out}")


if __name__ == "__main__":
    main()