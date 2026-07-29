import type { SourceLanguage } from "./book-meta";
import { assetUrl } from "../utils/assets";

export interface StrongsEntry {
  lemma: string;
  xlit: string;
  def: string;
  kjv: string;
}

export interface StrongsDictionaries {
  hebrew: Record<string, StrongsEntry>;
  greek: Record<string, StrongsEntry>;
}

const emptyDicts = (): StrongsDictionaries => ({ hebrew: {}, greek: {} });

let dictionaries: StrongsDictionaries = emptyDicts();
const langPromises = new Map<SourceLanguage, Promise<void>>();

async function loadLang(lang: SourceLanguage): Promise<void> {
  const existing = langPromises.get(lang);
  if (existing) return existing;

  const file =
    lang === "greek" ? "strongs-greek.json" : "strongs-hebrew.json";
  const label = lang === "greek" ? "Greek" : "Hebrew";

  const promise = fetch(assetUrl(`/data/${file}`))
    .then(async (r) => {
      if (!r.ok) throw new Error(`Failed to load ${label} Strong's dictionary.`);
      const data = (await r.json()) as Record<string, StrongsEntry>;
      if (lang === "greek") dictionaries.greek = data;
      else dictionaries.hebrew = data;
    })
    .catch((err) => {
      langPromises.delete(lang);
      throw err;
    });

  langPromises.set(lang, promise);
  return promise;
}

/** Load only the Strong's dictionary needed for the active source language. */
export async function loadStrongsDictionaries(
  lang?: SourceLanguage,
): Promise<StrongsDictionaries> {
  if (lang) {
    await loadLang(lang);
    return dictionaries;
  }
  await Promise.all([loadLang("hebrew"), loadLang("greek")]);
  return dictionaries;
}

export function strongsKey(strong: string, lang: SourceLanguage): string {
  const s = strong.trim();
  if (s.startsWith("H") || s.startsWith("G")) return s;
  return lang === "greek" ? `G${s}` : `H${s}`;
}

export function lookupStrongs(
  dicts: StrongsDictionaries,
  strong: string,
  lang: SourceLanguage,
): StrongsEntry | null {
  const key = strongsKey(strong, lang);
  if (key.startsWith("G")) {
    return dicts.greek[key] ?? null;
  }
  return dicts.hebrew[key] ?? null;
}
