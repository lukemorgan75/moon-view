import { getOrCreateCachedBook } from "./book-cache";
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

  const response = await fetch(`${KJV_JSON_BASE}/${filename}`);
  if (!response.ok) throw new Error(`Failed to load KJV text for ${book}.`);
  const data = await response.json();

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

  cached.kjv = map;
  return map;
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
  hebrewMap: Map<string, string>,
  kjvMap: Map<string, string>,
  jpsMap: Map<string, string>,
  yltMap: Map<string, string>,
  morphMap: Map<string, MorphWord[]>,
): VerseRow[] {
  const refs = new Set<string>([
    ...hebrewMap.keys(),
    ...kjvMap.keys(),
    ...jpsMap.keys(),
    ...yltMap.keys(),
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
      english.jps = stripHtml(jpsMap.get(key)!, false);
    }
    if (yltMap.has(key)) english.ylt = yltMap.get(key)!;

    rows.push({
      ref: { chapter, verse },
      hebrew: stripHtml(hebrewMap.get(key) ?? "", false),
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

  const loaders: Promise<unknown>[] = [];
  if (needSource) loaders.push(ensureHebrew(book));
  if (versions.includes("kjv")) loaders.push(ensureKjv(book));
  if (versions.includes("jps")) loaders.push(ensureJps(book));
  if (needYlt) loaders.push(ensureYlt(book));
  if (needSource) loaders.push(ensureMorph(book));
  await Promise.all(loaders);

  const cached = getOrCreateCachedBook(book);

  const hebrewMap = needSource
    ? flattenSefaria(cached.hebrew!, chapterStart, chapterEnd)
    : new Map<string, string>();
  const kjvMap = versions.includes("kjv")
    ? sliceMap(cached.kjv!, chapterStart, chapterEnd)
    : new Map<string, string>();
  const jpsMap = versions.includes("jps")
    ? sliceMap(cached.jps!, chapterStart, chapterEnd)
    : new Map<string, string>();
  const yltMap = needYlt
    ? sliceRecord(cached.ylt!, chapterStart, chapterEnd)
    : new Map<string, string>();
  const morphMap = needSource
    ? sliceMorph(cached.morph!, chapterStart, chapterEnd)
    : new Map<string, MorphWord[]>();

  return buildRows(hebrewMap, kjvMap, jpsMap, yltMap, morphMap);
}

export function englishText(row: VerseRow, version: EnglishVersion): string {
  return row.english[version] ?? "";
}