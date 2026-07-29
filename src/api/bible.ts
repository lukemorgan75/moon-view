import { getOrCreateCachedBook } from "./book-cache";
import { getBookMeta } from "./book-meta";
import {
  activeEnglishVersions,
  BOOKS_JSON_URL,
  HEBREW_VERSION,
  JPS_VERSION,
  KJV_JSON_BASE,
  SEFARIA_TO_KJV_FILE,
} from "./constants";
import { loadBookMorph } from "./morph";
import { assetUrl } from "../utils/assets";
import { stripHtml } from "../utils/html";
import { fetchUrl } from "../utils/url";
import type {
  ColumnVisibility,
  EnglishVersion,
  MorphWord,
  VerseRef,
  VerseRow,
} from "../types";

interface BookEntry {
  title: string;
  language: string;
  versionTitle: string;
  json_url: string;
}

function verseKey(ref: VerseRef): string {
  return `${ref.chapter}:${ref.verse}`;
}

let booksIndexPromise: Promise<BookEntry[]> | null = null;
const sefariaUrlIndex = new Map<string, string>();

function sefariaIndexKey(
  book: string,
  language: string,
  versionTitle: string,
): string {
  return `${book}\0${language}\0${versionTitle}`;
}

async function getBooksIndex(): Promise<BookEntry[]> {
  if (!booksIndexPromise) {
    booksIndexPromise = fetch(BOOKS_JSON_URL).then(async (response) => {
      if (!response.ok) throw new Error("Failed to load Sefaria book index.");
      const books = (await response.json()).books as BookEntry[];
      for (const entry of books) {
        sefariaUrlIndex.set(
          sefariaIndexKey(entry.title, entry.language, entry.versionTitle),
          entry.json_url,
        );
      }
      return books;
    });
  }
  return booksIndexPromise;
}

function resolveSefariaUrl(
  book: string,
  versionTitle: string,
  language: string,
): string {
  const url = sefariaUrlIndex.get(
    sefariaIndexKey(book, language, versionTitle),
  );
  if (!url) {
    throw new Error(`Missing Sefaria version "${versionTitle}" for ${book}.`);
  }
  return url;
}

async function fetchJson(url: string, label: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(fetchUrl(url));
  } catch {
    throw new Error(`Network error loading ${label}. Check your connection.`);
  }
  if (!response.ok) {
    throw new Error(`Failed to load ${label} (${response.status}).`);
  }
  return response.json();
}

function flattenSefaria(
  text: string[][],
  chapterStart: number,
  chapterEnd: number,
): Map<string, string> {
  const map = new Map<string, string>();
  text.forEach((chapter, chapterIdx) => {
    const chapterNum = chapterIdx + 1;
    if (chapterNum < chapterStart || chapterNum > chapterEnd) return;
    chapter.forEach((verseText, verseIdx) => {
      if (!verseText) return;
      map.set(verseKey({ chapter: chapterNum, verse: verseIdx + 1 }), verseText);
    });
  });
  return map;
}

function flattenSefariaFull(text: string[][]): Map<string, string> {
  return flattenSefaria(text, 1, text.length);
}

function parseKjvPayload(data: {
  chapters?: Array<{
    chapter: string | number;
    verses?: Array<{ verse: string | number; text: string }>;
  }>;
}): Map<string, string> {
  const map = new Map<string, string>();
  for (const chapter of data.chapters ?? []) {
    const chapterNum = Number(chapter.chapter);
    for (const verse of chapter.verses ?? []) {
      map.set(
        verseKey({ chapter: chapterNum, verse: Number(verse.verse) }),
        String(verse.text).trim(),
      );
    }
  }
  return map;
}

async function ensureHebrew(book: string): Promise<string[][]> {
  const cached = getOrCreateCachedBook(book);
  if (cached.hebrew) return cached.hebrew;

  await getBooksIndex();
  const data = (await fetchJson(
    resolveSefariaUrl(book, HEBREW_VERSION, "Hebrew"),
    `${book} Hebrew`,
  )) as { text: string[][] };

  cached.hebrew = data.text;
  return cached.hebrew;
}

