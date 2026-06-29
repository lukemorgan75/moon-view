import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "moon-view-pinned-verse";

type PinnedVerseMap = Record<string, string>;

function loadPinnedVerses(): PinnedVerseMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const saved = JSON.parse(raw) as PinnedVerseMap;
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

export function usePinnedVerse(book: string) {
  const [pinnedByBook, setPinnedByBook] = useState<PinnedVerseMap>(
    loadPinnedVerses,
  );

  const pinnedVerse = pinnedByBook[book] ?? null;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pinnedByBook));
  }, [pinnedByBook]);

  const togglePinnedVerse = useCallback(
    (verseKey: string) => {
      setPinnedByBook((current) => {
        const next = { ...current };
        if (current[book] === verseKey) {
          delete next[book];
        } else {
          next[book] = verseKey;
        }
        return next;
      });
    },
    [book],
  );

  const clearPinnedVerse = useCallback(() => {
    setPinnedByBook((current) => {
      if (!(book in current)) return current;
      const next = { ...current };
      delete next[book];
      return next;
    });
  }, [book]);

  return { pinnedVerse, togglePinnedVerse, clearPinnedVerse };
}