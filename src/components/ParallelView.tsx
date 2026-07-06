import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReaderPlace } from "../hooks/useReaderPlace";
import { useScrollToChapter } from "../hooks/useScrollToChapter";
import { getBookMeta, sourceLanguageLabel } from "../api/book-meta";
import {
  activeEnglishVersions,
  englishVersionLabel,
  englishVersionShortLabel,
} from "../api/constants";
import { hasHebrewNameEntry } from "../api/hebrew-names";
import { useEnglishAlignment } from "../hooks/useEnglishAlignment";
import { useHebrewNameSelection } from "../hooks/useHebrewNameSelection";
import { usePinnedVerse } from "../hooks/usePinnedVerse";
import { useReaderGrid } from "../hooks/useReaderGrid";
import { useStrongsSelection } from "../hooks/useStrongsSelection";
import type {
  DerivedViewState,
  EnglishVersion,
  VerseRow,
  ViewerPreferences,
  WordSelectHandler,
} from "../types";
import type { AlignableEnglishVersion } from "../utils/english-alignment";
import { displayEnglish, groupVersesByChapter } from "../utils/prose";
import { verseDomId } from "../utils/strongs-occurrences";
import { EnglishVerseCell } from "./EnglishVerseCell";
import { HebrewCell } from "./HebrewCell";
import { HebrewNamePane } from "./HebrewNamePane";
import { StrongsPane } from "./StrongsPane";
import { isProperNoun } from "../utils/morph-tags";
import { YltRichText } from "./YltRichText";


interface ParallelViewProps {
  verses: VerseRow[];
  prefs: ViewerPreferences;
  view: DerivedViewState;
  notes: Record<string, string>;
  onNoteChange: (key: string, value: string) => void;
  contentReady: boolean;
}

function verseKey(chapter: number, verse: number): string {
  return `${chapter}:${verse}`;
}

function NotesCell({
  noteKey,
  notes,
  collapsed,
  onNoteChange,
  rows = 3,
}: {
  noteKey: string;
  notes: Record<string, string>;
  collapsed: boolean;
  onNoteChange: (key: string, value: string) => void;
  rows?: number;
}) {
  if (collapsed) {
    const hasNote = Boolean(notes[noteKey]?.trim());

    return (
      <span
        className={`notes-indicator${hasNote ? " notes-indicator--filled" : ""}`}
        title={hasNote ? "Note saved" : "No note"}
        aria-hidden={!hasNote}
      />
    );
  }

  return (
    <textarea
      className="notes-input"
      value={notes[noteKey] ?? ""}
      placeholder="Notes…"
      rows={rows}
      onChange={(e) => onNoteChange(noteKey, e.target.value)}
    />
  );
}

function ColumnHeaders({
  gridTemplate,
  showRefs,
  view,
  book,
  subtle = false,
  englishCols,
  focusable = false,
  focusedVersion = null,
  onVersionFocus,
  onCollapseFocus,
}: {
  gridTemplate: string;
  showRefs: boolean;
  view: DerivedViewState;
  book: string;
  subtle?: boolean;
  englishCols?: EnglishVersion[];
  focusable?: boolean;
  focusedVersion?: EnglishVersion | null;
  onVersionFocus?: (version: EnglishVersion) => void;
  onCollapseFocus?: () => void;
}) {
  const cols = englishCols ?? activeEnglishVersions(view.columns);
  const englishLabel = subtle ? englishVersionShortLabel : englishVersionLabel;

  if (focusable && focusedVersion) {
    return (
      <div className="column-header-row column-header-row--subtle column-header-row--solo">
        <div className="column-focus-bar">
          <span className="header-cell header-cell--subtle header-cell--focused">
            {englishLabel(focusedVersion)}
          </span>
          <button
            type="button"
            className="column-focus-collapse"
            onClick={onCollapseFocus}
            aria-label="Show all columns"
          >
            All columns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`row column-header-row${subtle ? " column-header-row--subtle" : ""}`}
      style={{ gridTemplateColumns: gridTemplate }}
    >
      {showRefs && <div className="cell ref-cell" />}
      {cols.map((version) =>
        focusable ? (
          <button
            key={version}
            type="button"
            className={`cell header-cell header-cell--focusable${subtle ? " header-cell--subtle" : ""}`}
            onClick={() => onVersionFocus?.(version)}
            aria-label={`Show only ${englishLabel(version)}`}
            title={`Show only ${englishLabel(version)}`}
          >
            {englishLabel(version)}
          </button>
        ) : (
          <div
            key={version}
            className={`cell header-cell${subtle ? " header-cell--subtle" : ""}`}
          >
            {englishLabel(version)}
          </div>
        ),
      )}
      {view.columns.hebrew && (
        <div
          className={`cell header-cell${subtle ? " header-cell--subtle" : ""}`}
        >
          {subtle
            ? sourceLanguageLabel(book)
            : `${sourceLanguageLabel(book)} + Transliteration`}
        </div>
      )}
      {view.columns.notes && (
        <div
          className={`cell header-cell notes-header${subtle ? " header-cell--subtle" : ""}`}
        >
          Notes
        </div>
      )}
    </div>
  );
}

