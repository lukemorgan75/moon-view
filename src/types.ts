import type { Corpus } from "./api/book-meta";
import { getBookMeta } from "./api/book-meta";

export interface VerseRef {
  chapter: number;
  verse: number;
}

export type EnglishVersion = "kjv" | "jps" | "ylt" | "esv";

export type NaturalEnglishVersion = "kjv" | "jps";

export type ViewMode = "natural" | "analytic";

export type ThemeMode = "dark" | "papyrus";

export interface MorphWord {
  t: string;
  s: string;
  l: string;
  m: string;
  tr?: string;
}

export interface WordLocation {
  chapter: number;
  verse: number;
  wordIndex: number;
}

export interface StrongOccurrence extends WordLocation {
  hebrew: string;
  translit: string;
}

export interface StrongsSelection {
  strong: string;
  active: WordLocation;
  englishWord?: string;
  sourceLang: "hebrew" | "greek";
}

export interface HebrewNameSelection {
  strong: string;
  active: WordLocation;
}

export interface WordSelectOptions {
  morphTag?: string;
  englishWord?: string;
}

export type WordSelectHandler = (
  strong: string,
  location: WordLocation,
  options?: WordSelectOptions,
) => void;

export interface VerseRow {
  ref: VerseRef;
  /** Source-language verse text (Hebrew or Greek). */
  hebrew: string;
  english: Partial<Record<EnglishVersion, string>>;
  morph?: MorphWord[];
}

export interface ColumnVisibility {
  kjv: boolean;
  jps: boolean;
  ylt: boolean;
  esv: boolean;
  hebrew: boolean;
  notes: boolean;
}

export interface ViewerPreferences {
  corpus: Corpus;
  book: string;
  chapter: number;
  viewMode: ViewMode;
  theme: ThemeMode;
  /** Torah only: KJV vs JPS in the first English column. */
  naturalEnglish: NaturalEnglishVersion;
  /** Last book per corpus for fast restore when switching. */
  lastBookByCorpus: Record<Corpus, string>;
  lastChapterByCorpus: Record<Corpus, number>;
}

export const DEFAULT_PREFERENCES: ViewerPreferences = {
  corpus: "torah",
  book: "Genesis",
  chapter: 1,
  viewMode: "natural",
  theme: "dark",
  naturalEnglish: "kjv",
  lastBookByCorpus: { torah: "Genesis", paul: "Romans" },
  lastChapterByCorpus: { torah: 1, paul: 1 },
};

export interface DerivedViewState {
  chapterStart: number;
  chapterEnd: number;
  continuousMode: boolean;
  showRefs: boolean;
  showChapterHeadings: boolean;
  columns: ColumnVisibility;
  notesCollapsed: boolean;
}

export function deriveViewState(
  prefs: ViewerPreferences,
  chapterCount: number,
): DerivedViewState {
  const isPaul = prefs.corpus === "paul";

  let englishColumns: Pick<ColumnVisibility, "kjv" | "jps" | "ylt" | "esv">;
  if (isPaul) {
    englishColumns = {
      kjv: true,
      jps: false,
      ylt: false,
      esv: true,
    };
  } else {
    const useJps = prefs.naturalEnglish === "jps";
    englishColumns = {
      kjv: !useJps,
      jps: useJps,
      ylt: true,
      esv: false,
    };
  }

  if (prefs.viewMode === "natural") {
    return {
      chapterStart: 1,
      chapterEnd: chapterCount,
      continuousMode: true,
      showRefs: false,
      showChapterHeadings: false,
      columns: {
        ...englishColumns,
        hebrew: false,
        notes: false,
      },
      notesCollapsed: false,
    };
  }

  return {
    chapterStart: 1,
    chapterEnd: chapterCount,
    continuousMode: false,
    showRefs: true,
    showChapterHeadings: true,
    columns: {
      ...englishColumns,
      hebrew: true,
      notes: true,
    },
    notesCollapsed: false,
  };
}

export function sourceLanguageForPrefs(prefs: ViewerPreferences) {
  return getBookMeta(prefs.book).sourceLanguage;
}
