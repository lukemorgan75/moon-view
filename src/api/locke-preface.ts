import { assetUrl } from "../utils/assets";

export interface LockePrefaceSource {
  author?: string;
  work?: string;
  section?: string;
  edition?: string;
  url: string;
  note?: string;
}

export interface LockePrefaceData {
  source: LockePrefaceSource;
  title?: string;
  paragraphs: string[];
  incomplete?: boolean;
}

let loadPromise: Promise<LockePrefaceData> | null = null;

export async function loadLockePreface(): Promise<LockePrefaceData> {
  if (!loadPromise) {
    loadPromise = fetch(assetUrl("/data/locke-preface.json"))
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load Locke's preface.");
        return (await r.json()) as LockePrefaceData;
      })
      .catch((err) => {
        loadPromise = null;
        throw err;
      });
  }
  return loadPromise;
}

export const LOCKE_PREFACE_SOURCE_URL =
  "https://archive.org/details/aparaphraseandn00lockgoog";
