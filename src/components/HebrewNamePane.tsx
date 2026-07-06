import { useEffect } from "react";
import {
  hebrewNameKindLabel,
  type HebrewNameEntry,
} from "../api/hebrew-names";
import type { StrongOccurrence, HebrewNameSelection } from "../types";
import { locationKey } from "../utils/strongs-occurrences";

interface HebrewNamePaneProps {
  book: string;
  selection: HebrewNameSelection;
  entry: HebrewNameEntry | null;
  occurrences: StrongOccurrence[];
  onSelectOccurrence: (
    strong: string,
    occurrence: StrongOccurrence,
  ) => void;
  onClose: () => void;
}

export function HebrewNamePane({
  book,
  selection,
  entry,
  occurrences,
  onSelectOccurrence,
  onClose,
}: HebrewNamePaneProps) {
  const activeKey = locationKey(selection.active);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <aside className="strongs-pane hebrew-name-pane" aria-label="Hebrew names">
      <div className="strongs-pane-header">
        <h2 className="strongs-pane-title">Hebrew Name</h2>
        <button
          type="button"
          className="strongs-pane-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="strongs-pane-body">
        <section className="strongs-pane-section">
          {entry ? (
            <>
              <p className="hebrew-name-kind">
                {hebrewNameKindLabel(entry.kind)}
              </p>
              <p className="strongs-lemma" dir="rtl" lang="he">
                {entry.lemma}
              </p>
              {entry.xlit && <p className="strongs-xlit">{entry.xlit}</p>}
              {entry.english && (
                <p className="hebrew-name-english">{entry.english}</p>
              )}
              {entry.meaning && (
                <p className="hebrew-name-meaning">{entry.meaning}</p>
              )}
              {entry.context && entry.context !== entry.meaning && (
                <p className="strongs-def">{entry.context}</p>
              )}
              <p className="strongs-kjv">
                <span className="strongs-label">Strong&apos;s:</span> H
                {entry.strong}
              </p>
            </>
          ) : (
            <p className="strongs-def">Name entry not found.</p>
          )}
        </section>

        <section className="strongs-pane-section">
          <h3 className="strongs-pane-subtitle">
            In this book ({occurrences.length})
          </h3>
          <ul className="strongs-occurrence-list">
            {occurrences.map((occurrence) => {
              const key = locationKey(occurrence);
              const isActive = key === activeKey;

              return (
                <li key={key}>
                  <button
                    type="button"
                    className={`strongs-occurrence-link ${isActive ? "strongs-occurrence-link--active" : ""}`}
                    onClick={() =>
                      onSelectOccurrence(selection.strong, occurrence)
                    }
                  >
                    <span className="strongs-occurrence-ref">
                      {book} {occurrence.chapter}:{occurrence.verse}
                    </span>
                    <span
                      className="strongs-occurrence-hebrew"
                      dir="rtl"
                      lang="he"
                    >
                      {occurrence.hebrew}
                    </span>
                    <span className="strongs-occurrence-translit">
                      {occurrence.translit}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </aside>
  );
}