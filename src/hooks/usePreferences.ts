import { useCallback, useEffect, useState } from "react";
import { DEFAULT_PREFERENCES, type ViewerPreferences } from "../types";
import {
  clampChapter,
  isTorahBook,
  TORAH_BOOK_NAMES,
} from "../api/book-meta";

const STORAGE_KEY = "moon-view-torah-prefs";

/** Bump when preference defaults change and should reset saved values. */
const STORAGE_VERSION = 4;

type StoredPreferences = Partial<ViewerPreferences> & { v?: number };

function loadPreferences(): ViewerPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;

    const saved = JSON.parse(raw) as StoredPreferences;
    const yltDivineNames =
      (saved.v === STORAGE_VERSION || saved.v === 3) &&
      typeof saved.yltDivineNames === "boolean"
        ? saved.yltDivineNames
        : DEFAULT_PREFERENCES.yltDivineNames;

    const book =
      saved.book && isTorahBook(saved.book)
        ? saved.book
        : DEFAULT_PREFERENCES.book;
    const chapter =
      saved.v === STORAGE_VERSION && typeof saved.chapter === "number"
        ? clampChapter(book, saved.chapter)
        : DEFAULT_PREFERENCES.chapter;

    return {
      ...DEFAULT_PREFERENCES,
      book,
      chapter,
      viewMode: saved.viewMode === "analytic" ? "analytic" : "natural",
      theme: saved.theme === "papyrus" ? "papyrus" : "dark",
      naturalEnglish: saved.naturalEnglish === "jps" ? "jps" : "kjv",
      yltDivineNames,
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
      if (patch.book && !isTorahBook(patch.book)) {
        next.book = TORAH_BOOK_NAMES[0];
      }
      if (patch.book && patch.book !== current.book) {
        next.chapter = 1;
      }
      next.chapter = clampChapter(next.book, next.chapter);
      return next;
    });
  }, []);

  return { prefs, update };
}