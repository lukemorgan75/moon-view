import type { StrongOccurrence, VerseRow, WordLocation } from "../types";

export function verseDomId(chapter: number, verse: number): string {
  return `verse-${chapter}-${verse}`;
}

export function locationKey(loc: WordLocation): string {
  return `${loc.chapter}:${loc.verse}:${loc.wordIndex}`;
}

export function buildOccurrenceIndex(
  verses: VerseRow[],
): Map<string, StrongOccurrence[]> {
  const index = new Map<string, StrongOccurrence[]>();

  for (const row of verses) {
    if (!row.morph) continue;
    row.morph.forEach((word, wordIndex) => {
      const list = index.get(word.s) ?? [];
      list.push({
        chapter: row.ref.chapter,
        verse: row.ref.verse,
        wordIndex,
        hebrew: word.t,
        translit: word.tr ?? word.t,
      });
      index.set(word.s, list);
    });
  }

  return index;
}

export function scrollToVerse(chapter: number, verse: number): void {
  document
    .getElementById(verseDomId(chapter, verse))
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}