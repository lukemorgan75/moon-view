import { memo } from "react";
import { YltRichText } from "./YltRichText";
import type { AlignableEnglishVersion } from "../utils/english-alignment";
import type { MorphWord, VerseRef, ViewMode, WordLocation } from "../types";
import {
  hebrewIndicesForEnglishIndex,
  strongsForEnglishIndex,
  tokenizeEnglishVerse,
} from "../utils/english-alignment";
import { formatYltPlain } from "../utils/ylt-format";
import { yltRootHighlightClass } from "../utils/ylt-root-highlights";

interface EnglishVerseCellProps {
  text: string;
  version: AlignableEnglishVersion;
  verseRef: VerseRef;
  morph?: MorphWord[];
  align?: number[][];
  viewMode?: ViewMode;
  yltDivineNames?: boolean;
  yltRaw?: string;
  yltRichText?: boolean;
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
    prev.onWordSelect === next.onWordSelect &&
    prev.yltRichText === next.yltRichText &&
    prev.viewMode === next.viewMode &&
    prev.yltDivineNames === next.yltDivineNames &&
    prev.yltRaw === next.yltRaw
  );
}

export const EnglishVerseCell = memo(function EnglishVerseCell({
  text,
  version,
  verseRef,
  morph,
  align,
  viewMode = "analytic",
  yltDivineNames = false,
  yltRaw,
  yltRichText = false,
  onWordSelect,
}: EnglishVerseCellProps) {
  if (!text) return null;

  const canHighlightYlt =
    version === "ylt" && !!morph?.length && !!align?.length && !!yltRaw;

  if (version === "ylt" && yltRichText && !canHighlightYlt) {
    return <YltRichText html={text} />;
  }

  if (!morph?.length) {
    return <>{text}</>;
  }

  if (!align?.length) {
    return <>{text}</>;
  }

  const tokenizeSource =
    version === "ylt" && yltRaw
      ? formatYltPlain(yltRaw, viewMode, { divineNames: yltDivineNames })
      : text;

  const tokens = tokenizeEnglishVerse(tokenizeSource);
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

        const rootClass =
          version === "ylt" ? yltRootHighlightClass(alignedStrongs) : null;

        const className = [
          "english-word",
          `english-word--${version}`,
          isClickable ? "english-word--clickable" : "",
          rootClass ?? "",
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