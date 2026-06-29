import { AVAILABLE_BOOKS, BOOK_CATALOG } from "../api/constants";
import { getBookMeta } from "../api/book-meta";
import type { ViewerPreferences } from "../types";

interface ToolbarProps {
  prefs: ViewerPreferences;
  loading: boolean;
  verseCount: number;
  onUpdate: (patch: Partial<ViewerPreferences>) => void;
  onToggleColumn: (column: keyof ViewerPreferences["columns"]) => void;
  onReload: () => void;
}

function PillToggle({
  label,
  pressed,
  disabled,
  title,
  onClick,
}: {
  label: string;
  pressed: boolean;
  disabled?: boolean;
  title?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`pill-toggle ${pressed ? "pill-toggle--on" : ""}`}
      aria-pressed={pressed}
      disabled={disabled}
      title={title}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function Toolbar({
  prefs,
  loading,
  verseCount,
  onUpdate,
  onToggleColumn,
  onReload,
}: ToolbarProps) {
  const statusLabel = loading
    ? "Loading…"
    : verseCount > 0
      ? `${verseCount} verses`
      : "Ready";

  const passageSummary =
    prefs.chapterStart === prefs.chapterEnd
      ? `${prefs.book} · ch ${prefs.chapterStart}`
      : `${prefs.book} · ch ${prefs.chapterStart}–${prefs.chapterEnd}`;

  return (
    <header
      className={`toolbar ${prefs.toolbarExpanded ? "toolbar--expanded" : "toolbar--collapsed"}`}
    >
      <div className="toolbar-top">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <svg
              className="brand-mark-svg"
              viewBox="0 0 40 40"
              xmlns="http://www.w3.org/2000/svg"
              role="presentation"
            >
              <defs>
                <radialGradient id="moon-sphere" cx="34%" cy="30%" r="68%">
                  <stop offset="0%" stopColor="#fafbfc" />
                  <stop offset="38%" stopColor="#d8dce3" />
                  <stop offset="72%" stopColor="#9aa1ab" />
                  <stop offset="100%" stopColor="#5f6670" />
                </radialGradient>
                <radialGradient id="moon-shade" cx="78%" cy="48%" r="58%">
                  <stop offset="0%" stopColor="#12151c" stopOpacity="0.96" />
                  <stop offset="55%" stopColor="#1c2029" stopOpacity="0.82" />
                  <stop offset="100%" stopColor="#2a303a" stopOpacity="0" />
                </radialGradient>
                <clipPath id="moon-clip">
                  <circle cx="20" cy="20" r="18" />
                </clipPath>
              </defs>
              <g clipPath="url(#moon-clip)">
                <circle cx="20" cy="20" r="18" fill="url(#moon-sphere)" />
                <ellipse
                  cx="15.5"
                  cy="23"
                  rx="6.5"
                  ry="4.8"
                  fill="#6d7480"
                  opacity="0.38"
                />
                <ellipse
                  cx="23.5"
                  cy="14.5"
                  rx="4.2"
                  ry="3"
                  fill="#626973"
                  opacity="0.28"
                />
                <ellipse
                  cx="19"
                  cy="17"
                  rx="2.8"
                  ry="2.2"
                  fill="#555c66"
                  opacity="0.22"
                />
                <circle cx="12.5" cy="13.5" r="2.1" fill="#000" opacity="0.07" />
                <circle cx="12.5" cy="13.5" r="1.5" fill="#fff" opacity="0.12" />
                <circle cx="21.5" cy="25" r="1.35" fill="#000" opacity="0.08" />
                <circle cx="17.5" cy="19" r="0.85" fill="#000" opacity="0.06" />
                <circle cx="25" cy="20.5" r="0.65" fill="#fff" opacity="0.1" />
                <circle cx="33" cy="19" r="17.5" fill="url(#moon-shade)" />
                <path
                  d="M 8 20 A 12 12 0 0 0 8 8"
                  fill="none"
                  stroke="rgba(255,255,255,0.14)"
                  strokeWidth="0.6"
                />
              </g>
              <circle
                cx="20"
                cy="20"
                r="18.25"
                fill="none"
                stroke="rgba(0,0,0,0.07)"
                strokeWidth="0.5"
              />
            </svg>
          </span>
          <div className="brand-text">
            <h1 className="app-title">
              <span className="app-title-word">Moon</span>
              <span className="app-title-word app-title-word--light">View</span>
            </h1>
            <p className="brand-tagline">Modular scripture reader</p>
          </div>
        </div>

        {!prefs.toolbarExpanded && (
          <button
            type="button"
            className="passage-chip"
            title="Open controls"
            onClick={() => onUpdate({ toolbarExpanded: true })}
          >
            {passageSummary}
          </button>
        )}

        <div className="toolbar-top-actions">
          <span
            className={`status-chip ${loading ? "status-chip--loading" : ""}`}
            aria-live="polite"
          >
            {statusLabel}
          </span>
          <a className="toolbar-nav-link" href="#info">
            About
          </a>
          <a className="toolbar-nav-link" href="#figures">
            Figure dictionary
          </a>
          <button
            type="button"
            className={`icon-btn toolbar-expand-btn ${prefs.toolbarExpanded ? "toolbar-expand-btn--open" : ""}`}
            aria-expanded={prefs.toolbarExpanded}
            aria-controls="toolbar-deck"
            aria-label={prefs.toolbarExpanded ? "Collapse menu" : "Expand menu"}
            title={prefs.toolbarExpanded ? "Collapse menu" : "Expand menu"}
            onClick={() =>
              onUpdate({ toolbarExpanded: !prefs.toolbarExpanded })
            }
          >
            <span className="toolbar-chevron" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label={prefs.darkMode ? "Switch to light mode" : "Switch to dark mode"}
            title={prefs.darkMode ? "Light mode" : "Dark mode"}
            onClick={() => onUpdate({ darkMode: !prefs.darkMode })}
          >
            {prefs.darkMode ? "☀" : "☾"}
          </button>
        </div>
      </div>

      <div
        id="toolbar-deck"
        className="toolbar-deck-wrap"
        aria-hidden={!prefs.toolbarExpanded}
      >
        <div className="toolbar-deck">
          <section
            className="toolbar-panel toolbar-panel--scripture"
            aria-label="Scripture selection"
          >
            <h2 className="panel-label">Scripture</h2>
            <div className="panel-body panel-body--scripture">
              <label className="field field--book">
                <span className="field-label">Book</span>
                <div className="select-wrap">
                  <select
                    className="field-input field-select"
                    value={prefs.book}
                    onChange={(e) => onUpdate({ book: e.target.value })}
                  >
                    <optgroup label="Old Testament">
                      {AVAILABLE_BOOKS.filter(
                        (book) => BOOK_CATALOG[book].testament === "OT",
                      ).map((book) => (
                        <option key={book} value={book}>
                          {book}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="New Testament">
                      {AVAILABLE_BOOKS.filter(
                        (book) => BOOK_CATALOG[book].testament === "NT",
                      ).map((book) => (
                        <option key={book} value={book}>
                          {book}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </label>

              <label className="field field--chapters">
                <span className="field-label">Chapters</span>
                <div className="chapter-range">
                  <input
                    className="field-input field-number"
                    type="number"
                    min={1}
                    aria-label="Chapter start"
                    value={prefs.chapterStart}
                    onChange={(e) =>
                      onUpdate({ chapterStart: Number(e.target.value) || 1 })
                    }
                  />
                  <span className="chapter-sep" aria-hidden="true">
                    to
                  </span>
                  <input
                    className="field-input field-number"
                    type="number"
                    min={1}
                    aria-label="Chapter end"
                    value={prefs.chapterEnd}
                    onChange={(e) =>
                      onUpdate({ chapterEnd: Number(e.target.value) || 1 })
                    }
                  />
                </div>
              </label>

              <button
                type="button"
                className="btn btn-primary"
                onClick={onReload}
                disabled={loading}
              >
                {loading ? "Loading…" : "Load passage"}
              </button>
            </div>
          </section>

          <section
            className="toolbar-panel toolbar-panel--columns"
            aria-label="Translation columns"
          >
            <h2 className="panel-label">Columns</h2>
            <div className="panel-body panel-body--pills">
              <PillToggle
                label="KJV"
                pressed={prefs.columns.kjv}
                onClick={() => onToggleColumn("kjv")}
              />
              <PillToggle
                label="JPS / RSV"
                title={
                  getBookMeta(prefs.book).testament === "OT"
                    ? "Showing JPS (Old Testament)"
                    : "Showing RSV (New Testament)"
                }
                pressed={prefs.columns.jps}
                onClick={() => onToggleColumn("jps")}
              />
              <PillToggle
                label="Transliteration"
                pressed={prefs.columns.hebrew}
                onClick={() => onToggleColumn("hebrew")}
              />
              <PillToggle
                label="Notes"
                pressed={prefs.columns.notes}
                onClick={() => onToggleColumn("notes")}
              />
            </div>
          </section>

          <section
            className="toolbar-panel toolbar-panel--view"
            aria-label="View options"
          >
            <h2 className="panel-label">View</h2>
            <div className="panel-body panel-body--pills">
              <PillToggle
                label="Chapter headings"
                pressed={prefs.showChapterHeadings && !prefs.continuousMode}
                disabled={prefs.continuousMode}
                title={
                  prefs.continuousMode
                    ? "Hidden while continuous narrative is on"
                    : undefined
                }
                onClick={() =>
                  onUpdate({ showChapterHeadings: !prefs.showChapterHeadings })
                }
              />
              <PillToggle
                label="Continuous"
                pressed={prefs.continuousMode}
                onClick={() =>
                  onUpdate({ continuousMode: !prefs.continuousMode })
                }
              />
              <PillToggle
                label="Verse labels"
                pressed={prefs.showRefs && !prefs.continuousMode}
                disabled={prefs.continuousMode}
                title={
                  prefs.continuousMode
                    ? "Hidden while continuous narrative is on"
                    : undefined
                }
                onClick={() => onUpdate({ showRefs: !prefs.showRefs })}
              />
              {prefs.columns.notes && (
                <PillToggle
                  label="Collapse notes"
                  pressed={prefs.notesCollapsed}
                  onClick={() =>
                    onUpdate({ notesCollapsed: !prefs.notesCollapsed })
                  }
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </header>
  );
}