async function ensureGreek(book: string): Promise<Record<string, string>> {
  const cached = getOrCreateCachedBook(book);
  if (cached.greek) return cached.greek;

  const response = await fetch(
    assetUrl(`/data/greek/${encodeURIComponent(book)}.json`),
  );
  if (!response.ok) {
    throw new Error(`Failed to load Greek text for ${book}.`);
  }

  const data = (await response.json()) as Record<string, string>;
  cached.greek = data;
  return data;
}

async function ensureJps(book: string): Promise<Map<string, string>> {
  const cached = getOrCreateCachedBook(book);
  if (cached.jps) return cached.jps;

  await getBooksIndex();
  const data = (await fetchJson(
    resolveSefariaUrl(book, JPS_VERSION, "English"),
    `${book} JPS`,
  )) as { text: string[][] };

  cached.jps = flattenSefariaFull(data.text);
  return cached.jps;
}

async function ensureKjv(book: string): Promise<Map<string, string>> {
  const cached = getOrCreateCachedBook(book);
  if (cached.kjv) return cached.kjv;

  const filename = SEFARIA_TO_KJV_FILE[book];
  if (!filename) throw new Error(`No KJV file mapping for ${book}.`);

  // Prefer local KJV (Pauline books + any vendored OT) for speed; fall back to remote.
  const localUrl = assetUrl(`/data/bibles/kjv/${encodeURIComponent(filename)}`);
  let response = await fetch(localUrl);
  if (!response.ok) {
    response = await fetch(`${KJV_JSON_BASE}/${filename}`);
  }
  if (!response.ok) throw new Error(`Failed to load KJV text for ${book}.`);

  const data = await response.json();
  const map = parseKjvPayload(data);
  cached.kjv = map;
  return map;
}

async function ensureEsv(book: string): Promise<Record<string, string>> {
  const cached = getOrCreateCachedBook(book);
  if (cached.esv) return cached.esv;

  const response = await fetch(
    assetUrl(`/data/bibles/esv/${encodeURIComponent(book)}.json`),
  );
  if (!response.ok) {
    throw new Error(`Failed to load ESV text for ${book}.`);
  }

  const data = (await response.json()) as Record<string, string>;
  cached.esv = data;
  return data;
}

async function ensureYlt(book: string): Promise<Record<string, string>> {
  const cached = getOrCreateCachedBook(book);
  if (cached.ylt) return cached.ylt;

  const response = await fetch(
    assetUrl(`/data/bibles/ylt/${encodeURIComponent(book)}.json`),
  );
  if (!response.ok) {
    throw new Error(
      `Missing YLT data for ${book}. Run: npm run build-ylt`,
    );
  }

  const data = (await response.json()) as Record<string, string>;
  cached.ylt = data;
  return data;
}

async function ensureMorph(
  book: string,
): Promise<Record<string, MorphWord[]>> {
  const cached = getOrCreateCachedBook(book);
  if (cached.morph) return cached.morph;

  const data = await loadBookMorph(book);
  cached.morph = data;
  return data;
}

function sliceMap<T>(
  source: Map<string, T>,
  chapterStart: number,
  chapterEnd: number,
): Map<string, T> {
  const map = new Map<string, T>();
  for (const [key, value] of source) {
    const chapter = Number(key.split(":")[0]);
    if (chapter < chapterStart || chapter > chapterEnd) continue;
    map.set(key, value);
  }
  return map;
}

function sliceRecord(
  source: Record<string, string>,
  chapterStart: number,
  chapterEnd: number,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const [key, value] of Object.entries(source)) {
    const chapter = Number(key.split(":")[0]);
    if (chapter < chapterStart || chapter > chapterEnd) continue;
    map.set(key, value);
  }
  return map;
}

function sliceMorph(
  source: Record<string, MorphWord[]>,
  chapterStart: number,
  chapterEnd: number,
): Map<string, MorphWord[]> {
  const map = new Map<string, MorphWord[]>();
  for (const [key, words] of Object.entries(source)) {
    const chapter = Number(key.split(":")[0]);
    if (chapter < chapterStart || chapter > chapterEnd) continue;
    map.set(key, words);
  }
  return map;
}

