import { verseDomId } from "./strongs-occurrences";

const STORAGE_KEY = "moon-view-reader-place";

export interface ReaderPlace {
  verseKey: string | null;
  scrollY: number;
  /** Viewport top of the anchor element when saved (px). */
  anchorTop: number;
}

type ReaderPlaceMap = Record<string, ReaderPlace>;

function loadAllPlaces(): ReaderPlaceMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const saved = JSON.parse(raw) as ReaderPlaceMap;
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

export function loadReaderPlace(placeKey: string): ReaderPlace | null {
  const place = loadAllPlaces()[placeKey];
  if (!place || typeof place.scrollY !== "number") return null;
  return {
    verseKey: typeof place.verseKey === "string" ? place.verseKey : null,
    scrollY: place.scrollY,
    anchorTop: typeof place.anchorTop === "number" ? place.anchorTop : 0,
  };
}

export function saveReaderPlace(placeKey: string, place: ReaderPlace): void {
  const all = loadAllPlaces();
  all[placeKey] = place;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function getStickyOffset(): number {
  const root = document.documentElement;
  const header =
    parseFloat(
      getComputedStyle(root).getPropertyValue("--app-header-offset"),
    ) || 56;
  const dock =
    parseFloat(
      getComputedStyle(root).getPropertyValue("--column-focus-dock-height"),
    ) || 0;
  return header + dock + 16;
}

function verseElement(verseKey: string): HTMLElement | null {
  const [chapter, verse] = verseKey.split(":").map(Number);
  if (!chapter || !verse) return null;

  return (
    document.getElementById(verseDomId(chapter, verse)) ??
    document.querySelector<HTMLElement>(`[data-verse-key="${verseKey}"]`)
  );
}

export function findTopVisibleVerseKey(): string | null {
  const offset = getStickyOffset();
  const elements = document.querySelectorAll("[data-verse-key]");
  let best: { key: string; top: number } | null = null;

  for (const el of elements) {
    const key = el.getAttribute("data-verse-key");
    if (!key) continue;
    const top = el.getBoundingClientRect().top;
    if (top <= offset + 8) {
      if (!best || top > best.top) best = { key, top };
    }
  }

  if (best) return best.key;

  for (const el of elements) {
    const key = el.getAttribute("data-verse-key");
    if (key) return key;
  }

  return null;
}

export function captureReaderPlace(): ReaderPlace {
  const verseKey = findTopVisibleVerseKey();
  const anchor = verseKey ? verseElement(verseKey) : null;

  return {
    verseKey,
    scrollY: window.scrollY,
    anchorTop: anchor?.getBoundingClientRect().top ?? 0,
  };
}

function scrollToVerseKey(
  verseKey: string,
  block: ScrollLogicalPosition,
): boolean {
  const el = verseElement(verseKey);
  if (!el) return false;
  el.scrollIntoView({ block, behavior: "auto" });
  return true;
}

export function restoreReaderPlace(
  place: ReaderPlace,
  pinnedVerse: string | null,
): boolean {
  if (pinnedVerse) {
    return scrollToVerseKey(pinnedVerse, "center");
  }

  if (place.verseKey) {
    const el = verseElement(place.verseKey);
    if (el) {
      el.scrollIntoView({ block: "start", behavior: "auto" });
      if (place.anchorTop) {
        const delta = el.getBoundingClientRect().top - place.anchorTop;
        if (Math.abs(delta) > 1) window.scrollBy(0, delta);
      }
      return true;
    }
  }

  if (place.scrollY > 0) {
    window.scrollTo({ top: place.scrollY, behavior: "auto" });
    return true;
  }

  return false;
}