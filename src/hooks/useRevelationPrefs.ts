import { useCallback, useEffect, useState } from "react";
import type { ThemeMode } from "../types";
import { parseRoute } from "../utils/app-routing";

const STORAGE_KEY = "moon-view-revelation-prefs";
const STORAGE_VERSION = 1;

export interface RevelationPrefs {
  showVerseNumbers: boolean;
  showChapterNumbers: boolean;
  chapter: number;
  theme: ThemeMode;
}

const DEFAULTS: RevelationPrefs = {
  showVerseNumbers: true,
  showChapterNumbers: true,
  chapter: 1,
  theme: "dark",
};

type Stored = Partial<RevelationPrefs> & { v?: number };

function clampRevChapter(chapter: number): number {
  return Math.max(1, Math.min(22, Math.floor(chapter)));
}

function loadFromStorage(): RevelationPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Inherit global theme if present
      const global =
        localStorage.getItem("moon-view-prefs") ??
        localStorage.getItem("moon-view-torah-prefs");
      if (global) {
        const g = JSON.parse(global) as { theme?: string };
        if (g.theme === "papyrus" || g.theme === "dark") {
          return { ...DEFAULTS, theme: g.theme };
        }
      }
      return DEFAULTS;
    }
    const saved = JSON.parse(raw) as Stored;
    return {
      showVerseNumbers:
        typeof saved.showVerseNumbers === "boolean"
          ? saved.showVerseNumbers
          : DEFAULTS.showVerseNumbers,
      showChapterNumbers:
        typeof saved.showChapterNumbers === "boolean"
          ? saved.showChapterNumbers
          : DEFAULTS.showChapterNumbers,
      chapter:
        typeof saved.chapter === "number" && saved.chapter >= 1
          ? clampRevChapter(saved.chapter)
          : DEFAULTS.chapter,
      theme: saved.theme === "papyrus" ? "papyrus" : "dark",
    };
  } catch {
    return DEFAULTS;
  }
}

function applyHashPlace(base: RevelationPrefs): RevelationPrefs {
  if (typeof window === "undefined") return base;
  const route = parseRoute(window.location.hash);
  if (route.route !== "revelation" || route.chapter == null) return base;
  return { ...base, chapter: clampRevChapter(route.chapter) };
}

function load(): RevelationPrefs {
  return applyHashPlace(loadFromStorage());
}

export function useRevelationPrefs() {
  const [prefs, setPrefs] = useState<RevelationPrefs>(load);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...prefs, v: STORAGE_VERSION }),
    );
  }, [prefs]);

  useEffect(() => {
    document.documentElement.dataset.theme = prefs.theme;
  }, [prefs.theme]);

  const update = useCallback((patch: Partial<RevelationPrefs>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      if (typeof next.chapter === "number") {
        next.chapter = Math.max(1, Math.min(22, Math.floor(next.chapter)));
      }
      return next;
    });
  }, []);

  return { prefs, update };
}
