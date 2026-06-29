import type { MorphWord } from "../types";

export interface CachedBookData {
  hebrew?: string[][];
  jps?: string[][];
  kjv?: Map<string, string>;
  rsv?: Record<string, string>;

  morph?: Record<string, MorphWord[]>;
}

const bookCache = new Map<string, CachedBookData>();

export function getCachedBook(book: string): CachedBookData | undefined {
  return bookCache.get(book);
}

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