import { useEffect, useMemo, useState } from "react";
import type { SourceLanguage } from "../api/book-meta";
import { loadStrongsDictionaries } from "../api/strongs";
import type { AlignableEnglishVersion } from "../utils/english-alignment";
import { buildEnglishAlignments } from "../utils/english-alignment";
import type { VerseRow } from "../types";

export type VerseAlignMap = Map<
  string,
  Partial<Record<AlignableEnglishVersion, number[][]>>
>;

function verseAlignKey(chapter: number, verse: number): string {
  return `${chapter}:${verse}`;
}

export function useEnglishAlignment(
  verses: VerseRow[],
  sourceLang: SourceLanguage,
  enabled: boolean,
): VerseAlignMap {
  // Alignments run after text is shown (idle chunks) so the reader stays responsive.
  const [alignMap, setAlignMap] = useState<VerseAlignMap>(() => new Map());

  const versesKey = useMemo(() => {
    if (!verses.length) return "";
    const first = verses[0].ref;
    const last = verses[verses.length - 1].ref;
    return `${first.chapter}:${first.verse}-${last.chapter}:${last.verse}:${verses.length}`;
  }, [verses]);

  useEffect(() => {
    setAlignMap(new Map());
    if (!enabled || !verses.length) return;

    let cancelled = false;
    let idleId = 0;

    const schedule = (fn: () => void) => {
      if (typeof requestIdleCallback !== "undefined") {
        idleId = requestIdleCallback(fn, { timeout: 120 });
      } else {
        idleId = window.setTimeout(fn, 0) as unknown as number;
      }
    };

    const cancel = () => {
      if (typeof cancelIdleCallback !== "undefined") {
        cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
    };

    (async () => {
      const strongs = await loadStrongsDictionaries(sourceLang);
      if (cancelled) return;

      let index = 0;
      const CHUNK = 80;
      const result = new Map<
        string,
        Partial<Record<AlignableEnglishVersion, number[][]>>
      >();

      const processChunk = () => {
        if (cancelled) return;

        const end = Math.min(index + CHUNK, verses.length);

        for (; index < end; index++) {
          const row = verses[index];
          if (!row.morph?.length) continue;
          const align = buildEnglishAlignments(
            row.morph,
            row.english,
            strongs,
            sourceLang,
          );
          if (!align.ylt && !align.kjv && !align.esv) continue;
          result.set(verseAlignKey(row.ref.chapter, row.ref.verse), align);
        }

        if (index < verses.length) {
          schedule(processChunk);
          return;
        }

        if (!cancelled) setAlignMap(result);
      };

      schedule(processChunk);
    })();

    return () => {
      cancelled = true;
      cancel();
    };
  }, [versesKey, sourceLang, enabled]);

  return alignMap;
}