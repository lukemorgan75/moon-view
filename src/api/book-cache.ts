import type { MorphWord } from "../types";

export interface CachedBookData {
  hebrew?: string[][];
  kjv?: Map<string, string>;
  jps?: Map<string, string>;
  ylt?: Record<string, string>;
  morph?: Record<string, MorphWord[]>;
}

const bookCache = new Map<string, CachedBookData>();

export function getOrCreateCachedBook(book: string): CachedBookData {
  let cached = bookCache.get(book);
  if (!cached) {
    cached = {};
    bookCache.set(book, cached);
  }
  return cached;
}

export function clearBookCache(): void {
  bookCache.clear();
}