import { useCallback, useEffect, useState } from "react";
import { DEFAULT_PREFERENCES, type ViewerPreferences } from "../types";
import {
  booksForCorpus,
  clampChapter,
  defaultBookForCorpus,
  isKnownBook,
  type Corpus,
} from "../api/book-meta";

const STORAGE_KEY = "moon-view-prefs";

/** Bump when preference defaults change and should reset saved values. */
const STORAGE_VERSION = 5;

type StoredPreferences = Partial<ViewerPreferences> & {
  v?: number;
  /** Legacy key from pre-corpus storage. */
  yltDivineNames?: boolean;
};

function isCorpus(value: unknown): value is Corpus {
  return value === "torah" || value === "paul";
}

function sanitizeBook(book: string | undefined, corpus: Corpus): string {
  if (book && isKnownBook(book) && booksForCorpus(corpus).includes(book)) {
    return book;
  }
  return defaultBookForCorpus(corpus);
}

function loadPreferences(): ViewerPreferences {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem("moon-view-torah-prefs");
    if (!raw) return DEFAULT_PREFERENCES;

    const saved = JSON.parse(raw) as StoredPreferences;
    const corpus: Corpus = isCorpus(saved.corpus) ? saved.corpus : "torah";

    const lastBookByCorpus = {
      torah: sanitizeBook(
        saved.lastBookByCorpus?.torah ??
          (corpus === "torah" ? saved.book : undefined),
        "torah",
      ),
      paul: sanitizeBook(
        saved.lastBookByCorpus?.paul ??
          (corpus === "paul" ? saved.book : undefined),
        "paul",
      ),
    };

    const book = sanitizeBook(saved.book, corpus);
    const chapter =
      saved.v === STORAGE_VERSION && typeof saved.chapter === "number"
        ? clampChapter(book, saved.chapter)
        : DEFAULT_PREFERENCES.chapter;

    const lastChapterByCorpus = {
      torah:
        typeof saved.lastChapterByCorpus?.torah === "number"
          ? clampChapter(lastBookByCorpus.torah, saved.lastChapterByCorpus.torah)
          : corpus === "torah"
            ? chapter
            : 1,
      paul:
        typeof saved.lastChapterByCorpus?.paul === "number"
          ? clampChapter(lastBookByCorpus.paul, saved.lastChapterByCorpus.paul)
          : corpus === "paul"
            ? chapter
            : 1,
    };

    return {
      ...DEFAULT_PREFERENCES,
      corpus,
      book,
      chapter,
      viewMode: saved.viewMode === "analytic" ? "analytic" : "natural",
      theme: saved.theme === "papyrus" ? "papyrus" : "dark",
      naturalEnglish: saved.naturalEnglish === "jps" ? "jps" : "kjv",
      lastBookByCorpus,
      lastChapterByCorpus,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<ViewerPreferences>(loadPreferences);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...prefs, v: STORAGE_VERSION }),
    );
  }, [prefs]);

  useEffect(() => {
    document.documentElement.dataset.theme = prefs.theme;
  }, [prefs.theme]);

  const update = useCallback((patch: Partial<ViewerPreferences>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };

      if (patch.corpus && patch.corpus !== current.corpus) {
        const corpus = patch.corpus;
        next.corpus = corpus;
        next.book =
          next.lastBookByCorpus[corpus] ?? defaultBookForCorpus(corpus);
        next.chapter = next.lastChapterByCorpus[corpus] ?? 1;
      }

      if (patch.book) {
        if (!isKnownBook(patch.book)) {
          next.book = defaultBookForCorpus(next.corpus);
        } else {
          const bookCorpus = booksForCorpus(next.corpus);
          if (!bookCorpus.includes(patch.book)) {
            next.book = defaultBookForCorpus(next.corpus);
          }
        }
      }

      // Reset chapter on book change only when the caller did not set chapter.
      if (
        patch.book &&
        patch.book !== current.book &&
        patch.chapter === undefined
      ) {
        next.chapter = 1;
      }

      next.chapter = clampChapter(next.book, next.chapter);
      next.lastBookByCorpus = {
        ...next.lastBookByCorpus,
        [next.corpus]: next.book,
      };
      next.lastChapterByCorpus = {
        ...next.lastChapterByCorpus,
        [next.corpus]: next.chapter,
      };

      return next;
    });
  }, []);

  return { prefs, update };
}