function buildRows(
  sourceMap: Map<string, string>,
  kjvMap: Map<string, string>,
  jpsMap: Map<string, string>,
  yltMap: Map<string, string>,
  esvMap: Map<string, string>,
  morphMap: Map<string, MorphWord[]>,
): VerseRow[] {
  const refs = new Set<string>([
    ...sourceMap.keys(),
    ...kjvMap.keys(),
    ...jpsMap.keys(),
    ...yltMap.keys(),
    ...esvMap.keys(),
    ...morphMap.keys(),
  ]);

  const rows: VerseRow[] = [];
  for (const key of [...refs].sort((a, b) => {
    const [ac, av] = a.split(":").map(Number);
    const [bc, bv] = b.split(":").map(Number);
    return ac - bc || av - bv;
  })) {
    const [chapter, verse] = key.split(":").map(Number);
    const english: Partial<Record<EnglishVersion, string>> = {};

    if (kjvMap.has(key)) english.kjv = kjvMap.get(key)!;
    if (jpsMap.has(key)) {
      // Strip Sefaria footnote markup so Heb. name glosses (e.g. "Heb. ’adam.")
      // and alternate-reading notes do not appear inline in natural/analytic text.
      english.jps = stripHtml(jpsMap.get(key)!, true);
    }
    if (yltMap.has(key)) english.ylt = yltMap.get(key)!;
    if (esvMap.has(key)) english.esv = esvMap.get(key)!;

    rows.push({
      ref: { chapter, verse },
      hebrew: stripHtml(sourceMap.get(key) ?? "", false),
      english,
      morph: morphMap.get(key),
    });
  }

  return rows;
}

export async function loadParallelVerses(
  book: string,
  chapterStart: number,
  chapterEnd: number,
  columns: ColumnVisibility,
): Promise<VerseRow[]> {
  const versions = activeEnglishVersions(columns);
  const needSource = columns.hebrew;
  const needYlt = versions.includes("ylt");
  const needEsv = versions.includes("esv");
  const sourceLang = getBookMeta(book).sourceLanguage;

  const loaders: Promise<unknown>[] = [];
  if (needSource) {
    if (sourceLang === "greek") loaders.push(ensureGreek(book));
    else loaders.push(ensureHebrew(book));
    loaders.push(ensureMorph(book));
  }
  if (versions.includes("kjv")) loaders.push(ensureKjv(book));
  if (versions.includes("jps")) loaders.push(ensureJps(book));
  if (needYlt) loaders.push(ensureYlt(book));
  if (needEsv) loaders.push(ensureEsv(book));
  await Promise.all(loaders);

  const cached = getOrCreateCachedBook(book);

  let sourceMap: Map<string, string>;
  if (!needSource) {
    sourceMap = new Map();
  } else if (sourceLang === "greek") {
    sourceMap = sliceRecord(cached.greek!, chapterStart, chapterEnd);
  } else {
    sourceMap = flattenSefaria(cached.hebrew!, chapterStart, chapterEnd);
  }

  const kjvMap = versions.includes("kjv")
    ? sliceMap(cached.kjv!, chapterStart, chapterEnd)
    : new Map<string, string>();
  const jpsMap = versions.includes("jps")
    ? sliceMap(cached.jps!, chapterStart, chapterEnd)
    : new Map<string, string>();
  const yltMap = needYlt
    ? sliceRecord(cached.ylt!, chapterStart, chapterEnd)
    : new Map<string, string>();
  const esvMap = needEsv
    ? sliceRecord(cached.esv!, chapterStart, chapterEnd)
    : new Map<string, string>();
  const morphMap = needSource
    ? sliceMorph(cached.morph!, chapterStart, chapterEnd)
    : new Map<string, MorphWord[]>();

  return buildRows(sourceMap, kjvMap, jpsMap, yltMap, esvMap, morphMap);
}

export function englishText(row: VerseRow, version: EnglishVersion): string {
  return row.english[version] ?? "";
}
