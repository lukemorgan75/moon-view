import { getBookMeta } from "./book-meta";
import { assetUrl } from "../utils/assets";
import type { MorphWord } from "../types";

const bookCache = new Map<string, Record<string, MorphWord[]>>();

export async function loadBookMorph(
  book: string,
): Promise<Record<string, MorphWord[]>> {
  const cached = bookCache.get(book);
  if (cached) return cached;

  const morphId = getBookMeta(book).morphId;

  const response = await fetch(assetUrl(`/data/morph/${morphId}.json`));
  if (!response.ok) return {};

  const data = (await response.json()) as Record<string, MorphWord[]>;
  bookCache.set(book, data);
  return data;
}