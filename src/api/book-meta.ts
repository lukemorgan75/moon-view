export type Testament = "OT" | "NT";
export type SourceLanguage = "hebrew" | "greek";
export type Corpus = "torah" | "paul";

export interface BookMeta {
  testament: Testament;
  sourceLanguage: SourceLanguage;
  corpus: Corpus;
  morphId: string;
  /** Filename under aruljohn/Bible-kjv or local /data/bibles/kjv/ */
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

/** Traditional Pauline corpus (13 letters). Display name → morphId, kjvFile, chapters. */
const PAUL_ENTRIES: [string, string, string, number][] = [
  ["Romans", "Ro", "Romans.json", 16],
  ["I Corinthians", "1Co", "1Corinthians.json", 16],
  ["II Corinthians", "2Co", "2Corinthians.json", 13],
  ["Galatians", "Ga", "Galatians.json", 6],
  ["Ephesians", "Eph", "Ephesians.json", 6],
  ["Philippians", "Php", "Philippians.json", 4],
  ["Colossians", "Col", "Colossians.json", 4],
  ["I Thessalonians", "1Th", "1Thessalonians.json", 5],
  ["II Thessalonians", "2Th", "2Thessalonians.json", 3],
  ["I Timothy", "1Ti", "1Timothy.json", 6],
  ["II Timothy", "2Ti", "2Timothy.json", 4],
  ["Titus", "Tit", "Titus.json", 3],
  ["Philemon", "Phm", "Philemon.json", 1],
];

function buildMeta(
  entries: [string, string, string, number][],
  testament: Testament,
  sourceLanguage: SourceLanguage,
  corpus: Corpus,
): BookMeta[] {
  return entries.map(([title, morphId, kjvFile, chapters]) => ({
    testament,
    sourceLanguage,
    corpus,
    morphId,
    kjvFile,
    esvName: title,
    chapters,
  }));
}

const TORAH_BOOKS = buildMeta(TORAH_ENTRIES, "OT", "hebrew", "torah");
const PAUL_BOOKS = buildMeta(PAUL_ENTRIES, "NT", "greek", "paul");

export const TORAH_BOOK_NAMES = TORAH_ENTRIES.map(([title]) => title);
export const PAUL_BOOK_NAMES = PAUL_ENTRIES.map(([title]) => title);

export const BOOK_CATALOG: Record<string, BookMeta> = Object.fromEntries(
  [...TORAH_BOOKS, ...PAUL_BOOKS].map((meta) => [meta.esvName, meta]),
);

export const AVAILABLE_BOOKS = TORAH_BOOK_NAMES;

export function booksForCorpus(corpus: Corpus): string[] {
  return corpus === "paul" ? PAUL_BOOK_NAMES : TORAH_BOOK_NAMES;
}

export function defaultBookForCorpus(corpus: Corpus): string {
  return booksForCorpus(corpus)[0];
}

export function getBookMeta(book: string): BookMeta {
  const meta = BOOK_CATALOG[book];
  if (!meta) {
    throw new Error(`Unknown book: ${book}`);
  }
  return meta;
}

export function isKnownBook(book: string): boolean {
  return book in BOOK_CATALOG;
}

export function sourceLanguageLabel(book: string): string {
  return getBookMeta(book).sourceLanguage === "greek" ? "Greek" : "Hebrew";
}

export function isTorahBook(book: string): boolean {
  return getBookMeta(book).corpus === "torah";
}

export function isPaulBook(book: string): boolean {
  return getBookMeta(book).corpus === "paul";
}

export function corpusForBook(book: string): Corpus {
  return getBookMeta(book).corpus;
}

export function clampChapter(book: string, chapter: number): number {
  const { chapters } = getBookMeta(book);
  const value = Math.floor(chapter);
  if (!Number.isFinite(value) || value < 1) return 1;
  return Math.min(value, chapters);
}
