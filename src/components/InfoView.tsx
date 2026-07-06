import { usePageScrollMemory } from "../hooks/usePageScrollMemory";

const INFO_SCROLL_KEY = "moon-view-info-scroll";

export function InfoView() {
  usePageScrollMemory(INFO_SCROLL_KEY);
  return (
    <div className="secondary-page info-page">
      <header className="secondary-page-header">
        <div>
          <h1>About Moon View</h1>
          <p className="secondary-page-lead">Search the scriptures for yourself.</p>
        </div>
        <a className="secondary-page-back" href="#">
          ← Moon View
        </a>
      </header>

      <article className="info-content">
        <section className="info-section">
          <p>
            A parallel Torah reader — Genesis through Deuteronomy — with two
            ways to read. Natural mode lays each book out as continuous prose:
            no verse numbers, no chapter breaks, with YLT punctuation and
            capitalization preserved. Analytic mode gives you
            verse-by-verse rows with references, Hebrew and transliteration,
            per-verse notes, word-level Strong&apos;s lookup, and a Hebrew name
            dictionary for people, places, and other proper names.
          </p>
          <p>
            Choose KJV or JPS as your English column in either mode; YLT runs
            alongside in both. Toggle God Names to show Hebrew divine titles in
            YLT, or leave them in the original English. Click a verse to pin
            your place — in natural mode anywhere in the text, in analytic mode
            on the verse number.
          </p>
          <p>
            Read with minimal bias, and toggle the enhanced features at your
            discretion.
          </p>
        </section>

        <section className="info-section">
          <h2>
            <a className="info-section-link" href="#god-names">
              God Names (YLT)
            </a>
          </h2>
          <p>
            How Moon View maps YLT English divine titles to their Hebrew forms
            when <strong>God Names</strong> is on in the toolbar — including the
            full substitution table and matching rules.
          </p>
          <a className="info-section-cta" href="#god-names">
            Read God Names guide →
          </a>
        </section>
      </article>
    </div>
  );
}