import { AVAILABLE_BOOKS } from "../api/constants";
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

function DivineNamesToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={`pill-toggle divine-names-toggle${enabled ? " pill-toggle--on" : ""}`}
      aria-pressed={enabled}
      aria-label={
        enabled
          ? "God names on — showing Hebrew divine titles"
          : "God names off — showing original YLT English"
      }
      title={
        enabled
          ? "God names on — Hebrew titles with YLT gloss"
          : "God names off — original YLT wording"
      }
      onClick={() => onChange(!enabled)}
    >
      God Names
    </button>
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

export function Toolbar({ prefs, loading, onUpdate }: ToolbarProps) {
  return (
    <header className="toolbar toolbar--simple">
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
              <circle cx="33" cy="19" r="17.5" fill="url(#moon-shade)" />
            </g>
          </svg>
        </span>
        <div className="brand-text">
          <h1 className="app-title">
            <span className="app-title-word">Moon</span>
            <span className="app-title-word app-title-word--light">View</span>
          </h1>
        </div>
      </div>

      <label className="toolbar-book-field">
        <span className="sr-only">Book of Torah</span>
        <select
          className="field-input field-select toolbar-book-select"
          value={prefs.book}
          disabled={loading}
          onChange={(e) => onUpdate({ book: e.target.value })}
        >
          {AVAILABLE_BOOKS.map((book) => (
            <option key={book} value={book}>
              {book}
            </option>
          ))}
        </select>
      </label>

      <ModeToggle
        viewMode={prefs.viewMode}
        onChange={(viewMode) => onUpdate({ viewMode })}
      />

      <NaturalEnglishToggle
        naturalEnglish={prefs.naturalEnglish}
        onChange={(naturalEnglish) => onUpdate({ naturalEnglish })}
      />

      <DivineNamesToggle
        enabled={prefs.yltDivineNames}
        onChange={(yltDivineNames) => onUpdate({ yltDivineNames })}
      />

      <div className="toolbar-top-actions">
        {loading && (
          <span className="status-chip status-chip--loading" aria-live="polite">
            Loading…
          </span>
        )}
        <a className="toolbar-nav-link" href="#info">
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