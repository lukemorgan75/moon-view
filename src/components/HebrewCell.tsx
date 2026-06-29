import { memo, useMemo } from "react";
import type { SourceLanguage } from "../api/book-meta";
import type { MorphWord } from "../types";
import { stripHtml } from "../utils/html";
import { transliterateVerse } from "../utils/transliterate";

interface HebrewCellProps {
  text: string;
  morph?: MorphWord[];
  sourceLang?: SourceLanguage;
  verseRef?: { chapter: number; verse: number };
  continuous?: boolean;
  clickable?: boolean;
  onWordSelect?: (
    strong: string,
    location: { chapter: number; verse: number; wordIndex: number },
  ) => void;
}

export const HebrewCell = memo(function HebrewCell({
  text,
  morph,
  sourceLang = "hebrew",
  verseRef,
  continuous = false,
  clickable = true,
  onWordSelect,
}: HebrewCellProps) {
  const isGreek = sourceLang === "greek";
  const textDir = isGreek ? "ltr" : "rtl";
  const textLang = isGreek ? "el" : "he";
  const strongPrefix = isGreek ? "G" : "H";

  const canClick =
    clickable && !continuous && !!morph?.length && !!verseRef && !!onWordSelect;

  if (canClick && morph && verseRef) {
    return (
      <div
        className={`hebrew-cell hebrew-cell--clickable ${isGreek ? "hebrew-cell--greek" : ""}`}
      >
        <div className="hebrew-line" dir={textDir} lang={textLang}>
          {morph.map((word, index) => (
            <button
              key={`he-${index}`}
              type="button"
              className="morph-word morph-word--hebrew"
              data-strong={word.s}
              data-chapter={verseRef.chapter}
              data-verse={verseRef.verse}
              data-word-index={index}
              dir={textDir}
              lang={textLang}
              title={`${strongPrefix}${word.s}`}
              onClick={() =>
                onWordSelect(word.s, {
                  chapter: verseRef.chapter,
                  verse: verseRef.verse,
                  wordIndex: index,
                })
              }
            >
              {word.t}
            </button>
          ))}
        </div>
        <div className="translit-line" dir="ltr">
          {morph.map((word, index) => (
            <button
              key={`tr-${index}`}
              type="button"
              className="morph-word morph-word--translit"
              data-strong={word.s}
              data-chapter={verseRef.chapter}
              data-verse={verseRef.verse}
              data-word-index={index}
              dir="ltr"
              title={`${strongPrefix}${word.s}`}
              onClick={() =>
                onWordSelect(word.s, {
                  chapter: verseRef.chapter,
                  verse: verseRef.verse,
                  wordIndex: index,
                })
              }
            >
              {word.tr ?? word.t}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const fallback = useMemo(() => stripHtml(text), [text]);
  const translit = useMemo(
    () => (isGreek ? "" : transliterateVerse(text)),
    [text, isGreek],
  );

  return (
    <div
      className={`hebrew-cell ${continuous ? "hebrew-cell--continuous" : ""} ${isGreek ? "hebrew-cell--greek" : ""}`}
    >
      <div className="hebrew-line" dir={textDir} lang={textLang}>
        {fallback}
      </div>
      {continuous ? (
        <span className="translit-line" dir="ltr">
          {translit}
        </span>
      ) : (
        <p className="translit-line" dir="ltr">
          {translit}
        </p>
      )}
    </div>
  );
});