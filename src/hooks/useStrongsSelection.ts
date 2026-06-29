import { useCallback, useEffect, useMemo, useState } from "react";
import { getBookMeta, type SourceLanguage } from "../api/book-meta";
import {
  loadStrongsDictionaries,
  lookupStrongs,
  type StrongsDictionaries,
  type StrongsEntry,
} from "../api/strongs";
import { useStrongsHighlight } from "./useStrongsHighlight";
import type {
  StrongOccurrence,
  StrongsSelection,
  VerseRow,
  WordLocation,
} from "../types";
import {
  buildOccurrenceIndex,
  scrollToVerse,
} from "../utils/strongs-occurrences";

export function useStrongsSelection(
  verses: VerseRow[],
  book: string,
  enabled: boolean,
) {
  const sourceLang: SourceLanguage = getBookMeta(book).sourceLanguage;
  const [selection, setSelection] = useState<StrongsSelection | null>(null);
  const [dictionaries, setDictionaries] = useState<StrongsDictionaries | null>(
    null,
  );

  useStrongsHighlight(selection);

  useEffect(() => {
    if (!enabled) {
      setSelection(null);
      return;
    }
    loadStrongsDictionaries()
      .then(setDictionaries)
      .catch(() => setDictionaries({ hebrew: {}, greek: {} }));
  }, [enabled]);

  useEffect(() => {
    setSelection(null);
  }, [verses, book]);

  const occurrenceIndex = useMemo(
    () => (enabled ? buildOccurrenceIndex(verses) : new Map()),
    [verses, enabled],
  );

  const occurrences = useMemo(() => {
    if (!selection) return [];
    return occurrenceIndex.get(selection.strong) ?? [];
  }, [occurrenceIndex, selection]);

  const entry = useMemo((): StrongsEntry | null => {
    if (!selection || !dictionaries) return null;
    return lookupStrongs(dictionaries, selection.strong, selection.sourceLang);
  }, [selection, dictionaries]);

  const selectWord = useCallback(
    (strong: string, active: WordLocation, englishWord?: string) => {
      setSelection({ strong, active, englishWord, sourceLang });
    },
    [sourceLang],
  );

  const selectOccurrence = useCallback(
    (strong: string, occurrence: StrongOccurrence) => {
      setSelection({
        strong,
        active: {
          chapter: occurrence.chapter,
          verse: occurrence.verse,
          wordIndex: occurrence.wordIndex,
        },
        sourceLang,
      });
      scrollToVerse(occurrence.chapter, occurrence.verse);
    },
    [sourceLang],
  );

  const clearSelection = useCallback(() => setSelection(null), []);

  return {
    selection,
    occurrences,
    entry,
    sourceLang,
    selectWord,
    selectOccurrence,
    clearSelection,
  };
}