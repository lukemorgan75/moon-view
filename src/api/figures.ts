import { assetUrl } from "../utils/assets";

export type FigureRole =
  | "category"
  | "type"
  | "part"
  | "metonym"
  | "action"
  | "similitude";

export type FigureLikelihood = "always" | "sometimes" | "contextual";

export interface AlternateSense {
  conditions: string[];
  sense: string;
  newton_def?: number;
}

export interface ScopedSense {
  sense: string;
  scope_books?: string[];
  scope_label?: string;
  precedent?: string;
  genre?: string;
  genre_id?: string;
  source?: string;
  conditions?: string[];
  figure_likelihood?: FigureLikelihood;
  refs?: string[];
  newton_def?: number;
  note?: string;
}

export interface CanonSense {
  label: string;
  sense: string;
  conditions?: string[];
  newton_def?: number;
  contrasts_with?: string;
  source?: string;
}

export interface GenreSense {
  genre_id: string;
  genre_label: string;
  sense: string;
  refs?: string[];
  sample_books?: string[];
  contrasts_with?: string;
  newton_def?: number;
  source?: string;
}

export interface GenreMeta {
  label: string;
  testament: "OT" | "NT";
  description: string;
}

export interface GenreTaxonomy {
  genres: Record<string, GenreMeta>;
  book_genre: Record<string, string>;
  scoped_genre_map: Record<string, string>;
}

export interface BookSenseRow {
  label: string;
  sense: string;
  refs?: string[];
  genre?: string;
  source?: string;
  inContext?: boolean;
}

export interface StrongsDetail {
  strong: string;
  lang: "he" | "gr";
  lemma: string;
  xlit: string;
}

export interface FigureCondition {
  id: string;
  label: string;
  description: string;
  newton_def?: number;
}

export interface FigureEntry {
  id: string;
  label: string;
  role: FigureRole;
  parent: string | null;
  sense: string;
  figure_likelihood: FigureLikelihood;
  newton_def?: number;
  conditions?: string[];
  alternate_senses?: AlternateSense[];
  canon_senses?: CanonSense[];
  genre_senses?: GenreSense[];
  scoped_senses?: ScopedSense[];
  roots: { en?: string[]; he?: string[] };
  scope: string[];
  note?: string;
  children: string[];
  strongs_details?: StrongsDetail[];
}

export interface FigureBundle {
  version: number;
  source: Record<string, unknown>;
  conditions: FigureCondition[];
  genre_taxonomy?: GenreTaxonomy;
  entries: FigureEntry[];
  index: {
    en: Record<string, string[]>;
    he: Record<string, string[]>;
    strongs?: Record<string, string[]>;
  };
  occurrence_index?: Record<string, Record<string, string[]>>;
}

export interface FigureLookupResult {
  entry: FigureEntry;
  matchedVia: "en" | "he";
  matchedRoot: string;
  ancestors: FigureEntry[];
  descendants: FigureEntry[];
}

let bundle: FigureBundle | null = null;
let loadPromise: Promise<FigureBundle> | null = null;

export async function loadFigureDictionary(): Promise<FigureBundle> {
  if (bundle) return bundle;
  if (!loadPromise) {
    loadPromise = fetch(assetUrl("/data/figures.json"))
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load figure dictionary.");
        return r.json() as Promise<FigureBundle>;
      })
      .then((data) => {
        bundle = data;
        return data;
      });
  }
  return loadPromise;
}

