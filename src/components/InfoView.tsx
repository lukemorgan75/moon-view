import { YLT_DIVINE_SUBSTITUTION_KEY } from "../utils/ylt-format";

export function InfoView() {
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
            no verse numbers, no chapter breaks. Analytic mode gives you
            verse-by-verse rows with references, Hebrew and transliteration,
            per-verse notes, and word-level Strong&apos;s lookup.
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
          <h2>God Names (YLT)</h2>
          <p>
            With <strong>God Names</strong> selected in the toolbar, Young&apos;s
            Literal Translation replaces common English divine titles with their
            Hebrew forms. The mapped name appears in bold; the original YLT
            English follows in parentheses.
          </p>
          <div className="info-table-wrap">
            <table className="info-table">
              <thead>
                <tr>
                  <th scope="col">YLT (English)</th>
                  <th scope="col">Display</th>
                </tr>
              </thead>
              <tbody>
                {YLT_DIVINE_SUBSTITUTION_KEY.map((entry) => (
                  <tr key={entry.display}>
                    <td>{entry.yltForms.join(", ")}</td>
                    <td>
                      <strong>{entry.display}</strong>
                      {entry.note ? (
                        <span className="info-table-note">{entry.note}</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="info-section-footnote">
            Longer phrases are matched first (e.g. <em>God Most High</em> before{" "}
            <em>God</em>). With God Names off, YLT keeps its original English
            divine titles (capitalized in natural mode); only the Hebrew-form
            mapping above is skipped.
          </p>
        </section>
      </article>
    </div>
  );
}