function EnglishCells({
  row,
  view,
  viewMode,
  yltDivineNames,
  onWordSelect,
  verseAlign,
}: {
  row: VerseRow | VerseRow[];
  view: DerivedViewState;
  viewMode: ViewerPreferences["viewMode"];
  yltDivineNames: boolean;
  onWordSelect?: WordSelectHandler;
  verseAlign?: Partial<Record<AlignableEnglishVersion, number[][]>>;
}) {
  const rows = Array.isArray(row) ? row : [row];
  const englishCols = activeEnglishVersions(view.columns);
  const verseRow = rows[0];
  const alignable = (version: AlignableEnglishVersion) =>
    (version === "kjv" || version === "ylt") && verseRow.morph?.length;

  return (
    <>
      {englishCols.map((version) => (
        <div
          key={version}
          className={`cell text-cell ${version === "ylt" ? "text-cell--ylt" : ""}`}
        >
          {alignable(version as AlignableEnglishVersion) ? (
            <EnglishVerseCell
              text={displayEnglish(
                verseRow,
                version,
                viewMode,
                yltDivineNames,
              )}
              version={version as AlignableEnglishVersion}
              verseRef={verseRow.ref}
              morph={verseRow.morph}
              align={verseAlign?.[version as AlignableEnglishVersion]}
              yltRichText={version === "ylt" && yltDivineNames}
              onWordSelect={onWordSelect}
            />
          ) : version === "ylt" && yltDivineNames ? (
            <YltRichText
              html={displayEnglish(
                verseRow,
                version,
                viewMode,
                yltDivineNames,
              )}
            />
          ) : (
            displayEnglish(verseRow, version, viewMode, yltDivineNames)
          )}
        </div>
      ))}
    </>
  );
}

function proseVerseClassName(
  key: string,
  hoveredVerse: string | null,
  pinnedVerse: string | null,
): string {
  const classes = ["prose-verse"];
  if (pinnedVerse === key) classes.push("prose-verse--pinned");
  else if (hoveredVerse === key) classes.push("prose-verse--highlighted");
  return classes.join(" ");
}

function VerseRefPinCell({
  chapter,
  verse,
  isPinned,
  onTogglePin,
}: {
  chapter: number;
  verse: number;
  isPinned: boolean;
  onTogglePin: (verseKey: string) => void;
}) {
  const key = verseKey(chapter, verse);

  return (
    <div
      className="cell ref-cell ref-cell--pin"
      data-verse-key={key}
      role="button"
      tabIndex={0}
      aria-pressed={isPinned}
      aria-label={`Verse ${chapter}:${verse}. Click to pin.`}
      onClick={() => onTogglePin(key)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onTogglePin(key);
        }
      }}
    >
      {chapter}:{verse}
    </div>
  );
}

function verseIdFromKey(key: string): string {
  const [chapter, verse] = key.split(":").map(Number);
  return verseDomId(chapter, verse);
}

