import { BOOK_CATALOG } from "./book-meta";

export {
  activeEnglishVersions,
  englishVersionLabel,
  secondaryEnglishLabel,
  secondaryEnglishVersion,
} from "./english-columns";
export { AVAILABLE_BOOKS, BOOK_CATALOG, getBookMeta, sourceLanguageLabel } from "./book-meta";
export type { BookMeta, SourceLanguage, Testament } from "./book-meta";

export const BOOKS_JSON_URL =
  "https://raw.githubusercontent.com/Sefaria/Sefaria-Export/master/books.json";

export const KJV_JSON_BASE =
  "https://raw.githubusercontent.com/aruljohn/Bible-kjv/master";

export const JPS_VERSION = "Tanakh The Holy Scriptures, published by JPS";
export const HEBREW_VERSION = "Miqra according to the Masorah";

export const SEFARIA_TO_KJV_FILE: Record<string, string> = Object.fromEntries(
  Object.entries(BOOK_CATALOG).map(([book, meta]) => [book, meta.kjvFile]),
);

export const SEFARIA_TO_MORPHHB: Record<string, string> = Object.fromEntries(
  Object.entries(BOOK_CATALOG).map(([book, meta]) => [book, meta.morphId]),
);

