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
            Completely raw. No verse numbers, no chapter breaks — unless you
            want them.
          </p>
          <p>
            You can toggle versions side by side, transliteration. Click words
            for concordance, figurative cross-reference, and symbolic uses across
            the Bible. But only if you want to dig in.
          </p>
          <p>
            Otherwise, this is your source to read Scripture without the
            slightest bias of format, footnote, or header. Turn the enhanced
            features on or off as you see fit.
          </p>
        </section>
      </article>
    </div>
  );
}