function ContinuousProseColumn({
  verses,
  version,
  viewMode,
  yltDivineNames,
  hoveredVerse,
  pinnedVerse,
  scrollTarget,
}: {
  verses: VerseRow[];
  version: EnglishVersion;
  viewMode: ViewerPreferences["viewMode"];
  yltDivineNames: boolean;
  hoveredVerse: string | null;
  pinnedVerse: string | null;
  scrollTarget: boolean;
}) {
  const rendered = verses
    .map((row) => ({
      key: verseKey(row.ref.chapter, row.ref.verse),
      text: displayEnglish(row, version, viewMode, yltDivineNames),
    }))
    .filter((entry) => entry.text);

  return (
    <div
      className={`cell prose-cell prose-cell--${version}${version === "ylt" ? " text-cell--ylt" : ""}`}
    >
      {rendered.map((entry, index) => (
        <span
          key={entry.key}
          id={scrollTarget ? verseIdFromKey(entry.key) : undefined}
          data-verse-key={entry.key}
          className={proseVerseClassName(entry.key, hoveredVerse, pinnedVerse)}
        >
          {version === "ylt" && yltDivineNames ? (
            <YltRichText html={entry.text} />
          ) : (
            entry.text
          )}
          {index < rendered.length - 1 ? " " : ""}
        </span>
      ))}
    </div>
  );
}

function ContinuousProse({
  verses,
  viewMode,
  yltDivineNames,
  englishCols,
  gridTemplate,
  pinnedVerse,
  onTogglePinnedVerse,
}: {
  verses: VerseRow[];
  viewMode: ViewerPreferences["viewMode"];
  yltDivineNames: boolean;
  englishCols: EnglishVersion[];
  gridTemplate: string;
  pinnedVerse: string | null;
  onTogglePinnedVerse: (verseKey: string) => void;
}) {
  const [hoveredVerse, setHoveredVerse] = useState<string | null>(null);

  return (
    <div
      className="row prose-row prose-row--continuous"
      style={{ gridTemplateColumns: gridTemplate }}
      onMouseOver={(event) => {
        const verse = (event.target as HTMLElement).closest("[data-verse-key]");
        const key = verse?.getAttribute("data-verse-key") ?? null;
        if (key !== hoveredVerse) setHoveredVerse(key);
      }}
      onMouseLeave={(event) => {
        const related = event.relatedTarget as Node | null;
        if (!event.currentTarget.contains(related)) setHoveredVerse(null);
      }}
      onClick={(event) => {
        const verse = (event.target as HTMLElement).closest("[data-verse-key]");
        const key = verse?.getAttribute("data-verse-key");
        if (key) onTogglePinnedVerse(key);
      }}
    >
      {englishCols.map((version, columnIndex) => (
        <ContinuousProseColumn
          key={version}
          verses={verses}
          version={version}
          viewMode={viewMode}
          yltDivineNames={yltDivineNames}
          hoveredVerse={hoveredVerse}
          pinnedVerse={pinnedVerse}
          scrollTarget={columnIndex === 0}
        />
      ))}
    </div>
  );
}

