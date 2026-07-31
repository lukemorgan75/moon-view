import {
  booksForCorpus,
  clampChapter,
  isKnownBook,
  type Corpus,
} from "../api/book-meta";
import type {
  EnglishVersion,
  NaturalEnglishVersion,
  ViewMode,
} from "../types";

export type AppRoute = "home" | "reader" | "revelation" | "info";

const ENGLISH_VERSIONS = new Set<EnglishVersion>([
  "kjv",
  "jps",
  "ylt",
  "esv",
  "locke",
]);

export interface ReaderUrlQuery {
  /** Single-column focus in natural mode (e.g. KJV only). */
  col?: EnglishVersion;
  mode?: ViewMode;
  /** Torah natural English primary: kjv | jps */
  eng?: NaturalEnglishVersion;
}

export interface ParsedRoute {
  route: AppRoute;
  corpus?: Corpus;
  /** Canonical book display name (e.g. "I Corinthians"). */
  book?: string;
  chapter?: number;
  verse?: number;
  /** Natural-mode single-column focus from `?col=kjv`. */
  col?: EnglishVersion;
  mode?: ViewMode;
  eng?: NaturalEnglishVersion;
}

export function isEnglishVersion(value: string): value is EnglishVersion {
  return ENGLISH_VERSIONS.has(value as EnglishVersion);
}

function parseReaderQuery(search: string | undefined): ReaderUrlQuery {
  if (!search) return {};
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const out: ReaderUrlQuery = {};

  const col = (params.get("col") ?? params.get("focus") ?? "").toLowerCase();
  if (isEnglishVersion(col)) out.col = col;

  const mode = (params.get("mode") ?? "").toLowerCase();
  if (mode === "natural" || mode === "analytic") out.mode = mode;

  const eng = (params.get("eng") ?? "").toLowerCase();
  if (eng === "kjv" || eng === "jps") out.eng = eng;

  return out;
}

function formatReaderQuery(query?: ReaderUrlQuery | null): string {
  if (!query) return "";
  const params = new URLSearchParams();
  if (query.col) params.set("col", query.col);
  if (query.mode) params.set("mode", query.mode);
  if (query.eng) params.set("eng", query.eng);
  const s = params.toString();
  return s ? `?${s}` : "";
}

/** Normalize a book title or URL segment to a slug key. */
export function bookToSlug(book: string): string {
  return book
    .trim()
    .toLowerCase()
    .replace(/[._]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function romanPrefixToDigit(slug: string): string | null {
  if (slug.startsWith("iii-")) return `3-${slug.slice(4)}`;
  if (slug.startsWith("ii-")) return `2-${slug.slice(3)}`;
  if (slug.startsWith("i-")) return `1-${slug.slice(2)}`;
  return null;
}

function digitPrefixToRoman(slug: string): string | null {
  if (slug.startsWith("3-")) return `iii-${slug.slice(2)}`;
  if (slug.startsWith("2-")) return `ii-${slug.slice(2)}`;
  if (slug.startsWith("1-")) return `i-${slug.slice(2)}`;
  return null;
}

/** All slug aliases that should resolve to a known book. */
function slugAliases(book: string): string[] {
  const primary = bookToSlug(book);
  const compact = primary.replace(/-/g, "");
  const aliases = new Set<string>([primary, compact]);

  const asDigit = romanPrefixToDigit(primary);
  if (asDigit) {
    aliases.add(asDigit);
    aliases.add(asDigit.replace(/-/g, ""));
  }
  const asRoman = digitPrefixToRoman(primary);
  if (asRoman) {
    aliases.add(asRoman);
    aliases.add(asRoman.replace(/-/g, ""));
  }

  return [...aliases];
}

const BOOK_BY_SLUG: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const book of [...booksForCorpus("torah"), ...booksForCorpus("paul")]) {
    for (const alias of slugAliases(book)) {
      map.set(alias, book);
    }
  }
  return map;
})();

