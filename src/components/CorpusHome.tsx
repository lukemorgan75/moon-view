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

type HubTransition = "torah" | "paul" | "revelation";

const TRANSITION_MS: Record<HubTransition, number> = {
  torah: 1400,
  paul: 1200,
  revelation: 1500,
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

function EnvelopeOpen() {
  return (
    <div className="hub-fx hub-fx--envelope" aria-hidden="true">
      <div className="hub-fx-envelope">
        <div className="hub-fx-envelope-back" />
        <div className="hub-fx-envelope-letter">
          <span className="hub-fx-envelope-letter-line" />
          <span className="hub-fx-envelope-letter-line" />
          <span className="hub-fx-envelope-letter-line hub-fx-envelope-letter-line--short" />
          <span className="hub-fx-envelope-seal">Παῦλος</span>
        </div>
        <div className="hub-fx-envelope-body" />
        <div className="hub-fx-envelope-flap" />
      </div>
      <div className="hub-fx-envelope-veil" />
    </div>
  );
}

function SwordSvg({ id }: { id: string }) {
  return (
    <svg
      className="hub-fx-sword"
      viewBox="0 0 32 96"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
    >
      <defs>
        <linearGradient id={`${id}-blade`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c8d4e4" />
          <stop offset="45%" stopColor="#f4f7fb" />
          <stop offset="100%" stopColor="#8fa3bc" />
        </linearGradient>
        <linearGradient id={`${id}-hilt`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f0d78c" />
          <stop offset="100%" stopColor="#9a7420" />
        </linearGradient>
        <linearGradient id={`${id}-gem`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6fffc0" />
          <stop offset="100%" stopColor="#0d8f5b" />
        </linearGradient>
      </defs>
      {/* Point-down blade (cast downward) */}
      <path
        d="M16 90 L10 28 L16 24 L22 28 Z"
        fill={`url(#${id}-blade)`}
        stroke="#e8eef6"
        strokeWidth="0.6"
      />
      <path d="M16 88 L15.2 30 L16.8 30 Z" fill="rgba(255,255,255,0.45)" />
      {/* Guard */}
      <rect
        x="6"
        y="24"
        width="20"
        height="4"
        rx="1"
        fill={`url(#${id}-hilt)`}
      />
      {/* Grip */}
      <rect
        x="13"
        y="10"
        width="6"
        height="15"
        rx="1.2"
        fill={`url(#${id}-hilt)`}
      />
      {/* Pommel */}
      <circle cx="16" cy="8" r="3.4" fill={`url(#${id}-hilt)`} />
      <circle cx="16" cy="8" r="1.6" fill={`url(#${id}-gem)`} />
    </svg>
  );
}

function SwordFall() {
  return (
    <div className="hub-fx hub-fx--sword" aria-hidden="true">
      <div className="hub-fx-sword-glow" />
      <span
        className="hub-fx-sword-wrap"
        style={
          {
            "--sword-left": "50%",
            "--sword-delay": "0s",
            "--sword-duration": "1.4s",
            "--sword-spin": "14deg",
            "--sword-scale": "1.15",
          } as CSSProperties
        }
      >
        <SwordSvg id="hub-sword-0" />
      </span>
      <div className="hub-fx-sword-veil" />
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
      kind: HubTransition,
      href: string,
    ) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      event.preventDefault();
      if (transition) return;
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
              className={`hub-card${transition === "paul" ? " hub-card--launching" : ""}`}
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
      {transition === "paul" && <EnvelopeOpen />}
      {transition === "revelation" && <SwordFall />}
    </div>
  );
}