function normalizeEn(word: string): string {
  let w = word.trim().toLowerCase();
  w = w.replace(/'s$|s'$/u, "");
  const suffixes = [
    "iness",
    "ment",
    "ness",
    "ship",
    "tion",
    "sion",
    "able",
    "ible",
    "ally",
    "fully",
    "ingly",
    "edly",
    "ing",
    "ed",
    "es",
    "s",
  ];
  for (const suffix of suffixes) {
    if (w.length > suffix.length + 2 && w.endsWith(suffix)) {
      w = w.slice(0, -suffix.length);
      break;
    }
  }
  return w.replace(/[^a-z'-]/g, "");
}

function normalizeStrongs(strong: string): string {
  const s = strong.trim().toUpperCase();
  if (s.startsWith("H") || s.startsWith("G")) return s;
  if (s.startsWith("9") || Number(s) > 5000) return `G${s}`;
  return `H${s}`;
}

function entryMap(data: FigureBundle): Map<string, FigureEntry> {
  return new Map(data.entries.map((e) => [e.id, e]));
}

function ancestors(
  entries: Map<string, FigureEntry>,
  entryId: string,
): FigureEntry[] {
  const chain: FigureEntry[] = [];
  let current = entries.get(entryId);
  while (current?.parent) {
    const parent = entries.get(current.parent);
    if (!parent) break;
    chain.push(parent);
    current = parent;
  }
  return chain;
}

function descendants(
  entries: Map<string, FigureEntry>,
  entryId: string,
): FigureEntry[] {
  const found: FigureEntry[] = [];
  const walk = (id: string) => {
    const entry = entries.get(id);
    if (!entry) return;
    for (const childId of entry.children) {
      const child = entries.get(childId);
      if (child) {
        found.push(child);
        walk(childId);
      }
    }
  };
  walk(entryId);
  return found;
}

export function lookupFigures(
  data: FigureBundle,
  opts: { en?: string; he?: string },
): FigureLookupResult[] {
  const entries = entryMap(data);
  const results: FigureLookupResult[] = [];
  const seen = new Set<string>();

  const push = (ids: string[] | undefined, via: "en" | "he", root: string) => {
    for (const id of ids ?? []) {
      if (seen.has(id)) continue;
      const entry = entries.get(id);
      if (!entry) continue;
      seen.add(id);
      results.push({
        entry,
        matchedVia: via,
        matchedRoot: root,
        ancestors: ancestors(entries, id),
        descendants: descendants(entries, id),
      });
    }
  };

  if (opts.en) {
    const root = normalizeEn(opts.en);
    push(data.index.en[root], "en", root);
  }
  if (opts.he) {
    const root = normalizeStrongs(opts.he);
    const index = data.index.he ?? data.index.strongs ?? {};
    push(index[root], "he", root);
  }

  return results;
}

export function getFigureEntry(
  data: FigureBundle,
  id: string,
): FigureEntry | undefined {
  return entryMap(data).get(id);
}

export function listRootFigures(data: FigureBundle): FigureEntry[] {
  return data.entries
    .filter((e) => !e.parent)
    .sort((a, b) => (a.newton_def ?? 9999) - (b.newton_def ?? 9999));
}

const BOOK_ALIASES: Record<string, string> = {
  "1 Samuel": "I Samuel",
  "2 Samuel": "II Samuel",
  "1 Kings": "I Kings",
  "2 Kings": "II Kings",
  "1 Chronicles": "I Chronicles",
  "2 Chronicles": "II Chronicles",
};

function normalizeBook(book: string): string {
  return BOOK_ALIASES[book] ?? book;
}

export function bookInScope(scopeBooks: string[] | undefined, book: string): boolean {
  const norm = normalizeBook(book);
  return (scopeBooks ?? []).some((b) => normalizeBook(b) === norm);
}

function bookRefs(
  bundle: FigureBundle | null | undefined,
  entryId: string,
  book: string,
): string[] | undefined {
  const refs = bundle?.occurrence_index?.[entryId]?.[book];
  if (!refs?.length) return undefined;
  const abbr = book.slice(0, 3);
  return refs.map((r) => `${abbr} ${r}`);
}

export function genreForBook(
  bundle: FigureBundle | null | undefined,
  book: string,
): { genreId: string; meta: GenreMeta } | undefined {
  const taxonomy = bundle?.genre_taxonomy;
  const genreId = taxonomy?.book_genre?.[book];
  if (!genreId || !taxonomy?.genres?.[genreId]) return undefined;
  return { genreId, meta: taxonomy.genres[genreId] };
}

/** Book-scoped senses (narrowest tier). */
export function sensesForBook(
  entry: FigureEntry,
  book: string,
  bundle?: FigureBundle | null,
): BookSenseRow[] {
  const out: BookSenseRow[] = [];

  const scoped = entry.scoped_senses?.filter((s) =>
    bookInScope(s.scope_books, book),
  );
  if (scoped?.length) {
    for (const s of scoped) {
      out.push({
        label: s.scope_label ?? book,
        sense: s.sense,
        refs: s.refs,
        genre: s.genre,
        source: s.source,
        inContext: true,
      });
    }
    return out;
  }

  const occRefs = bookRefs(bundle, entry.id, book);
  const isPropheticScope =
    entry.scope.includes("prophetic") || entry.scope.includes("apocalyptic");

  if (isPropheticScope) {
    out.push({
      label: entry.scope.join(", "),
      sense: entry.sense,
      refs: occRefs,
    });
  } else if (entry.sense) {
    out.push({
      label: entry.scope.join(", ") || "General",
      sense: entry.sense,
      refs: occRefs,
    });
  }

  return out;
}

export interface SenseLayersContext {
  canon: CanonSense[];
  genre: GenreSense[];
  book: BookSenseRow[];
  activeGenreId?: string;
  activeGenreLabel?: string;
  activeGenreDescription?: string;
}

/** Canon → genre → book sense tiers for a reading context. */
export function senseLayersForContext(
  entry: FigureEntry,
  bundle: FigureBundle | null | undefined,
  book?: string,
): SenseLayersContext {
  const genreCtx = book ? genreForBook(bundle, book) : undefined;

  return {
    canon: entry.canon_senses ?? [],
    genre: entry.genre_senses ?? [],
    book: book ? sensesForBook(entry, book, bundle) : [],
    activeGenreId: genreCtx?.genreId,
    activeGenreLabel: genreCtx?.meta.label,
    activeGenreDescription: genreCtx?.meta.description,
  };
}