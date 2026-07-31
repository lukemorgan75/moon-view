import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { assetUrl } from "../utils/assets";
import { corpusHref, infoHref, revelationHref } from "../utils/app-routing";

const MOON_IMAGE = assetUrl("/images/splash-moon.jpg");

type HubTransition = "torah" | "revelation";

const TRANSITION_MS: Record<HubTransition, number> = {
  torah: 1400,
  revelation: 1200,
};

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function go(href: string): void {
  window.location.assign(href.startsWith("#") ? href : `#${href}`);
}

function BigBangBurst() {
  const particles = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className="hub-fx hub-fx--bigbang" aria-hidden="true">
      <div className="hub-fx-bigbang-core" />
      <div className="hub-fx-bigbang-shock" />
      <div className="hub-fx-bigbang-shock hub-fx-bigbang-shock--late" />
      {particles.map((i) => (
        <span
          key={i}
          className="hub-fx-bigbang-particle"
          style={
            {
              "--a": `${(i / particles.length) * 360}deg`,
              "--d": `${0.55 + (i % 5) * 0.12}`,
              "--delay": `${(i % 6) * 30}ms`,
            } as CSSProperties
          }
        />
      ))}
      <div className="hub-fx-bigbang-veil" />
    </div>
  );
}

/** Revelation hub exit: emerald glow only (no falling objects). */
function EmeraldGlow() {
  return (
    <div className="hub-fx hub-fx--emerald" aria-hidden="true">
      <div className="hub-fx-emerald-glow" />
      <div className="hub-fx-emerald-veil" />
    </div>
  );
}

export function CorpusHome() {
  const [transition, setTransition] = useState<HubTransition | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const navigateAfter = useCallback((kind: HubTransition, href: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (prefersReducedMotion()) {
      go(href);
      return;
    }
    setTransition(kind);
    timerRef.current = setTimeout(() => {
      go(href);
    }, TRANSITION_MS[kind]);
  }, []);

  const onCardClick = useCallback(
    (
      event: MouseEvent<HTMLAnchorElement>,
      kind: HubTransition | "paul",
      href: string,
    ) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      event.preventDefault();
      if (transition) return;
      // Paul: navigate immediately (no letter/envelope animation).
      if (kind === "paul") {
        go(href);
        return;
      }
      navigateAfter(kind, href);
    },
    [navigateAfter, transition],
  );

  return (
    <div
      className={`hub-page${transition ? ` hub-page--fx hub-page--fx-${transition}` : ""}`}
    >
      <div className="hub-backdrop" aria-hidden="true">
        <img
          className="hub-backdrop-image"
          src={MOON_IMAGE}
          alt=""
          decoding="async"
          fetchPriority="high"
          draggable={false}
        />
      </div>

      <div className="hub-content">
        <header className="hub-header">
          <div className="hub-brand">
            <span className="brand-mark hub-brand-mark" aria-hidden="true">
              <svg
                className="brand-mark-svg"
                viewBox="0 0 40 40"
                xmlns="http://www.w3.org/2000/svg"
                role="presentation"
              >
                <defs>
                  <radialGradient id="hub-moon-sphere" cx="34%" cy="30%" r="68%">
                    <stop offset="0%" stopColor="#fafbfc" />
                    <stop offset="38%" stopColor="#d8dce3" />
                    <stop offset="72%" stopColor="#9aa1ab" />
                    <stop offset="100%" stopColor="#5f6670" />
                  </radialGradient>
                  <radialGradient id="hub-moon-shade" cx="78%" cy="48%" r="58%">
                    <stop offset="0%" stopColor="#12151c" stopOpacity="0.96" />
                    <stop offset="55%" stopColor="#1c2029" stopOpacity="0.82" />
                    <stop offset="100%" stopColor="#2a303a" stopOpacity="0" />
                  </radialGradient>
                  <clipPath id="hub-moon-clip">
                    <circle cx="20" cy="20" r="18" />
                  </clipPath>
                </defs>
                <g clipPath="url(#hub-moon-clip)">
                  <circle cx="20" cy="20" r="18" fill="url(#hub-moon-sphere)" />
                  <circle
                    cx="33"
                    cy="19"
                    r="17.5"
                    fill="url(#hub-moon-shade)"
                  />
                </g>
              </svg>
            </span>
            <div>
              <h1 className="hub-title">
                <span className="app-title-word">Moon</span>
                <span className="app-title-word app-title-word--light">
                  View
                </span>
              </h1>
              <p className="hub-lead">Search the scriptures for yourself.</p>
            </div>
          </div>
          <a className="toolbar-nav-link hub-about-link" href={infoHref()}>
            About
          </a>
        </header>

        <main className="hub-main">
          <p className="hub-prompt">Choose a corpus</p>
          <div className="hub-choices" role="navigation" aria-label="Corpus">
            <a
              className={`hub-card${transition === "torah" ? " hub-card--launching" : ""}`}
              href={corpusHref("torah")}
              onClick={(e) => onCardClick(e, "torah", corpusHref("torah"))}
            >
              <span className="hub-card-kicker">Hebrew Bible</span>
              <span className="hub-card-title">Torah</span>
              <span className="hub-card-desc">
                Genesis–Deuteronomy · KJV / JPS + YLT · Hebrew analytic
              </span>
            </a>
            <a
              className="hub-card"
              href={corpusHref("paul")}
              onClick={(e) => onCardClick(e, "paul", corpusHref("paul"))}
            >
              <span className="hub-card-kicker">
                With Locke&apos;s Paraphrase
              </span>
              <span className="hub-card-title">Paul</span>
              <span className="hub-card-desc">
                Thirteen letters · KJV + ESV · Locke with ESV on five letters ·
                Greek analytic
              </span>
            </a>
            <a
              className={`hub-card hub-card--revelation${transition === "revelation" ? " hub-card--launching" : ""}`}
              href={revelationHref()}
              onClick={(e) =>
                onCardClick(e, "revelation", revelationHref())
              }
            >
              <span className="hub-card-kicker">Apocalypse · Newton</span>
              <span className="hub-card-title">Revelation</span>
              <span className="hub-card-desc">
                KJV with Newton&apos;s definitions &amp; propositions · figure
                highlights · show/hide refs
              </span>
            </a>
          </div>
        </main>
      </div>

      {transition === "torah" && <BigBangBurst />}
      {transition === "revelation" && <EmeraldGlow />}
    </div>
  );
}
