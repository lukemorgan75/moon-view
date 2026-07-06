import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  loadHebrewNameDictionary,
  lookupHebrewName,
  type HebrewNameEntry,
} from "../api/hebrew-names";
import { useHebrewNameHighlight } from "./useHebrewNameHighlight";
import type { HebrewNameSelection, VerseRow, WordLocation } from "../types";
import { afterLayout } from "../utils/after-layout";
import {
  captureReaderPlace,
  restoreReaderPlace,
  type ReaderPlace,
} from "../utils/reader-place";
import {
  buildOccurrenceIndex,
  scrollToVerse,
} from "../utils/strongs-occurrences";

export function useHebrewNameSelection(
  verses: VerseRow[],
  book: string,
  enabled: boolean,
) {
  const [selection, setSelection] = useState<HebrewNameSelection | null>(null);
  const [dictionary, setDictionary] = useState<Record<string, HebrewNameEntry> | null>(
    null,
  );
  const placeBeforePaneToggleRef = useRef<ReaderPlace | null>(null);
  const paneOpenRef = useRef(false);

  useHebrewNameHighlight(selection);

  useLayoutEffect(() => {
    const paneOpen = !!selection;
    if (paneOpen === paneOpenRef.current) return;

    paneOpenRef.current = paneOpen;
    const place = placeBeforePaneToggleRef.current;
    placeBeforePaneToggleRef.current = null;
    if (!place) return;

    afterLayout(() => restoreReaderPlace(place, null));
  }, [selection]);

  useEffect(() => {
    if (!enabled) {
      setSelection(null);
      return;
    }
    loadHebrewNameDictionary()
      .then(setDictionary)
      .catch(() => setDictionary({}));
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

  const entry = useMemo((): HebrewNameEntry | null => {
    if (!selection || !dictionary) return null;
    return lookupHebrewName(dictionary, selection.strong);
  }, [selection, dictionary]);

  const selectName = useCallback((strong: string, active: WordLocation) => {
    placeBeforePaneToggleRef.current = captureReaderPlace();
    setSelection({ strong, active });
  }, []);

  const selectOccurrence = useCallback(
    (strong: string, occurrence: {
      chapter: number;
      verse: number;
      wordIndex: number;
    }) => {
      setSelection({
        strong,
        active: {
          chapter: occurrence.chapter,
          verse: occurrence.verse,
          wordIndex: occurrence.wordIndex,
        },
      });
      scrollToVerse(occurrence.chapter, occurrence.verse);
    },
    [],
  );

  const clearSelection = useCallback(() => {
    placeBeforePaneToggleRef.current = captureReaderPlace();
    setSelection(null);
  }, []);

  return {
    selection,
    occurrences,
    entry,
    dictionary,
    selectName,
    selectOccurrence,
    clearSelection,
  };
}