export function ParallelView({
  verses,
  prefs,
  view,
  notes,
  onNoteChange,
  contentReady,
}: ParallelViewProps) {
  const { gridTemplate, showRefs, visibleColumns } = useReaderGrid(view);
  const strongsEnabled =
    prefs.viewMode === "analytic" &&
    view.columns.hebrew &&
    !view.continuousMode &&
    verses.length > 0;

  const sourceLang = getBookMeta(prefs.book).sourceLanguage;

  const englishAlignEnabled =
    strongsEnabled &&
    (view.columns.kjv || view.columns.ylt) &&
    !view.continuousMode;

  const alignMap = useEnglishAlignment(verses, sourceLang, englishAlignEnabled);

  const {
    selection: strongsSelection,
    occurrences: strongsOccurrences,
    entry: strongsEntry,
    selectWord,
    selectOccurrence: selectStrongsOccurrence,
    clearSelection: clearStrongsSelection,
  } = useStrongsSelection(verses, prefs.book, strongsEnabled);

  const {
    selection: nameSelection,
    occurrences: nameOccurrences,
    entry: nameEntry,
    dictionary: nameDictionary,
    selectName,
    selectOccurrence: selectNameOccurrence,
    clearSelection: clearNameSelection,
  } = useHebrewNameSelection(verses, prefs.book, strongsEnabled);

  const handleWordSelect = useCallback<WordSelectHandler>(
    (strong, location, options) => {
      const useNamePane =
        isProperNoun(options?.morphTag) &&
        hasHebrewNameEntry(nameDictionary, strong);

      if (useNamePane) {
        clearStrongsSelection();
        selectName(strong, location);
        return;
      }

      clearNameSelection();
      selectWord(strong, location, options?.englishWord);
    },
    [
      nameDictionary,
      clearStrongsSelection,
      selectName,
      clearNameSelection,
      selectWord,
    ],
  );

  const paneOpen = !!(strongsSelection || nameSelection);

  const { pinnedVerse, togglePinnedVerse, pinVerse } = usePinnedVerse(
    prefs.book,
  );

  const handleChapterSelect = useCallback(
    (chapter: number) => {
      pinVerse(`${chapter}:1`);
    },
    [pinVerse],
  );
  const [focusedVersion, setFocusedVersion] = useState<EnglishVersion | null>(
    null,
  );

  const naturalEnglishCols = useMemo(
    () => activeEnglishVersions(view.columns),
    [view.columns],
  );

  const displayEnglishCols = useMemo(() => {
    if (focusedVersion && naturalEnglishCols.includes(focusedVersion)) {
      return [focusedVersion];
    }
    return naturalEnglishCols;
  }, [naturalEnglishCols, focusedVersion]);

  const displayGridTemplate = useMemo(() => {
    if (view.continuousMode && focusedVersion) return "1fr";
    return gridTemplate;
  }, [view.continuousMode, focusedVersion, gridTemplate]);

  const columnFocusEnabled = view.continuousMode;
  const columnFocusDockRef = useRef<HTMLDivElement>(null);

  const handleVersionFocus = useCallback((version: EnglishVersion) => {
    setFocusedVersion((current) => (current === version ? null : version));
  }, []);

  const handleCollapseFocus = useCallback(() => {
    setFocusedVersion(null);
  }, []);

  useEffect(() => {
    if (!columnFocusEnabled) {
      document.documentElement.style.removeProperty("--column-focus-dock-height");
      return;
    }

    const dock = columnFocusDockRef.current;
    if (!dock) return;

    const update = () => {
      document.documentElement.style.setProperty(
        "--column-focus-dock-height",
        `${Math.ceil(dock.getBoundingClientRect().height)}px`,
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(dock);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      document.documentElement.style.removeProperty("--column-focus-dock-height");
    };
  }, [
    columnFocusEnabled,
    focusedVersion,
    displayGridTemplate,
    displayEnglishCols,
  ]);

  useEffect(() => {
    if (!view.continuousMode) setFocusedVersion(null);
  }, [view.continuousMode, prefs.book]);

  useEffect(() => {
    if (!focusedVersion) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFocusedVersion(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusedVersion]);

  const readerRestoreKey = [
    prefs.viewMode,
    prefs.naturalEnglish,
    prefs.yltDivineNames,
    focusedVersion ?? "all",
  ].join(":");

  useReaderPlace(
    prefs.book,
    verses.length,
    readerRestoreKey,
    pinnedVerse,
    contentReady,
  );

  useScrollToChapter(
    prefs.book,
    prefs.chapter,
    verses.length,
    contentReady,
    handleChapterSelect,
  );

  const chapterGroups = useMemo(
    () => groupVersesByChapter(verses),
    [verses],
  );

  if (visibleColumns === 0) {
    return (
      <p className="empty-state">Enable at least one column to display text.</p>
    );
  }

  const verseBody = view.continuousMode ? (
    <ContinuousProse
      verses={verses}
      viewMode={prefs.viewMode}
      yltDivineNames={prefs.yltDivineNames}
      englishCols={displayEnglishCols}
      gridTemplate={displayGridTemplate}
      pinnedVerse={pinnedVerse}
      onTogglePinnedVerse={togglePinnedVerse}
    />
  ) : (
    <>
      {chapterGroups.map((chapterVerses) => {
        const chapter = chapterVerses[0].ref.chapter;

        return (
          <section key={chapter} className="chapter-section">
            {view.showChapterHeadings && (
              <div className="chapter-banner">
                <span className="chapter-banner-label">Chapter {chapter}</span>
              </div>
            )}

            {chapterVerses.map((row) => {
              const key = verseKey(row.ref.chapter, row.ref.verse);

              return (
                <div
                  key={key}
                  id={verseDomId(row.ref.chapter, row.ref.verse)}
                  className={`row verse-row${pinnedVerse === key ? " verse-row--pinned" : ""}`}
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  {showRefs && (
                    <VerseRefPinCell
                      chapter={row.ref.chapter}
                      verse={row.ref.verse}
                      isPinned={pinnedVerse === key}
                      onTogglePin={togglePinnedVerse}
                    />
                  )}
                  <EnglishCells
                    row={row}
                    view={view}
                    viewMode={prefs.viewMode}
                    yltDivineNames={prefs.yltDivineNames}
                    onWordSelect={handleWordSelect}
                    verseAlign={alignMap.get(
                      `${row.ref.chapter}:${row.ref.verse}`,
                    )}
                  />
                  {view.columns.hebrew && (
                    <div className="cell text-cell">
                      <HebrewCell
                        text={row.hebrew}
                        morph={row.morph}
                        sourceLang={sourceLang}
                        verseRef={row.ref}
                        onWordSelect={handleWordSelect}
                      />
                    </div>
                  )}
                  {view.columns.notes && (
                    <div
                      className={`cell notes-cell${view.notesCollapsed ? " notes-cell--collapsed" : ""}`}
                    >
                      <NotesCell
                        noteKey={key}
                        notes={notes}
                        collapsed={view.notesCollapsed}
                        onNoteChange={onNoteChange}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}
    </>
  );

  return (
    <div
      className={`reader-layout ${paneOpen ? "reader-layout--pane-open" : ""}`}
    >
      <div
        className={`parallel-view ${view.continuousMode ? "parallel-view--continuous" : ""} parallel-view--${prefs.viewMode}${focusedVersion ? " parallel-view--column-focused" : ""}`}
      >
        {columnFocusEnabled ? (
          <>
            <div className="column-focus-dock" ref={columnFocusDockRef}>
              <div className="column-focus-dock__inner">
                <ColumnHeaders
                  gridTemplate={displayGridTemplate}
                  showRefs={showRefs}
                  view={view}
                  book={prefs.book}
                  subtle={view.continuousMode}
                  englishCols={displayEnglishCols}
                  focusable={columnFocusEnabled}
                  focusedVersion={focusedVersion}
                  onVersionFocus={handleVersionFocus}
                  onCollapseFocus={handleCollapseFocus}
                />
              </div>
            </div>
            <div className="column-focus-dock-spacer" aria-hidden="true" />
          </>
        ) : (
          <ColumnHeaders
            gridTemplate={displayGridTemplate}
            showRefs={showRefs}
            view={view}
            book={prefs.book}
            subtle={view.continuousMode}
            englishCols={displayEnglishCols}
            focusable={columnFocusEnabled}
            focusedVersion={focusedVersion}
            onVersionFocus={handleVersionFocus}
            onCollapseFocus={handleCollapseFocus}
          />
        )}
        {verseBody}
      </div>
      {nameSelection && (
        <HebrewNamePane
          book={prefs.book}
          selection={nameSelection}
          entry={nameEntry}
          occurrences={nameOccurrences}
          onSelectOccurrence={selectNameOccurrence}
          onClose={clearNameSelection}
        />
      )}
      {strongsSelection && (
        <StrongsPane
          book={prefs.book}
          selection={strongsSelection}
          entry={strongsEntry}
          occurrences={strongsOccurrences}
          onSelectOccurrence={selectStrongsOccurrence}
          onClose={clearStrongsSelection}
        />
      )}
    </div>
  );
}