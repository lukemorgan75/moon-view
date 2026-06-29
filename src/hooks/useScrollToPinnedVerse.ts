import { useLayoutEffect } from "react";
import type { ViewMode } from "../types";
import { verseDomId } from "../utils/strongs-occurrences";

export function useScrollToPinnedVerse(
  pinnedVerse: string | null,
  verseCount: number,
  viewMode: ViewMode,
): void {
  useLayoutEffect(() => {
    if (!pinnedVerse || verseCount < 1) return;

    const [chapter, verse] = pinnedVerse.split(":").map(Number);
    if (!chapter || !verse) return;

    const id = verseDomId(chapter, verse);

    const scrollToTarget = () => {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ block: "center", behavior: "auto" });
      return true;
    };

    scrollToTarget();
    requestAnimationFrame(() => {
      scrollToTarget();
      requestAnimationFrame(scrollToTarget);
    });
  }, [pinnedVerse, verseCount, viewMode]);
}