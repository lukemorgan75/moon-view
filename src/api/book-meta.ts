export type Testament = "OT" | "NT";
export type SourceLanguage = "hebrew" | "greek";

export interface BookMeta {
  testament: Testament;
  sourceLanguage: SourceLanguage;
  morphId: string;
  kjvFile: string;
  esvName: string;
  chapters: number;
}

const TORAH_ENTRIES: [string, string, string, number][] = [
  ["Genesis", "Gen", "Genesis.json", 50],
  ["Exodus", "Exod", "Exodus.json", 40],
  ["Leviticus", "Lev", "Leviticus.json", 27],
  ["Numbers", "Num", "Numbers.json", 36],
  ["Deuteronomy", "Deut", "Deuteronomy.json", 34],
];

const TORAH_BOOKS: BookMeta[] = TORAH_ENTRIES.map(
  ([title, morphId, kjvFile, chapters]) => ({
    testament: "OT" as const,
    sourceLanguage: "hebrew" as const,
    morphId,
    kjvFile,
    esvName: title,
    chapters,
  }),
);

export const TORAH_BOOK_NAMES = TORAH_ENTRIES.map(([title]) => title);

export const BOOK_CATALOG: Record<string, BookMeta> = Object.fromEntries(
  TORAH_BOOKS.map((meta) => [meta.esvName, meta]),
);

export const AVAILABLE_BOOKS = TORAH_BOOK_NAMES;

export function getBookMeta(book: string): BookMeta {
  const meta = BOOK_CATALOG[book];
  if (!meta) {
    throw new Error(`Unknown book: ${book}`);
  }
  return meta;
}

export function sourceLanguageLabel(book: string): string {
  return getBookMeta(book).sourceLanguage === "greek" ? "Greek" : "Hebrew";
}

export function isTorahBook(book: string): boolean {
  return book in BOOK_CATALOG;
}