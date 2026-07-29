import { assetUrl } from "../utils/assets";
import { corpusHref, infoHref } from "../utils/app-routing";

const MOON_IMAGE = assetUrl("/images/splash-moon.jpg");

export function CorpusHome() {
  return (
    <div className="hub-page">
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
                  <circle cx="33" cy="19" r="17.5" fill="url(#hub-moon-shade)" />
                </g>
              </svg>
            </span>
            <div>
              <h1 className="hub-title">
                <span className="app-title-word">Moon</span>
                <span className="app-title-word app-title-word--light">View</span>
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
            <a className="hub-card" href={corpusHref("torah")}>
              <span className="hub-card-kicker">Hebrew Bible</span>
              <span className="hub-card-title">Torah</span>
              <span className="hub-card-desc">
                Genesis–Deuteronomy · KJV / JPS + YLT · Hebrew analytic
              </span>
            </a>
            <a className="hub-card" href={corpusHref("paul")}>
              <span className="hub-card-kicker">New Testament</span>
              <span className="hub-card-title">Paul</span>
              <span className="hub-card-desc">
                Thirteen letters · KJV + ESV side by side · Greek analytic
              </span>
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
