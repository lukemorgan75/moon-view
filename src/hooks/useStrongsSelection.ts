import { useCallback, useEffect, useMemo, useState } from "react";
import { getBookMeta, type SourceLanguage } from "../api/book-meta";
import {
  loadFigureDictionary,
  lookupFigures,
  type FigureBundle,
  type FigureLookupResult,
} from "../api/figures";
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
  const [figureBundle, setFigureBundle] = useState<FigureBundle | null>(null);

  useStrongsHighlight(selection);

  useEffect(() => {
    if (!enabled) {
      setSelection(null);
      return;
    }
    loadStrongsDictionaries()
      .then(setDictionaries)
      .catch(() => setDictionaries({ hebrew: {}, greek: {} }));
    loadFigureDictionary()
      .then(setFigureBundle)
      .catch(() => setFigureBundle(null));
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

  const figureMatches: FigureLookupResult[] = useMemo(() => {
    if (!selection || !figureBundle) return [];
    return lookupFigures(figureBundle, {
      he: selection.strong,
      en: selection.englishWord,
    });
  }, [selection, figureBundle]);

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
    figureMatches,
    figureBundle,
    sourceLang,
    selectWord,
    selectOccurrence,
    clearSelection,
  };
}