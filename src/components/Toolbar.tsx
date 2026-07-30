import { booksForCorpus, getBookMeta, hasLockeParaphrase } from "../api/book-meta";
import { homeHref, infoHref } from "../utils/app-routing";
import type {
  NaturalEnglishVersion,
  ViewMode,
  ViewerPreferences,
} from "../types";

interface ToolbarProps {
  prefs: ViewerPreferences;
  loading: boolean;
  onUpdate: (patch: Partial<ViewerPreferences>) => void;
}

function ModeToggle({
  viewMode,
  onChange,
}: {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="mode-toggle" role="group" aria-label="Reading mode">
      <button
        type="button"
        className={`mode-toggle-btn ${viewMode === "natural" ? "mode-toggle-btn--active" : ""}`}
        aria-pressed={viewMode === "natural"}
        onClick={() => onChange("natural")}
      >
        Natural
      </button>
      <button
        type="button"
        className={`mode-toggle-btn ${viewMode === "analytic" ? "mode-toggle-btn--active" : ""}`}
        aria-pressed={viewMode === "analytic"}
        onClick={() => onChange("analytic")}
      >
        Analytic
      </button>
    </div>
  );
}

function NaturalEnglishToggle({
  naturalEnglish,
  onChange,
}: {
  naturalEnglish: NaturalEnglishVersion;
  onChange: (version: NaturalEnglishVersion) => void;
}) {
  return (
    <div
      className="mode-toggle natural-english-toggle"
      role="group"
      aria-label="English translation"
    >
      <button
        type="button"
        className={`mode-toggle-btn ${naturalEnglish === "kjv" ? "mode-toggle-btn--active" : ""}`}
        aria-pressed={naturalEnglish === "kjv"}
        onClick={() => onChange("kjv")}
      >
        KJV
      </button>
      <button
        type="button"
        className={`mode-toggle-btn ${naturalEnglish === "jps" ? "mode-toggle-btn--active" : ""}`}
        aria-pressed={naturalEnglish === "jps"}
        onClick={() => onChange("jps")}
      >
        JPS
      </button>
    </div>
  );
}

function PaulEnglishBadge({ showLocke }: { showLocke: boolean }) {
  return (
    <div
      className="mode-toggle natural-english-toggle natural-english-toggle--static"
      role="group"
      aria-label="English translations"
    >
      {showLocke ? (
        <>
          <span className="mode-toggle-btn mode-toggle-btn--active mode-toggle-btn--static">
            ESV
          </span>
          <span
            className="mode-toggle-btn mode-toggle-btn--active mode-toggle-btn--static"
            title="Locke's Paraphrase — paired with ESV for this letter"
          >
            Locke
          </span>
        </>
      ) : (
        <>
          <span className="mode-toggle-btn mode-toggle-btn--active mode-toggle-btn--static">
            KJV
          </span>
          <span className="mode-toggle-btn mode-toggle-btn--active mode-toggle-btn--static">
            ESV
          </span>
        </>
      )}
    </div>
  );
}

function MoonMark() {
  return (
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
          <circle cx="33" cy="19" r="17.5" fill="url(#moon-shade)" />
        </g>
      </svg>
    </span>
  );
}

export function Toolbar({ prefs, loading, onUpdate }: ToolbarProps) {
  const chapterCount = getBookMeta(prefs.book).chapters;
  const books = booksForCorpus(prefs.corpus);
  const isPaul = prefs.corpus === "paul";
  const showLocke = isPaul && hasLockeParaphrase(prefs.book);
  const bookLabel = isPaul ? "Pauline letter" : "Book of Torah";

  return (
    <header className="toolbar toolbar--simple">
      <div className="brand-lockup">
        <a className="brand-home-link" href={homeHref()} title="Home">
          <MoonMark />
          <div className="brand-text">
            <h1 className="app-title">
              <span className="app-title-word">Moon</span>
              <span className="app-title-word app-title-word--light">View</span>
            </h1>
          </div>
        </a>
        <span className="corpus-chip" aria-label={`Corpus: ${isPaul ? "Paul" : "Torah"}`}>
          {isPaul ? "Paul" : "Torah"}
        </span>
      </div>

      <div className="toolbar-nav-selects">
        <label className="toolbar-book-field">
          <span className="sr-only">{bookLabel}</span>
          <select
            className="field-input field-select toolbar-book-select"
            value={prefs.book}
            disabled={loading}
            onChange={(e) => onUpdate({ book: e.target.value })}
          >
            {books.map((book) => (
              <option key={book} value={book}>
                {book}
              </option>
            ))}
          </select>
        </label>

        <label className="toolbar-book-field toolbar-chapter-field">
          <span className="sr-only">Chapter</span>
          <select
            className="field-input field-select toolbar-chapter-select"
            value={prefs.chapter}
            disabled={loading}
            aria-label={`Chapter (1–${chapterCount})`}
            onChange={(e) => onUpdate({ chapter: Number(e.target.value) })}
          >
            {Array.from({ length: chapterCount }, (_, index) => index + 1).map(
              (chapter) => (
                <option key={chapter} value={chapter}>
                  {chapter}
                </option>
              ),
            )}
          </select>
        </label>
      </div>

      <ModeToggle
        viewMode={prefs.viewMode}
        onChange={(viewMode) => onUpdate({ viewMode })}
      />

      {isPaul ? (
        <PaulEnglishBadge showLocke={showLocke} />
      ) : (
        <NaturalEnglishToggle
          naturalEnglish={prefs.naturalEnglish}
          onChange={(naturalEnglish) => onUpdate({ naturalEnglish })}
        />
      )}

      <div className="toolbar-top-actions">
        {loading && (
          <span className="status-chip status-chip--loading" aria-live="polite">
            Loading…
          </span>
        )}
        <a className="toolbar-nav-link" href={homeHref()}>
          Home
        </a>
        <a className="toolbar-nav-link" href={infoHref()}>
          About
        </a>
        <button
          type="button"
          className="icon-btn theme-toggle-btn"
          aria-label={
            prefs.theme === "papyrus"
              ? "Switch to dark mode"
              : "Switch to papyrus mode"
          }
          title={prefs.theme === "papyrus" ? "Dark mode" : "Papyrus mode"}
          onClick={() =>
            onUpdate({
              theme: prefs.theme === "papyrus" ? "dark" : "papyrus",
            })
          }
        >
          {prefs.theme === "papyrus" ? "◐" : "▤"}
        </button>
      </div>
    </header>
  );
}