/**
 * Resolve a URL book segment to a catalog display name within a corpus.
 * Accepts "Romans", "romans", "i-corinthians", "1-corinthians", "1corinthians".
 */
export function resolveBookSlug(
  segment: string | undefined,
  corpus: Corpus,
): string | undefined {
  if (!segment) return undefined;
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment.replace(/\+/g, " "));
  } catch {
    decoded = segment.replace(/\+/g, " ");
  }

  const slug = bookToSlug(decoded);
  const compact = slug.replace(/-/g, "");
  const candidates = [slug, compact];
  const digit = romanPrefixToDigit(slug);
  if (digit) {
    candidates.push(digit, digit.replace(/-/g, ""));
  }
  const roman = digitPrefixToRoman(slug);
  if (roman) {
    candidates.push(roman, roman.replace(/-/g, ""));
  }

  const allowed = new Set(booksForCorpus(corpus));
  for (const key of candidates) {
    const book = BOOK_BY_SLUG.get(key);
    if (book && allowed.has(book)) return book;
  }

  // Exact catalog title (any casing)
  for (const book of allowed) {
    if (bookToSlug(book) === slug) return book;
  }

  return undefined;
}

function parseChapterVerse(
  segment: string | undefined,
): { chapter?: number; verse?: number } {
  if (!segment) return {};
  // "8", "8:28", "8.28"
  const m = segment.trim().match(/^(\d+)(?:[:.](\d+))?$/);
  if (!m) return {};
  const chapter = Math.floor(Number(m[1]));
  const verse = m[2] != null ? Math.floor(Number(m[2])) : undefined;
  if (!Number.isFinite(chapter) || chapter < 1) return {};
  return {
    chapter,
    verse:
      verse != null && Number.isFinite(verse) && verse >= 1 ? verse : undefined,
  };
}

function parseReaderPath(
  segments: string[],
  corpus: Corpus,
): ParsedRoute {
  const book = resolveBookSlug(segments[0], corpus);
  if (!book) {
    return { route: "reader", corpus };
  }

  // #paul/romans/8 or #paul/romans/8:28
  // #paul/romans/8/28 (verse as extra segment)
  let chapter: number | undefined;
  let verse: number | undefined;

  if (segments[1]) {
    const cv = parseChapterVerse(segments[1]);
    chapter = cv.chapter;
    verse = cv.verse;
    if (verse == null && segments[2]) {
      const v = Math.floor(Number(segments[2]));
      if (Number.isFinite(v) && v >= 1) verse = v;
    }
  }

  if (chapter != null) {
    chapter = clampChapter(book, chapter);
  }

  return {
    route: "reader",
    corpus,
    book,
    chapter,
    verse,
  };
}

function parseRevelationPath(segments: string[]): ParsedRoute {
  // segments after "revelation" — e.g. ["12"] or ["12:1"] or ["12", "1"]
  let chapter: number | undefined;
  let verse: number | undefined;

  if (segments[0]) {
    const cv = parseChapterVerse(segments[0]);
    chapter = cv.chapter;
    verse = cv.verse;
    if (verse == null && segments[1]) {
      const v = Math.floor(Number(segments[1]));
      if (Number.isFinite(v) && v >= 1) verse = v;
    }
  }

  if (chapter != null) {
    chapter = Math.max(1, Math.min(22, chapter));
  }

  return {
    route: "revelation",
    chapter,
    verse,
  };
}

/**
 * Parse location hash into a route + optional deep-link place.
 *
 * Examples:
 *   #home
 *   #torah
 *   #torah/genesis/1
 *   #paul/romans/8
 *   #paul/romans/8?col=kjv
 *   #paul/i-corinthians/13:4
 *   #torah/genesis/1?col=kjv&mode=natural&eng=kjv
 *   #revelation/12
 *   #revelation/12:7
 */
