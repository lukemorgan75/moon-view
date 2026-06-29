import { englishText } from "../api/bible";
import type { EnglishVersion, VerseRow, ViewMode } from "../types";
import { stripHtml } from "./html";
import { formatYltAnalytic, formatYltNatural } from "./ylt-format";

export const CONTINUOUS_NOTE_KEY = "continuous";

function formatEnglish(
  text: string,
  version: EnglishVersion,
  viewMode: ViewMode,
  yltDivineNames: boolean,
): string {
  if (version === "ylt") {
    const options = { divineNames: yltDivineNames };
    return viewMode === "natural"
      ? formatYltNatural(text, options)
      : formatYltAnalytic(text, options);
  }
  return text;
}

export function displayEnglish(
  row: VerseRow,
  version: EnglishVersion,
  viewMode: ViewMode,
  yltDivineNames = true,
): string {
  const raw = englishText(row, version);
  if (!raw) return "";
  return formatEnglish(raw, version, viewMode, yltDivineNames);
}

export function joinEnglish(
  verses: VerseRow[],
  version: EnglishVersion,
  viewMode: ViewMode,
  yltDivineNames = true,
): string {
  return verses
    .map((row) => displayEnglish(row, version, viewMode, yltDivineNames))
    .filter(Boolean)
    .join(" ");
}

export function joinVerseField(
  verses: VerseRow[],
  field: "hebrew",
  viewMode: ViewMode,
): string;
export function joinVerseField(
  verses: VerseRow[],
  field: EnglishVersion,
  viewMode: ViewMode,
): string;
export function joinVerseField(
  verses: VerseRow[],
  field: EnglishVersion | "hebrew",
  viewMode: ViewMode,
  yltDivineNames = true,
): string {
  if (field === "hebrew") {
    return verses
      .map((row) => stripHtml(row.hebrew, false))
      .filter(Boolean)
      .join(" ");
  }

  return joinEnglish(verses, field, viewMode, yltDivineNames);
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