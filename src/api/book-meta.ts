export type Testament = "OT" | "NT";
export type SourceLanguage = "hebrew" | "greek";

export interface BookMeta {
  testament: Testament;
  sourceLanguage: SourceLanguage;
  morphId: string;
  kjvFile: string;
  esvName: string;
}

const OT_BOOKS: BookMeta[] = [
  ["Genesis", "Gen", "Genesis.json"],
  ["Exodus", "Exod", "Exodus.json"],
  ["Leviticus", "Lev", "Leviticus.json"],
  ["Numbers", "Num", "Numbers.json"],
  ["Deuteronomy", "Deut", "Deuteronomy.json"],
  ["Joshua", "Josh", "Joshua.json"],
  ["Judges", "Judg", "Judges.json"],
  ["I Samuel", "1Sam", "1Samuel.json"],
  ["II Samuel", "2Sam", "2Samuel.json"],
  ["I Kings", "1Kgs", "1Kings.json"],
  ["II Kings", "2Kgs", "2Kings.json"],
  ["Isaiah", "Isa", "Isaiah.json"],
  ["Jeremiah", "Jer", "Jeremiah.json"],
  ["Ezekiel", "Ezek", "Ezekiel.json"],
  ["Hosea", "Hos", "Hosea.json"],
  ["Joel", "Joel", "Joel.json"],
  ["Amos", "Amos", "Amos.json"],
  ["Obadiah", "Obad", "Obadiah.json"],
  ["Jonah", "Jonah", "Jonah.json"],
  ["Micah", "Mic", "Micah.json"],
  ["Nahum", "Nah", "Nahum.json"],
  ["Habakkuk", "Hab", "Habakkuk.json"],
  ["Zephaniah", "Zeph", "Zephaniah.json"],
  ["Haggai", "Hag", "Haggai.json"],
  ["Zechariah", "Zech", "Zechariah.json"],
  ["Malachi", "Mal", "Malachi.json"],
  ["Psalms", "Ps", "Psalms.json"],
  ["Proverbs", "Prov", "Proverbs.json"],
  ["Job", "Job", "Job.json"],
  ["Song of Songs", "Song", "SongofSolomon.json"],
  ["Ruth", "Ruth", "Ruth.json"],
  ["Lamentations", "Lam", "Lamentations.json"],
  ["Ecclesiastes", "Eccl", "Ecclesiastes.json"],
  ["Esther", "Esth", "Esther.json"],
  ["Daniel", "Dan", "Daniel.json"],
  ["Ezra", "Ezra", "Ezra.json"],
  ["Nehemiah", "Neh", "Nehemiah.json"],
  ["I Chronicles", "1Chr", "1Chronicles.json"],
  ["II Chronicles", "2Chr", "2Chronicles.json"],
].map(([title, morphId, kjvFile]) => ({
  testament: "OT" as const,
  sourceLanguage: "hebrew" as const,
  morphId,
  kjvFile,
  esvName: title,
}));

const NT_BOOKS: BookMeta[] = [
  ["Matthew", "Mt", "Matthew.json"],
  ["Mark", "Mk", "Mark.json"],
  ["Luke", "Lk", "Luke.json"],
  ["John", "Jn", "John.json"],
  ["Acts", "Ac", "Acts.json"],
  ["Romans", "Ro", "Romans.json"],
  ["I Corinthians", "1Co", "1Corinthians.json"],
  ["II Corinthians", "2Co", "2Corinthians.json"],
  ["Galatians", "Ga", "Galatians.json"],
  ["Ephesians", "Eph", "Ephesians.json"],
  ["Philippians", "Php", "Philippians.json"],
  ["Colossians", "Col", "Colossians.json"],
  ["I Thessalonians", "1Th", "1Thessalonians.json"],
  ["II Thessalonians", "2Th", "2Thessalonians.json"],
  ["I Timothy", "1Ti", "1Timothy.json"],
  ["II Timothy", "2Ti", "2Timothy.json"],
  ["Titus", "Tit", "Titus.json"],
  ["Philemon", "Phm", "Philemon.json"],
  ["Hebrews", "Heb", "Hebrews.json"],
  ["James", "Jas", "James.json"],
  ["I Peter", "1Pe", "1Peter.json"],
  ["II Peter", "2Pe", "2Peter.json"],
  ["I John", "1Jn", "1John.json"],
  ["II John", "2Jn", "2John.json"],
  ["III John", "3Jn", "3John.json"],
  ["Jude", "Jud", "Jude.json"],
  ["Revelation", "Re", "Revelation.json"],
].map(([title, morphId, kjvFile]) => ({
  testament: "NT" as const,
  sourceLanguage: "greek" as const,
  morphId,
  kjvFile,
  esvName: title,
}));

export const BOOK_CATALOG: Record<string, BookMeta> = Object.fromEntries(
  [...OT_BOOKS, ...NT_BOOKS].map((meta) => {
    const title = meta.esvName;
    return [title, meta];
  }),
);

export const AVAILABLE_BOOKS = Object.keys(BOOK_CATALOG);

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