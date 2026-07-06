import { useLayoutEffect, useRef } from "react";

/** Pin the first verse when the user picks a chapter from the menu. */
export function useScrollToChapter(
  book: string,
  chapter: number,
  verseCount: number,
  contentReady: boolean,
  onChapterSelect: (chapter: number) => void,
): void {
  const prevBookRef = useRef(book);
  const prevChapterRef = useRef(chapter);
  const onChapterSelectRef = useRef(onChapterSelect);
  onChapterSelectRef.current = onChapterSelect;

  useLayoutEffect(() => {
    if (!contentReady || verseCount < 1) return;

    if (prevBookRef.current !== book) {
      prevBookRef.current = book;
      prevChapterRef.current = chapter;
      return;
    }

    if (prevChapterRef.current === chapter) return;
    prevChapterRef.current = chapter;

    onChapterSelectRef.current(chapter);
  }, [book, chapter, verseCount, contentReady]);
}