import { assetUrl } from "../utils/assets";

export interface RevelationVerse {
  chapter: number;
  verse: number;
  text: string;
}

export interface RevelationChapter {
  chapter: number;
  verses: RevelationVerse[];
}

interface KjvChapterPayload {
  chapter: string | number;
  verses?: Array<{ verse: string | number; text: string }>;
}

interface KjvBookPayload {
  chapters?: KjvChapterPayload[];
}

let bookPromise: Promise<RevelationChapter[]> | null = null;

export async function loadRevelationKjv(): Promise<RevelationChapter[]> {
  if (!bookPromise) {
    bookPromise = fetch(assetUrl("/data/bibles/kjv/Revelation.json"))
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load KJV Revelation.");
        const data = (await r.json()) as KjvBookPayload;
        const chapters: RevelationChapter[] = [];
        for (const ch of data.chapters ?? []) {
          const chapterNum = Number(ch.chapter);
          const verses: RevelationVerse[] = [];
          for (const v of ch.verses ?? []) {
            const text = String(v.text ?? "").trim();
            if (!text) continue;
            verses.push({
              chapter: chapterNum,
              verse: Number(v.verse),
              text,
            });
          }
          if (verses.length) {
            chapters.push({ chapter: chapterNum, verses });
          }
        }
        return chapters;
      })
      .catch((err) => {
        bookPromise = null;
        throw err;
      });
  }
  return bookPromise;
}
