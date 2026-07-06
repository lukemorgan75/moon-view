import { assetUrl } from "../utils/assets";

export type HebrewNameKind = "person" | "place" | "name";

export interface HebrewNameEntry {
  strong: string;
  lemma: string;
  xlit: string;
  english: string;
  meaning: string;
  context: string;
  kind: HebrewNameKind;
}

type HebrewNameDictionary = Record<string, HebrewNameEntry>;

let dictionary: HebrewNameDictionary | null = null;
let loadPromise: Promise<HebrewNameDictionary> | null = null;

export async function loadHebrewNameDictionary(): Promise<HebrewNameDictionary> {
  if (dictionary) return dictionary;
  if (!loadPromise) {
    loadPromise = fetch(assetUrl("/data/hebrew-names.json"))
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load Hebrew name dictionary.");
        }
        return response.json() as Promise<HebrewNameDictionary>;
      })
      .then((data) => {
        dictionary = data;
        return data;
      });
  }
  return loadPromise;
}

export function lookupHebrewName(
  dict: HebrewNameDictionary,
  strong: string,
): HebrewNameEntry | null {
  return dict[strong] ?? null;
}

export function hasHebrewNameEntry(
  dict: HebrewNameDictionary | null,
  strong: string,
): boolean {
  return !!dict && strong in dict;
}

export function hebrewNameKindLabel(kind: HebrewNameKind): string {
  switch (kind) {
    case "person":
      return "Person";
    case "place":
      return "Place";
    default:
      return "Name";
  }
}