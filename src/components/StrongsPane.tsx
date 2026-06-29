import { useEffect } from "react";
import type { FigureBundle, FigureLookupResult } from "../api/figures";
import { FigureSenseLayers } from "./FigureSenseLayers";
import type { StrongsEntry } from "../api/strongs";
import { StrongsDetailsTable } from "./StrongsDetailsTable";
import type { StrongOccurrence, StrongsSelection } from "../types";
import { figureDictionaryHref } from "../utils/figure-routing";
import { locationKey } from "../utils/strongs-occurrences";

interface StrongsPaneProps {
  book: string;
  selection: StrongsSelection;
  entry: StrongsEntry | null;
  figureMatches?: FigureLookupResult[];
  figureBundle?: FigureBundle | null;
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
  figureMatches = [],
  figureBundle = null,
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

        {figureMatches.length > 0 && (
          <section className="strongs-pane-section strongs-pane-figures">
            <h3 className="strongs-pane-subtitle">Figure dictionary</h3>
            <ul className="figure-match-list">
              {figureMatches.map((match) => (
                <li key={match.entry.id} className="figure-match-item">
                  <a
                    className="figure-match-link"
                    href={figureDictionaryHref(match.entry.id, book)}
                  >
                    {match.entry.label}
                  </a>
                  <span className="figure-match-role">{match.entry.role}</span>
                  {match.entry.strongs_details &&
                    match.entry.strongs_details.length > 0 && (
                      <StrongsDetailsTable
                        details={match.entry.strongs_details}
                        compact
                      />
                    )}
                  {figureBundle && (
                    <FigureSenseLayers
                      entry={match.entry}
                      bundle={figureBundle}
                      book={book}
                      compact
                    />
                  )}
                  {match.ancestors.length > 0 && (
                    <p className="figure-match-path">
                      {match.ancestors
                        .slice()
                        .reverse()
                        .map((a) => a.label)
                        .join(" → ")}{" "}
                      → {match.entry.label}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

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