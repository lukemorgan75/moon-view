import { useCallback } from "react";
import { englishText } from "../api/bible";
import { getBookMeta, sourceLanguageLabel } from "../api/book-meta";
import {
  activeEnglishVersions,
  englishVersionLabel,
} from "../api/constants";
import { useEnglishAlignment } from "../hooks/useEnglishAlignment";
import { useReaderGrid } from "../hooks/useReaderGrid";
import { useStrongsSelection } from "../hooks/useStrongsSelection";
import type { VerseRow, ViewerPreferences, WordLocation } from "../types";

import {
  CONTINUOUS_NOTE_KEY,
  groupVersesByChapter,
  joinRawHebrew,
  joinVerseField,
} from "../utils/prose";
import { isLightWordClick } from "../utils/light-easter-egg";
import { verseDomId } from "../utils/strongs-occurrences";
import { EnglishVerseCell } from "./EnglishVerseCell";
import { HebrewCell } from "./HebrewCell";
import { StrongsPane } from "./StrongsPane";

interface ParallelViewProps {
  verses: VerseRow[];
  prefs: ViewerPreferences;
  notes: Record<string, string>;
  onNoteChange: (key: string, value: string) => void;
  onUpdate: (patch: Partial<ViewerPreferences>) => void;
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
  placeholder = "Notes…",
}: {
  noteKey: string;
  notes: Record<string, string>;
  collapsed: boolean;
  onNoteChange: (key: string, value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  if (collapsed) {
    return (
      <span
        className="notes-expand"
        title={
          notes[noteKey]
            ? "Note saved — uncheck Collapse notes to edit"
            : "No note"
        }
      >
        {notes[noteKey] ? "✎" : ""}
      </span>
    );
  }

  return (
    <textarea
      className="notes-input"
      value={notes[noteKey] ?? ""}
      placeholder={placeholder}
      rows={rows}
      onChange={(e) => onNoteChange(noteKey, e.target.value)}
    />
  );
}

function ColumnHeaders({
  gridTemplate,
  showRefs,
  prefs,
}: {
  gridTemplate: string;
  showRefs: boolean;
  prefs: ViewerPreferences;
}) {
  const englishCols = activeEnglishVersions(prefs.columns, prefs.book);

  return (
    <div
      className="row column-header-row"
      style={{ gridTemplateColumns: gridTemplate }}
    >
      {showRefs && <div className="cell ref-cell" />}
      {englishCols.map((version) => (
        <div key={version} className="cell header-cell">
          {englishVersionLabel(version, prefs.book)}
        </div>
      ))}
      {prefs.columns.hebrew && (
        <div
          className={`cell header-cell ${getBookMeta(prefs.book).sourceLanguage === "greek" ? "header-cell--greek" : ""}`}
        >
          {sourceLanguageLabel(prefs.book)} + Transliteration
        </div>
      )}
      {prefs.columns.notes && (
        <div className="cell header-cell notes-header">
          {prefs.notesCollapsed ? "…" : "Notes"}
        </div>
      )}
    </div>
  );
}

function EnglishCells({
  row,
  prefs,
  continuous,
  onWordSelect,
  verseAlign,
}: {
  row: VerseRow | VerseRow[];
  prefs: ViewerPreferences;
  continuous?: boolean;
  onWordSelect?: (
    strong: string,
    location: WordLocation,
    englishWord?: string,
  ) => void;
  verseAlign?: Partial<Record<"jps" | "kjv", number[][]>>;
}) {
  const rows = Array.isArray(row) ? row : [row];
  const englishCols = activeEnglishVersions(prefs.columns, prefs.book);
  const verseRow = rows[0];

  return (
    <>
      {englishCols.map((version) => (
        <div
          key={version}
          className={continuous ? "cell prose-cell" : "cell text-cell"}
        >
          {continuous ? (
            joinVerseField(rows, version)
          ) : (version === "jps" || version === "kjv") &&
            verseRow.morph?.length ? (
            <EnglishVerseCell
              text={englishText(verseRow, version)}
              version={version}
              verseRef={verseRow.ref}
              morph={verseRow.morph}
              align={verseAlign?.[version]}
              onWordSelect={onWordSelect}
            />
          ) : (
            englishText(verseRow, version)
          )}
        </div>
      ))}
    </>
  );
}

function ContinuousProse({
  verses,
  gridTemplate,
  prefs,
  notes,
  onNoteChange,
  sourceLang,
}: {
  verses: VerseRow[];
  gridTemplate: string;
  prefs: ViewerPreferences;
  notes: Record<string, string>;
  onNoteChange: (key: string, value: string) => void;
  sourceLang: ReturnType<typeof getBookMeta>["sourceLanguage"];
}) {
  const isGreek = sourceLang === "greek";

  return (
    <div
      className="row prose-row prose-row--continuous"
      style={{ gridTemplateColumns: gridTemplate }}
    >
      <EnglishCells row={verses} prefs={prefs} continuous />
      {prefs.columns.hebrew && (
        <div className={`cell prose-cell ${isGreek ? "text-cell--greek" : ""}`}>
          <HebrewCell
            text={joinRawHebrew(verses)}
            sourceLang={sourceLang}
            continuous
            clickable={false}
          />
        </div>
      )}
      {prefs.columns.notes && (
        <div
          className={`cell notes-cell ${prefs.notesCollapsed ? "collapsed" : ""}`}
        >
          <NotesCell
            noteKey={CONTINUOUS_NOTE_KEY}
            notes={notes}
            collapsed={prefs.notesCollapsed}
            onNoteChange={onNoteChange}
            rows={8}
            placeholder="Notes…"
          />
        </div>
      )}
    </div>
  );
}

export function ParallelView({
  verses,
  prefs,
  notes,
  onNoteChange,
  onUpdate,
}: ParallelViewProps) {
  const { gridTemplate, showRefs, visibleColumns } = useReaderGrid(prefs);
  const strongsEnabled =
    prefs.columns.hebrew && !prefs.continuousMode && verses.length > 0;

  const sourceLang = getBookMeta(prefs.book).sourceLanguage;

  const englishAlignEnabled =
    strongsEnabled &&
    (prefs.columns.kjv ||
      (prefs.columns.jps && getBookMeta(prefs.book).testament === "OT")) &&
    !prefs.continuousMode;

  const alignMap = useEnglishAlignment(verses, sourceLang, englishAlignEnabled);

  const {
    selection,
    occurrences,
    entry,
    selectWord,
    figureMatches,
    figureBundle,
    selectOccurrence,
    clearSelection,
  } = useStrongsSelection(verses, prefs.book, strongsEnabled);

  const handleWordSelect = useCallback(
    (strong: string, location: WordLocation, englishWord?: string) => {
      if (isLightWordClick(strong, englishWord) && prefs.darkMode) {
        onUpdate({ darkMode: false });
      }
      selectWord(strong, location, englishWord);
    },
    [onUpdate, prefs.darkMode, selectWord],
  );

  const chapterGroups = groupVersesByChapter(verses);

  if (visibleColumns === 0) {
    return (
      <p className="empty-state">Enable at least one column to display text.</p>
    );
  }

  const verseBody = prefs.continuousMode ? (
    <ContinuousProse
      verses={verses}
      gridTemplate={gridTemplate}
      prefs={prefs}
      notes={notes}
      onNoteChange={onNoteChange}
      sourceLang={sourceLang}
    />
  ) : (
    <>
      {chapterGroups.map((chapterVerses) => {
        const chapter = chapterVerses[0].ref.chapter;

        return (
          <section key={chapter} className="chapter-section">
            {prefs.showChapterHeadings && (
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
                  className="row verse-row"
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  {showRefs && (
                    <div className="cell ref-cell">
                      {row.ref.chapter}:{row.ref.verse}
                    </div>
                  )}
                  <EnglishCells
                    row={row}
                    prefs={prefs}
                    onWordSelect={handleWordSelect}
                    verseAlign={alignMap.get(
                      `${row.ref.chapter}:${row.ref.verse}`,
                    )}
                  />
                  {prefs.columns.hebrew && (
                    <div
                      className={`cell text-cell ${sourceLang === "greek" ? "text-cell--greek" : ""}`}
                    >
                      <HebrewCell
                        text={row.hebrew}
                        morph={row.morph}
                        sourceLang={sourceLang}
                        verseRef={row.ref}
                        onWordSelect={handleWordSelect}
                      />
                    </div>
                  )}
                  {prefs.columns.notes && (
                    <div
                      className={`cell notes-cell ${prefs.notesCollapsed ? "collapsed" : ""}`}
                    >
                      <NotesCell
                        noteKey={key}
                        notes={notes}
                        collapsed={prefs.notesCollapsed}
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
      className={`reader-layout ${selection ? "reader-layout--pane-open" : ""}`}
    >
      <div
        className={`parallel-view ${prefs.continuousMode ? "parallel-view--continuous" : ""}`}
      >
        <ColumnHeaders
          gridTemplate={gridTemplate}
          showRefs={showRefs}
          prefs={prefs}
        />
        {verseBody}
      </div>
      {selection && (
        <StrongsPane
          book={prefs.book}
          selection={selection}
          entry={entry}
          figureMatches={figureMatches}
          figureBundle={figureBundle}
          occurrences={occurrences}
          onSelectOccurrence={selectOccurrence}
          onClose={clearSelection}
        />
      )}
    </div>
  );
}