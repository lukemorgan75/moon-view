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

let dictionaries: StrongsDictionaries | null = null;
let loadPromise: Promise<StrongsDictionaries> | null = null;

export async function loadStrongsDictionaries(): Promise<StrongsDictionaries> {
  if (dictionaries) return dictionaries;
  if (!loadPromise) {
    loadPromise = Promise.all([
      fetch(assetUrl("/data/strongs-hebrew.json")).then((r) => {
        if (!r.ok) throw new Error("Failed to load Hebrew Strong's dictionary.");
        return r.json() as Promise<Record<string, StrongsEntry>>;
      }),
      fetch(assetUrl("/data/strongs-greek.json")).then((r) => {
        if (!r.ok) throw new Error("Failed to load Greek Strong's dictionary.");
        return r.json() as Promise<Record<string, StrongsEntry>>;
      }),
    ]).then(([hebrew, greek]) => {
      dictionaries = { hebrew, greek };
      return dictionaries;
    });
  }
  return loadPromise;
}

/** @deprecated Use loadStrongsDictionaries */
export async function loadStrongsDictionary(): Promise<
  Record<string, StrongsEntry>
> {
  const dicts = await loadStrongsDictionaries();
  return dicts.hebrew;
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