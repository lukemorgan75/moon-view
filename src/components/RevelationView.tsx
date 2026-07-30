import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  Fragment,
} from "react";

const MEDE_WIKI_URL = "https://en.wikipedia.org/wiki/Joseph_Mede";

/** Link "Mr Mede" / "Mr. Mede" to Joseph Mede's Wikipedia page. */
function linkifyMrMede(text: string): ReactNode {
  const parts = text.split(/(Mr\.?\s+Mede)/g);
  if (parts.length === 1) return text;
  return parts.map((part, index) => {
    if (/^Mr\.?\s+Mede$/.test(part)) {
      return (
        <a
          key={`mede-${index}`}
          className="rev-rules-source-link"
          href={MEDE_WIKI_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {part}
        </a>
      );
    }
    return <Fragment key={`mede-t-${index}`}>{part}</Fragment>;
  });
}
import {
  buildHighlightRegex,
  buildRootIndex,
  loadNewtonDefinitions,
  loadNewtonIntro,
  loadNewtonPropositions,
  loadNewtonRules,
  lookupDefsForRoot,
  NEWTON_PROJECT_THEM00135_URL,
  propositionsForChapter,
  type NewtonDefinition,
  type NewtonIntroData,
  type NewtonProposition,
  type NewtonRulesData,
} from "../api/newton";
import {
  loadRevelationKjv,
  type RevelationChapter,
} from "../api/revelation";
import { isJesusWords } from "../api/revelation-red-letter";
import { homeHref, infoHref } from "../utils/app-routing";
import { useRevelationPrefs } from "../hooks/useRevelationPrefs";

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
          <radialGradient id="rev-moon-sphere" cx="34%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#fafbfc" />
            <stop offset="38%" stopColor="#d8dce3" />
            <stop offset="72%" stopColor="#9aa1ab" />
            <stop offset="100%" stopColor="#5f6670" />
          </radialGradient>
          <radialGradient id="rev-moon-shade" cx="78%" cy="48%" r="58%">
            <stop offset="0%" stopColor="#12151c" stopOpacity="0.96" />
            <stop offset="55%" stopColor="#1c2029" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#2a303a" stopOpacity="0" />
          </radialGradient>
          <clipPath id="rev-moon-clip">
            <circle cx="20" cy="20" r="18" />
          </clipPath>
        </defs>
        <g clipPath="url(#rev-moon-clip)">
          <circle cx="20" cy="20" r="18" fill="url(#rev-moon-sphere)" />
          <circle cx="33" cy="19" r="17.5" fill="url(#rev-moon-shade)" />
        </g>
      </svg>
    </span>
  );
}

