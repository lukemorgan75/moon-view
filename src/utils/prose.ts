import { englishText } from "../api/bible";
import type { EnglishVersion, VerseRow } from "../types";
import { stripHtml } from "./html";

export const CONTINUOUS_NOTE_KEY = "continuous";

export function joinEnglish(verses: VerseRow[], version: EnglishVersion): string {
  return verses
    .map((row) => englishText(row, version))
    .filter(Boolean)
    .join(" ");
}

export function joinVerseField(
  verses: VerseRow[],
  field: "hebrew",
): string;
export function joinVerseField(
  verses: VerseRow[],
  field: EnglishVersion,
): string;
export function joinVerseField(
  verses: VerseRow[],
  field: EnglishVersion | "hebrew",
): string {
  if (field === "hebrew") {
    return verses
      .map((row) => stripHtml(row.hebrew, false))
      .filter(Boolean)
      .join(" ");
  }

  return joinEnglish(verses, field);
}

export function joinRawHebrew(verses: VerseRow[]): string {
  return verses
    .map((row) => row.hebrew)
    .filter(Boolean)
    .join(" ");
}

export function groupVersesByChapter(verses: VerseRow[]): VerseRow[][] {
  const groups: VerseRow[][] = [];
  let current: VerseRow[] = [];

  for (const row of verses) {
    if (current.length && row.ref.chapter !== current[0].ref.chapter) {
      groups.push(current);
      current = [];
    }
    current.push(row);
  }

  if (current.length) groups.push(current);
  return groups;
}