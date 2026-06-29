import { memo } from "react";
import type { AlignableEnglishVersion } from "../utils/english-alignment";
import type { MorphWord, VerseRef, WordLocation } from "../types";
import {
  hebrewIndicesForEnglishIndex,
  strongsForEnglishIndex,
  tokenizeEnglishVerse,
} from "../utils/english-alignment";

interface EnglishVerseCellProps {
  text: string;
  version: AlignableEnglishVersion;
  verseRef: VerseRef;
  morph?: MorphWord[];
  align?: number[][];
  onWordSelect?: (
    strong: string,
    location: WordLocation,
    englishWord?: string,
  ) => void;
}

function englishCellsEqual(
  prev: EnglishVerseCellProps,
  next: EnglishVerseCellProps,
): boolean {
  return (
    prev.text === next.text &&
    prev.version === next.version &&
    prev.align === next.align &&
    prev.morph === next.morph &&
    prev.verseRef.chapter === next.verseRef.chapter &&
    prev.verseRef.verse === next.verseRef.verse &&
    prev.onWordSelect === next.onWordSelect
  );
}

export const EnglishVerseCell = memo(function EnglishVerseCell({
  text,
  version,
  verseRef,
  morph,
  align,
  onWordSelect,
}: EnglishVerseCellProps) {
  if (!text) return null;

  if (!morph?.length) {
    return <>{text}</>;
  }

  if (!align?.length) {
    return <>{text}</>;
  }

  const tokens = tokenizeEnglishVerse(text);
  const clickable = !!onWordSelect;

  return (
    <>
      {tokens.map((token, index) => {
        if (token.type !== "word" || token.wordIndex == null) {
          return <span key={index}>{token.text}</span>;
        }

        const hebrewIndices = hebrewIndicesForEnglishIndex(
          align,
          token.wordIndex,
        );
        const alignedStrongs = strongsForEnglishIndex(
          morph,
          align,
          token.wordIndex,
        );
        const isClickable =
          clickable && hebrewIndices.length > 0 && alignedStrongs.length > 0;

        const className = [
          "english-word",
          `english-word--${version}`,
          isClickable ? "english-word--clickable" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const sharedProps = {
          className,
          "data-chapter": verseRef.chapter,
          "data-verse": verseRef.verse,
          "data-english-index": token.wordIndex,
          "data-hebrew-indices": hebrewIndices.join(","),
          "data-aligned-strongs": alignedStrongs.join(","),
          "data-version": version,
        };

        if (isClickable) {
          return (
            <button
              key={index}
              type="button"
              {...sharedProps}
              onClick={() =>
                onWordSelect!(
                  alignedStrongs[0],
                  {
                    chapter: verseRef.chapter,
                    verse: verseRef.verse,
                    wordIndex: hebrewIndices[0],
                  },
                  token.text,
                )
              }
            >
              {token.text}
            </button>
          );
        }

        return (
          <span key={index} {...sharedProps}>
            {token.text}
          </span>
        );
      })}
    </>
  );
}, englishCellsEqual);