export function parseRoute(hash: string): ParsedRoute {
  const rawFull = (hash || "").replace(/^#/, "").replace(/^\//, "") || "home";
  const qIndex = rawFull.indexOf("?");
  const pathOnly = qIndex >= 0 ? rawFull.slice(0, qIndex) : rawFull;
  const queryOnly = qIndex >= 0 ? rawFull.slice(qIndex + 1) : "";
  const query = parseReaderQuery(queryOnly);

  const raw = pathOnly.replace(/\/+$/, "") || "home";
  const segments = raw.split("/").filter(Boolean);
  if (segments.length === 0) return { route: "home" };

  const head = segments[0].toLowerCase();
  const rest = segments.slice(1);

  if (head === "info" || head === "about") return { route: "info" };
  if (head === "home") return { route: "home" };

  if (
    head === "revelation" ||
    head === "rev" ||
    head === "apocalypse"
  ) {
    return parseRevelationPath(rest);
  }

  let reader: ParsedRoute | null = null;

  if (head === "reader" && rest[0]) {
    const sub = rest[0].toLowerCase();
    if (sub === "torah") reader = parseReaderPath(rest.slice(1), "torah");
    else if (sub === "paul" || sub === "pauline" || sub === "epistles") {
      reader = parseReaderPath(rest.slice(1), "paul");
    } else if (sub === "revelation" || sub === "rev" || sub === "apocalypse") {
      return parseRevelationPath(rest.slice(1));
    }
  } else if (head === "torah") {
    reader = parseReaderPath(rest, "torah");
  } else if (head === "paul" || head === "pauline" || head === "epistles") {
    reader = parseReaderPath(rest, "paul");
  }

  if (reader) {
    return {
      ...reader,
      col: query.col,
      mode: query.mode,
      eng: query.eng,
    };
  }

  // Legacy bare reader hash and retired god-names deep links → home
  if (head === "reader" || head === "god-names") {
    return { route: "home" };
  }

  return { route: "home" };
}

export function corpusHref(
  corpus: Corpus,
  book?: string,
  chapter?: number,
  verse?: number,
  query?: ReaderUrlQuery | null,
): string {
  return readerHref(corpus, book, chapter, verse, query);
}

export function readerHref(
  corpus: Corpus,
  book?: string,
  chapter?: number,
  verse?: number,
  query?: ReaderUrlQuery | null,
): string {
  const base = corpus === "paul" ? "paul" : "torah";
  if (!book || !isKnownBook(book)) {
    return `#${base}${formatReaderQuery(query)}`;
  }

  let path = `#${base}/${bookToSlug(book)}`;
  if (chapter != null && chapter >= 1) {
    const ch = clampChapter(book, chapter);
    path += `/${ch}`;
    if (verse != null && verse >= 1) {
      path += `:${verse}`;
    }
  }
  return `${path}${formatReaderQuery(query)}`;
}

export function revelationHref(chapter?: number, verse?: number): string {
  if (chapter == null || chapter < 1) return "#revelation";
  const ch = Math.max(1, Math.min(22, Math.floor(chapter)));
  if (verse != null && verse >= 1) {
    return `#revelation/${ch}:${Math.floor(verse)}`;
  }
  return `#revelation/${ch}`;
}

export function homeHref(): string {
  return "#home";
}

export function infoHref(): string {
  return "#info";
}

/**
 * Update the hash without pushing history or firing hashchange.
 * Used to keep the address bar in sync as the user changes book/chapter.
 */
export function replaceAppHash(href: string): void {
  const next = href.startsWith("#") ? href : `#${href}`;
  if (window.location.hash === next) return;
  const url = `${window.location.pathname}${window.location.search}${next}`;
  window.history.replaceState(null, "", url);
}

/** True when the hash carries an explicit book or chapter (not bare #paul). */
export function routeHasDeepLink(route: ParsedRoute): boolean {
  if (route.route === "reader") return Boolean(route.book || route.chapter);
  if (route.route === "revelation") return route.chapter != null;
  return false;
}