function HighlightedVerse({
  text,
  regex,
  byRoot,
  defsById,
  activeDefId,
  onSelectRoot,
}: {
  text: string;
  regex: RegExp | null;
  byRoot: Map<string, string[]>;
  defsById: Map<string, NewtonDefinition>;
  activeDefId: string | null;
  onSelectRoot: (defs: NewtonDefinition[], matched: string) => void;
}) {
  const nodes = useMemo(() => {
    if (!regex) return [text];

    const parts: ReactNode[] = [];
    let last = 0;
    let match: RegExpExecArray | null;
    const re = new RegExp(regex.source, regex.flags);
    let key = 0;

    while ((match = re.exec(text)) !== null) {
      const start = match.index;
      const matched = match[0];
      if (start > last) {
        parts.push(text.slice(last, start));
      }
      const defs = lookupDefsForRoot(byRoot, defsById, matched);
      const isActive = defs.some((d) => d.id === activeDefId);
      const title = defs
        .map((d) =>
          d.newton_def
            ? `Def. ${d.newton_def}: ${d.label} — ${d.sense}`
            : `${d.label} — ${d.sense}`,
        )
        .join("\n");

      parts.push(
        <button
          key={`h-${key++}`}
          type="button"
          className={`rev-figure${isActive ? " rev-figure--active" : ""}`}
          title={title || matched}
          onClick={() => onSelectRoot(defs, matched)}
        >
          {matched}
        </button>,
      );
      last = start + matched.length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  }, [text, regex, byRoot, defsById, activeDefId, onSelectRoot]);

  return <>{nodes}</>;
}

export function RevelationView() {
  const { prefs, update } = useRevelationPrefs();
  const [chapters, setChapters] = useState<RevelationChapter[]>([]);
  const [defs, setDefs] = useState<NewtonDefinition[]>([]);
  const [props, setProps] = useState<NewtonProposition[]>([]);
  const [rules, setRules] = useState<NewtonRulesData | null>(null);
  const [intro, setIntro] = useState<NewtonIntroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDef, setSelectedDef] = useState<NewtonDefinition | null>(null);
  const [selectedProp, setSelectedProp] = useState<NewtonProposition | null>(
    null,
  );
  const [matchedWord, setMatchedWord] = useState<string | null>(null);
  const [visibleChapter, setVisibleChapter] = useState(prefs.chapter);
  const [introOpen, setIntroOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const chapterRefs = useRef<Map<number, HTMLElement>>(new Map());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      loadRevelationKjv(),
      loadNewtonDefinitions(),
      loadNewtonPropositions(),
      loadNewtonRules(),
      loadNewtonIntro(),
    ])
      .then(([book, definitions, propositions, rulesData, introData]) => {
        if (cancelled) return;
        setChapters(book);
        setDefs(definitions);
        setProps(propositions);
        setRules(rulesData);
        setIntro(introData);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const newtonProjectUrl =
    intro?.source.newton_project_url ??
    rules?.source.newton_project_url ??
    NEWTON_PROJECT_THEM00135_URL;

  const { byRoot, rootsLongestFirst } = useMemo(
    () => buildRootIndex(defs, { newtonDefsOnly: true }),
    [defs],
  );
  const defsById = useMemo(
    () => new Map(defs.map((d) => [d.id, d])),
    [defs],
  );
  const highlightRegex = useMemo(
    () => buildHighlightRegex(rootsLongestFirst),
    [rootsLongestFirst],
  );

  const chapterProps = useMemo(
    () => propositionsForChapter(props, visibleChapter),
    [props, visibleChapter],
  );

  const handleSelectRoot = useCallback(
    (matchedDefs: NewtonDefinition[], matched: string) => {
      setMatchedWord(matched);
      setSelectedDef(matchedDefs[0] ?? null);
      setSelectedProp(null);
    },
    [],
  );

  const scrollToChapter = useCallback(
    (chapter: number) => {
      update({ chapter });
      setVisibleChapter(chapter);
      const el = chapterRefs.current.get(chapter);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [update],
  );

  // Track which chapter is in view while scrolling (UI only; persist on change)
  useEffect(() => {
    if (!chapters.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (!visible.length) return;
        const ch = Number(
          (visible[0].target as HTMLElement).dataset.chapter ?? 0,
        );
        if (ch >= 1) setVisibleChapter(ch);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    for (const el of chapterRefs.current.values()) {
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, [chapters]);

  useEffect(() => {
    if (visibleChapter >= 1) update({ chapter: visibleChapter });
  }, [visibleChapter, update]);

  // Initial scroll to saved chapter once after load
  const didInitialScroll = useRef(false);
  useEffect(() => {
    if (loading || !chapters.length || didInitialScroll.current) return;
    didInitialScroll.current = true;
    const el = chapterRefs.current.get(prefs.chapter);
    if (el && prefs.chapter > 1) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "auto", block: "start" });
      });
    }
  }, [loading, chapters, prefs.chapter]);

  return (
    <div className="app rev-app">
      <header className="toolbar toolbar--simple rev-toolbar">
        <div className="brand-lockup">
          <a className="brand-home-link" href={homeHref()} title="Home">
            <MoonMark />
            <div className="brand-text">
              <h1 className="app-title">
                <span className="app-title-word">Moon</span>
                <span className="app-title-word app-title-word--light">
                  View
                </span>
              </h1>
            </div>
          </a>
          <span className="corpus-chip">Revelation</span>
        </div>

        <div className="toolbar-nav-selects">
          <label className="toolbar-book-field toolbar-chapter-field">
            <span className="sr-only">Chapter</span>
            <select
              className="field-input field-select toolbar-chapter-select"
              value={visibleChapter}
              disabled={loading}
              aria-label="Chapter"
              onChange={(e) => scrollToChapter(Number(e.target.value))}
            >
              {Array.from({ length: 22 }, (_, i) => i + 1).map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          className="mode-toggle"
          role="group"
          aria-label="Reference numbers"
        >
          <button
            type="button"
            className={`mode-toggle-btn${prefs.showChapterNumbers ? " mode-toggle-btn--active" : ""}`}
            aria-pressed={prefs.showChapterNumbers}
            onClick={() =>
              update({ showChapterNumbers: !prefs.showChapterNumbers })
            }
            title="Show or hide chapter headings"
          >
            Ch #
          </button>
          <button
            type="button"
            className={`mode-toggle-btn${prefs.showVerseNumbers ? " mode-toggle-btn--active" : ""}`}
            aria-pressed={prefs.showVerseNumbers}
            onClick={() =>
              update({ showVerseNumbers: !prefs.showVerseNumbers })
            }
            title="Show or hide verse numbers"
          >
            V #
          </button>
        </div>

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
              update({ theme: prefs.theme === "papyrus" ? "dark" : "papyrus" })
            }
          >
            {prefs.theme === "papyrus" ? "◐" : "▤"}
          </button>
        </div>
      </header>

      {error && <p className="error-banner">{error}</p>}

      <div className="rev-layout">
        <main className="rev-reader">
          <p className="rev-reader-lead">
            King James Version · words of Jesus in red · Newton&apos;s
            Definitions on matching figure-terms
          </p>

          <aside className="rev-disclaimer" role="note">
            <strong className="rev-disclaimer-label">Note.</strong> Word
            highlighting is automatic: it matches surface vocabulary to
            Newton&apos;s prophetic Definitions so you can consult those senses
            quickly. It does{" "}
            <em>not</em> mean Newton applied that definition to each specific
            instance highlighted below. Ordinary English may share a root with a
            figure without being one. Nothing on this site should be considered
            primary for assuming Newton&apos;s original intent. Content
            fragments come from his extensive manuscripts, which should be read
            independently before relying on this site.
          </aside>

          <div className="rev-rules">
            <button
              type="button"
              className="rev-rules-toggle"
              aria-expanded={introOpen}
              onClick={() => setIntroOpen((open) => !open)}
            >
              <span className="rev-rules-toggle-label">
                Watch Ye Therefore…
              </span>
              <span className="rev-rules-chevron" aria-hidden="true">
                {introOpen ? "▴" : "▾"}
              </span>
            </button>

            {introOpen && (
              <div className="rev-rules-body">
                <p className="rev-rules-source">
                  Introductory material from the Untitled Treatise on Revelation
                  (Yahuda Ms. 1.1), preceding Newton&apos;s Rules. Reading text
                  cleaned from the Newton Project transcription.{" "}
                  <a
                    className="rev-rules-source-link"
                    href={newtonProjectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open original on the Newton Project (Oxford)
                  </a>
                  .
                </p>

                {!intro && (
                  <p className="rev-pane-empty">Loading introduction…</p>
                )}

                <div className="rev-intro-prose">
                  {intro?.paragraphs.map((para, index) => (
                    <p key={`intro-${index}`}>
                      {linkifyMrMede(para)}
                    </p>
                  ))}
                  <p className="rev-incomplete-ellipsis" aria-hidden="true">
                    …
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rev-rules">
            <button
              type="button"
              className="rev-rules-toggle"
              aria-expanded={rulesOpen}
              onClick={() => setRulesOpen((open) => !open)}
            >
              <span className="rev-rules-toggle-label">
                Newton&apos;s rules for interpreting prophetic scripture
              </span>
              <span className="rev-rules-chevron" aria-hidden="true">
                {rulesOpen ? "▴" : "▾"}
              </span>
            </button>

            {rulesOpen && (
              <div className="rev-rules-body">
                <p className="rev-rules-source">
                  From the Untitled Treatise on Revelation (Yahuda Ms. 1.1).
                  Reading text cleaned from the Newton Project transcription.{" "}
                  <a
                    className="rev-rules-source-link"
                    href={newtonProjectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open original on the Newton Project (Oxford)
                  </a>
                  .
                </p>

                {!rules && (
                  <p className="rev-pane-empty">Loading rules…</p>
                )}

                {rules?.sections.map((section) => (
                  <section
                    key={section.title}
                    className="rev-rules-section"
                  >
                    <h3 className="rev-rules-section-title">
                      {section.title}
                    </h3>
                    <ol className="rev-rules-list">
                      {section.rules.map((rule, index) => (
                        <li key={`${section.title}-${index}`} className="rev-rules-item">
                          {rule}
                        </li>
                      ))}
                    </ol>
                  </section>
                ))}
              </div>
            )}
          </div>

          {loading && chapters.length === 0 && (
            <p className="loading-state">Loading Revelation…</p>
          )}

          {chapters.map((ch) => (
            <section
              key={ch.chapter}
              className="rev-chapter"
              data-chapter={ch.chapter}
              id={`rev-ch-${ch.chapter}`}
              ref={(el) => {
                if (el) chapterRefs.current.set(ch.chapter, el);
                else chapterRefs.current.delete(ch.chapter);
              }}
            >
              {prefs.showChapterNumbers && (
                <h2 className="rev-chapter-heading">Chapter {ch.chapter}</h2>
              )}
              <p className="rev-chapter-body">
                {ch.verses.map((v, idx) => {
                  const red = isJesusWords(v.chapter, v.verse);
                  return (
                    <span
                      key={`${v.chapter}:${v.verse}`}
                      className={`rev-verse${red ? " rev-verse--red" : ""}`}
                      id={`rev-${v.chapter}-${v.verse}`}
                    >
                      {prefs.showVerseNumbers && (
                        <sup className="rev-verse-num">{v.verse}</sup>
                      )}
                      <HighlightedVerse
                        text={v.text}
                        regex={highlightRegex}
                        byRoot={byRoot}
                        defsById={defsById}
                        activeDefId={selectedDef?.id ?? null}
                        onSelectRoot={handleSelectRoot}
                      />
                      {idx < ch.verses.length - 1 ? " " : ""}
                    </span>
                  );
                })}
              </p>
            </section>
          ))}
        </main>

        <aside className="rev-pane" aria-label="Newton annotations">
          <div className="rev-pane-section">
            <h2 className="rev-pane-title">Newton&apos;s Definition</h2>
            {selectedDef ? (
              <div className="rev-def-card">
                <div className="rev-def-meta">
                  {selectedDef.newton_def != null && (
                    <span className="rev-def-badge">
                      Def. {selectedDef.newton_def}
                    </span>
                  )}
                  {matchedWord && (
                    <span className="rev-def-matched">“{matchedWord}”</span>
                  )}
                </div>
                <h3 className="rev-def-label">{selectedDef.label}</h3>
                <p className="rev-def-sense">{selectedDef.sense}</p>
                {selectedDef.note && (
                  <p className="rev-def-note">{selectedDef.note}</p>
                )}
                <button
                  type="button"
                  className="rev-pane-clear"
                  onClick={() => {
                    setSelectedDef(null);
                    setMatchedWord(null);
                  }}
                >
                  Clear
                </button>
              </div>
            ) : (
              <p className="rev-pane-empty">
                Highlighted words match vocabulary from Newton&apos;s
                Definitions (not a claim that he read this verse that way).
                Click one — sun, beast, woman, mountain, and so on — to consult
                the sense he assigns that figure elsewhere in prophecy.
              </p>
            )}
          </div>

          <div className="rev-pane-section">
            <h2 className="rev-pane-title">
              Propositions
              <span className="rev-pane-title-meta">ch. {visibleChapter}</span>
            </h2>
            {chapterProps.length === 0 ? (
              <p className="rev-pane-empty">
                No proposition in the Yahuda treatise is tagged to this chapter
                yet. Browse other chapters or open the full list below.
              </p>
            ) : (
              <ul className="rev-prop-list">
                {chapterProps.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className={`rev-prop-item${selectedProp?.id === p.id ? " rev-prop-item--active" : ""}`}
                      onClick={() => {
                        setSelectedProp(p);
                        setSelectedDef(null);
                        setMatchedWord(null);
                      }}
                    >
                      <span className="rev-prop-num">Prop. {p.num}</span>
                      <span className="rev-prop-title">{p.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {selectedProp && (
              <article className="rev-prop-detail">
                <header className="rev-prop-detail-head">
                  <span className="rev-def-badge">Prop. {selectedProp.num}</span>
                  <button
                    type="button"
                    className="rev-pane-clear"
                    onClick={() => setSelectedProp(null)}
                  >
                    Close
                  </button>
                </header>
                <h3 className="rev-prop-detail-title">{selectedProp.title}</h3>
                <div className="rev-prop-detail-body">
                  {selectedProp.text.split(/\n\n+/).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                {selectedProp.chapters.length > 0 && (
                  <p className="rev-prop-chapters">
                    Chapters:{" "}
                    {selectedProp.chapters.map((c, i) => (
                      <button
                        key={c}
                        type="button"
                        className="rev-prop-ch-link"
                        onClick={() => scrollToChapter(c)}
                      >
                        {c}
                        {i < selectedProp.chapters.length - 1 ? ", " : ""}
                      </button>
                    ))}
                  </p>
                )}
              </article>
            )}
          </div>

          <div className="rev-pane-section rev-pane-section--compact">
            <h2 className="rev-pane-title">All propositions</h2>
            <ul className="rev-prop-list rev-prop-list--all">
              {props.map((p) => (
                <li key={`all-${p.id}`}>
                  <button
                    type="button"
                    className={`rev-prop-item rev-prop-item--compact${selectedProp?.id === p.id ? " rev-prop-item--active" : ""}`}
                    onClick={() => {
                      setSelectedProp(p);
                      setSelectedDef(null);
                      setMatchedWord(null);
                      if (p.chapters[0]) scrollToChapter(p.chapters[0]);
                    }}
                  >
                    <span className="rev-prop-num">{p.num}</span>
                    <span className="rev-prop-title">{p.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
