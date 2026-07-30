import { homeHref } from "../utils/app-routing";
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
        <a className="secondary-page-back" href={homeHref()}>
          ← Moon View
        </a>
      </header>

      <article className="info-content">
        <section className="info-section">
          <p>
            Moon View is a parallel scripture reader with two corpora.{" "}
            <strong>Torah</strong> covers Genesis through Deuteronomy with
            Hebrew; <strong>Paul</strong> covers the thirteen Pauline letters
            with Greek. Each corpus has the same two reading modes.
          </p>
          <p>
            <strong>Natural</strong> mode lays each book out as continuous
            prose: no verse numbers, no chapter breaks.{" "}
            <strong>Analytic</strong> mode gives verse-by-verse rows with
            references, source language plus transliteration, per-verse notes,
            and word-level Strong&apos;s lookup.
          </p>
        </section>

        <section className="info-section">
          <h2>Torah</h2>
          <p>
            Choose KJV or JPS as your English column; Young&apos;s Literal
            Translation (YLT) runs alongside in both modes. Analytic mode adds
            Hebrew morphology, Strong&apos;s Hebrew, and a Hebrew name
            dictionary for people, places, and other proper names.
          </p>
        </section>

        <section className="info-section">
          <h2>Paul</h2>
          <p>
            For most Pauline letters, KJV and ESV sit side by side. On the five
            letters Locke paraphrased (Galatians, I–II Corinthians, Romans,
            Ephesians), the layout switches to ESV paired with Locke&apos;s
            Paraphrase — Locke&apos;s column is wider so it stays roughly level
            with the ESV. Analytic mode adds Greek morphology (SBLGNT),
            transliteration, and Strong&apos;s Greek. Locke&apos;s text is an
            OCR reading edition — use the printed paraphrase for careful study.
          </p>
        </section>

        <section className="info-section">
          <h2>Revelation</h2>
          <p>
            A different reader: KJV Revelation with the words of Jesus in red,
            and Isaac Newton&apos;s prophetic figures from the Yahuda treatise.
            Words that match his Definitions (sun, beast, woman, mountain, and
            so on) are highlighted automatically so you can consult those senses
            — not as a claim that Newton applied that figure to every matching
            English root. Click a highlight to read the definition; propositions
            for the chapter sit in the same pane. Chapter and verse numbers can
            be shown or hidden; each chapter is a continuous paragraph.
          </p>
        </section>

        <section className="info-section">
          <p>
            Click a verse to pin your place in Torah or Paul — in natural mode
            anywhere in the text, in analytic mode on the verse number. Read
            with minimal bias, and toggle enhanced features only when you need
            them.
          </p>
        </section>
      </article>
    </div>
  );
}
