import { useEffect } from "react";
import type { StrongsEntry } from "../api/strongs";
import type { StrongOccurrence, StrongsSelection } from "../types";
import { locationKey } from "../utils/strongs-occurrences";

interface StrongsPaneProps {
  book: string;
  selection: StrongsSelection;
  entry: StrongsEntry | null;
  occurrences: StrongOccurrence[];
  onSelectOccurrence: (
    strong: string,
    occurrence: StrongOccurrence,
  ) => void;
  onClose: () => void;
}

export function StrongsPane({
  book,
  selection,
  entry,
  occurrences,
  onSelectOccurrence,
  onClose,
}: StrongsPaneProps) {
  const activeKey = locationKey(selection.active);
  const strongPrefix = selection.sourceLang === "greek" ? "G" : "H";
  const lemmaDir = selection.sourceLang === "greek" ? "ltr" : "rtl";
  const lemmaLang = selection.sourceLang === "greek" ? "el" : "he";

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <aside className="strongs-pane" aria-label="Strong's concordance">
      <div className="strongs-pane-header">
        <h2 className="strongs-pane-title">
          {strongPrefix}
          {selection.strong}
        </h2>
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
              <p className="strongs-lemma" dir={lemmaDir} lang={lemmaLang}>
                {entry.lemma}
              </p>
              {entry.xlit && <p className="strongs-xlit">{entry.xlit}</p>}
              {entry.def && <p className="strongs-def">{entry.def}</p>}
              {entry.kjv && (
                <p className="strongs-kjv">
                  <span className="strongs-label">KJV:</span> {entry.kjv}
                </p>
              )}
            </>
          ) : (
            <p className="strongs-def">Definition not found.</p>
          )}
        </section>

        <section className="strongs-pane-section">
          <h3 className="strongs-pane-subtitle">
            On this page ({occurrences.length})
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
                      dir={lemmaDir}
                      lang={lemmaLang}
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