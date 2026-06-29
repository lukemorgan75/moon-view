export interface VerseRef {
  chapter: number;
  verse: number;
}

export type EnglishVersion = "kjv" | "jps" | "ylt";

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

export interface VerseRow {
  ref: VerseRef;
  hebrew: string;
  english: Partial<Record<EnglishVersion, string>>;
  morph?: MorphWord[];
}

export interface ColumnVisibility {
  kjv: boolean;
  jps: boolean;
  ylt: boolean;
  hebrew: boolean;
  notes: boolean;
}

export interface ViewerPreferences {
  book: string;
  viewMode: ViewMode;
  theme: ThemeMode;
  naturalEnglish: NaturalEnglishVersion;
  yltDivineNames: boolean;
}

export const DEFAULT_PREFERENCES: ViewerPreferences = {
  book: "Genesis",
  viewMode: "natural",
  theme: "dark",
  naturalEnglish: "kjv",
  yltDivineNames: false,
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
  const useJps = prefs.naturalEnglish === "jps";
  const englishColumns = {
    kjv: !useJps,
    jps: useJps,
    ylt: true,
  };

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