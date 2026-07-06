import { englishText } from "../api/bible";
import type { VerseRow, ViewMode } from "../types";
import {
  strongsForEnglishIndex,
  tokenizeEnglishVerse,
} from "../utils/english-alignment";
import { formatYltPlain } from "../utils/ylt-format";
import { yltRootHighlightClass } from "../utils/ylt-root-highlights";

interface YltRootHighlightTextProps {
  row: VerseRow;
  align?: number[][];
  yltDivineNames: boolean;
  viewMode: ViewMode;
}

export function YltRootHighlightText({
  row,
  align,
  yltDivineNames,
  viewMode,
}: YltRootHighlightTextProps) {
  const raw = englishText(row, "ylt");
  if (!raw) return null;

  const plain = formatYltPlain(raw, viewMode, {
    divineNames: yltDivineNames,
  });

  const morph = row.morph;
  if (!morph?.length || !align?.length) {
    return <>{plain}</>;
  }

  const tokens = tokenizeEnglishVerse(plain);

  return (
    <>
      {tokens.map((token, index) => {
        if (token.type !== "word" || token.wordIndex == null) {
          return <span key={index}>{token.text}</span>;
        }

        const highlightClass = yltRootHighlightClass(
          strongsForEnglishIndex(morph, align, token.wordIndex),
        );

        if (!highlightClass) {
          return <span key={index}>{token.text}</span>;
        }

        return (
          <span key={index} className={highlightClass}>
            {token.text}
          </span>
        );
      })}
    </>
  );
}