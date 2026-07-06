import { useEffect } from "react";
import type { HebrewNameSelection } from "../types";
import { verseDomId } from "../utils/strongs-occurrences";

function readerRoot(): ParentNode {
  return document.querySelector(".parallel-view") ?? document;
}

function clearHighlightClasses(root: ParentNode): void {
  root
    .querySelectorAll(
      ".morph-word--name-match, .morph-word--name-active, .verse-row--name-active",
    )
    .forEach((el) => {
      el.classList.remove(
        "morph-word--name-match",
        "morph-word--name-active",
        "verse-row--name-active",
      );
    });
}

export function useHebrewNameHighlight(
  selection: HebrewNameSelection | null,
): void {
  useEffect(() => {
    const root = readerRoot();
    clearHighlightClasses(root);

    if (!selection) return;

    const frame = requestAnimationFrame(() => {
      root
        .querySelectorAll(`[data-strong="${selection.strong}"]`)
        .forEach((el) => el.classList.add("morph-word--name-match"));

      root
        .querySelectorAll(
          `[data-strong="${selection.strong}"][data-chapter="${selection.active.chapter}"][data-verse="${selection.active.verse}"][data-word-index="${selection.active.wordIndex}"]`,
        )
        .forEach((el) => el.classList.add("morph-word--name-active"));

      document
        .getElementById(
          verseDomId(selection.active.chapter, selection.active.verse),
        )
        ?.classList.add("verse-row--name-active");
    });

    return () => cancelAnimationFrame(frame);
  }, [selection]);
}