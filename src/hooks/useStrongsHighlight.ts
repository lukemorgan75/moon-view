import { useEffect } from "react";
import type { StrongsSelection } from "../types";
import { verseDomId } from "../utils/strongs-occurrences";

function readerRoot(): ParentNode {
  return document.querySelector(".parallel-view") ?? document;
}

function clearHighlightClasses(root: ParentNode): void {
  root
    .querySelectorAll(
      ".morph-word--match, .morph-word--active, .english-word--match, .english-word--active, .verse-row--strongs-active",
    )
    .forEach((el) => {
      el.classList.remove(
        "morph-word--match",
        "morph-word--active",
        "english-word--match",
        "english-word--active",
        "verse-row--strongs-active",
      );
    });
}

function alignedStrongsList(el: Element): string[] {
  const raw = el.getAttribute("data-aligned-strongs");
  return raw ? raw.split(",").filter(Boolean) : [];
}

function hebrewIndexList(el: Element): number[] {
  const raw = el.getAttribute("data-hebrew-indices");
  return raw
    ? raw
        .split(",")
        .map((v) => Number(v))
        .filter((n) => !Number.isNaN(n))
    : [];
}

function highlightEnglishCorrespondences(
  root: ParentNode,
  selection: StrongsSelection,
): void {
  const { strong, active } = selection;

  root.querySelectorAll(".english-word").forEach((el) => {
    const strongs = alignedStrongsList(el);
    if (!strongs.includes(strong)) return;

    el.classList.add("english-word--match");

    const chapter = Number(el.getAttribute("data-chapter"));
    const verse = Number(el.getAttribute("data-verse"));
    const hebrewIndices = hebrewIndexList(el);

    if (
      chapter === active.chapter &&
      verse === active.verse &&
      hebrewIndices.includes(active.wordIndex)
    ) {
      el.classList.add("english-word--active");
    }
  });
}

export function useStrongsHighlight(selection: StrongsSelection | null): void {
  useEffect(() => {
    const root = readerRoot();
    clearHighlightClasses(root);

    if (!selection) return;

    const frame = requestAnimationFrame(() => {
      root
        .querySelectorAll(`[data-strong="${selection.strong}"]`)
        .forEach((el) => el.classList.add("morph-word--match"));

      root
        .querySelectorAll(
          `[data-strong="${selection.strong}"][data-chapter="${selection.active.chapter}"][data-verse="${selection.active.verse}"][data-word-index="${selection.active.wordIndex}"]`,
        )
        .forEach((el) => el.classList.add("morph-word--active"));

      highlightEnglishCorrespondences(root, selection);

      document
        .getElementById(
          verseDomId(selection.active.chapter, selection.active.verse),
        )
        ?.classList.add("verse-row--strongs-active");
    });

    return () => cancelAnimationFrame(frame);
  }, [selection]);
}