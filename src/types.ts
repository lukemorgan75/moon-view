export interface VerseRef {
  chapter: number;
  verse: number;
}

export type EnglishVersion = "kjv" | "jps" | "rsv";

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
  hebrew: boolean;
  notes: boolean;
}

export interface ViewerPreferences {
  book: string;
  chapterStart: number;
  chapterEnd: number;
  showRefs: boolean;
  showChapterHeadings: boolean;
  continuousMode: boolean;
  darkMode: boolean;
  columns: ColumnVisibility;
  notesCollapsed: boolean;
  toolbarExpanded: boolean;
}

export const DEFAULT_PREFERENCES: ViewerPreferences = {
  book: "Genesis",
  chapterStart: 1,
  chapterEnd: 50,
  showRefs: true,
  showChapterHeadings: true,
  continuousMode: false,
  darkMode: false,
  columns: {
    kjv: true,
    jps: true,
    hebrew: true,
    notes: true,
  },
  notesCollapsed: false,
  toolbarExpanded: false,
};