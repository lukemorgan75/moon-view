import { usePageScrollMemory } from "../hooks/usePageScrollMemory";
import { YLT_DIVINE_SUBSTITUTION_KEY } from "../utils/ylt-format";

const GOD_NAMES_SCROLL_KEY = "moon-view-god-names-scroll";

export function GodNamesView() {
  usePageScrollMemory(GOD_NAMES_SCROLL_KEY);

  return (
    <div className="secondary-page info-page">
      <header className="secondary-page-header">
        <div>
          <h1>God Names (YLT)</h1>
          <p className="secondary-page-lead">
            Hebrew divine titles in Young&apos;s Literal Translation.
          </p>
        </div>
        <a className="secondary-page-back" href="#info">
          ← About
        </a>
      </header>

      <article className="info-content">
        <section className="info-section">
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
            divine titles and punctuation; only the Hebrew-form mapping above is
            skipped.
          </p>
        </section>
      </article>
    </div>
  );
}