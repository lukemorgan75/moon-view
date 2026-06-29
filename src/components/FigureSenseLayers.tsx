import type { FigureBundle } from "../api/figures";
import {
  bookInScope,
  senseLayersForContext,
  type FigureEntry,
} from "../api/figures";

interface FigureSenseLayersProps {
  entry: FigureEntry;
  bundle: FigureBundle;
  book?: string;
  compact?: boolean;
}

function conditionLabels(
  bundle: FigureBundle,
  ids: string[] | undefined,
): string {
  return (ids ?? [])
    .map((id) => bundle.conditions.find((c) => c.id === id)?.label ?? id)
    .join(" · ");
}

export function FigureSenseLayers({
  entry,
  bundle,
  book,
  compact = false,
}: FigureSenseLayersProps) {
  const layers = senseLayersForContext(entry, bundle, book);
  const hasCanon = layers.canon.length > 0;
  const hasGenre = layers.genre.length > 0;
  const hasBook = layers.book.length > 0;
  const hasScopedList =
    !book && entry.scoped_senses && entry.scoped_senses.length > 0;

  if (!hasCanon && !hasGenre && !hasBook && !hasScopedList) {
    return null;
  }

  const tierClass = compact
    ? "figure-sense-tier figure-sense-tier--compact"
    : "figure-sense-tier";

  return (
    <section
      className={`figure-sense-layers ${compact ? "figure-sense-layers--compact" : ""}`}
      aria-label="Figure sense layers"
    >
      {!compact && (
        <p className="figure-sense-layers-intro">
          Three tiers: pan-biblical meaning, genre family, then book-limited scope.
          {book && layers.activeGenreLabel && (
            <>
              {" "}
              Reading in <strong>{book}</strong> ({layers.activeGenreLabel}).
            </>
          )}
        </p>
      )}

      {hasCanon && (
        <div className={tierClass}>
          <h3 className="figure-sense-tier-title">
            <span className="figure-sense-tier-badge figure-sense-tier-badge--canon">
              Canon
            </span>
            Across the Bible
          </h3>
          <ul className="figure-sense-list">
            {layers.canon.map((part, index) => (
              <li key={`${part.label}-${index}`} className="figure-sense-item">
                <header className="figure-sense-item-header">
                  <span className="figure-scope-tag">{part.label}</span>
                  {part.newton_def != null && (
                    <span className="figure-sense-meta">
                      Def {part.newton_def}
                    </span>
                  )}
                  {part.source && (
                    <span className="figure-sense-meta">{part.source}</span>
                  )}
                </header>
                <p className="figure-sense-text">{part.sense}</p>
                {part.conditions && part.conditions.length > 0 && (
                  <p className="figure-sense-conditions">
                    {conditionLabels(bundle, part.conditions)}
                  </p>
                )}
                {part.contrasts_with && (
                  <p className="figure-sense-contrast">
                    <span className="figure-sense-contrast-label">Contrast:</span>{" "}
                    {part.contrasts_with}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasGenre && (
        <div className={tierClass}>
          <h3 className="figure-sense-tier-title">
            <span className="figure-sense-tier-badge figure-sense-tier-badge--genre">
              Genre
            </span>
            By corpus
          </h3>
          {layers.activeGenreDescription && book && (
            <p className="figure-sense-genre-frame">
              {layers.activeGenreDescription}
            </p>
          )}
          <ul className="figure-sense-list">
            {layers.genre.map((g) => {
              const active = g.genre_id === layers.activeGenreId;
              return (
                <li
                  key={g.genre_id}
                  className={
                    active ? "figure-sense-item figure-sense-item--active" : "figure-sense-item"
                  }
                >
                  <header className="figure-sense-item-header">
                    <span className="figure-scope-tag">{g.genre_label}</span>
                    {g.newton_def != null && (
                      <span className="figure-sense-meta">
                        Def {g.newton_def}
                      </span>
                    )}
                    {g.source && (
                      <span className="figure-sense-meta">{g.source}</span>
                    )}
                  </header>
                  <p className="figure-sense-text">{g.sense}</p>
                  {g.sample_books && g.sample_books.length > 0 && (
                    <p className="figure-sense-books">
                      e.g. {g.sample_books.join(", ")}
                    </p>
                  )}
                  {g.refs && g.refs.length > 0 && (
                    <p className="figure-sense-refs">{g.refs.join(" · ")}</p>
                  )}
                  {g.contrasts_with && (
                    <p className="figure-sense-contrast">
                      <span className="figure-sense-contrast-label">Contrast:</span>{" "}
                      {g.contrasts_with}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {(hasBook || hasScopedList) && (
        <div className={tierClass}>
          <h3 className="figure-sense-tier-title">
            <span className="figure-sense-tier-badge figure-sense-tier-badge--book">
              Book
            </span>
            {book ? `In ${book}` : "Book-scoped"}
          </h3>
          {!compact && !book && (
            <p className="figure-sense-tier-note">
              Book-limited readings. Genesis senses use Genesis only — not later
              prophets or the New Testament unless scope explicitly includes them.
            </p>
          )}
          <ul className="figure-sense-list">
            {hasBook
              ? layers.book.map((row, index) => (
                  <li
                    key={`${row.label}-${index}`}
                    className={
                      row.inContext
                        ? "figure-sense-item figure-sense-item--active"
                        : "figure-sense-item"
                    }
                  >
                    <header className="figure-sense-item-header">
                      <span className="figure-scope-tag">{row.label}</span>
                      {row.genre && (
                        <span className="figure-sense-meta">{row.genre}</span>
                      )}
                      {row.source && (
                        <span className="figure-sense-meta">{row.source}</span>
                      )}
                    </header>
                    <p className="figure-sense-text">{row.sense}</p>
                    {row.refs && row.refs.length > 0 && (
                      <p className="figure-sense-refs">{row.refs.join(" · ")}</p>
                    )}
                  </li>
                ))
              : entry.scoped_senses!.map((scoped, index) => {
                  const inBookContext = Boolean(
                    book && bookInScope(scoped.scope_books, book),
                  );
                  return (
                    <li
                      key={`${scoped.scope_label ?? "scope"}-${index}`}
                      className={
                        inBookContext
                          ? "figure-sense-item figure-sense-item--active"
                          : "figure-sense-item"
                      }
                    >
                      <header className="figure-sense-item-header">
                        <span className="figure-scope-tag">
                          {scoped.scope_label ??
                            scoped.scope_books?.join(", ") ??
                            "Scoped"}
                        </span>
                        {scoped.genre && (
                          <span className="figure-sense-meta">{scoped.genre}</span>
                        )}
                        {scoped.source && (
                          <span className="figure-sense-meta">{scoped.source}</span>
                        )}
                      </header>
                      <p className="figure-sense-text">{scoped.sense}</p>
                      {scoped.precedent && (
                        <p className="figure-sense-meta figure-sense-precedent">
                          Precedent: {scoped.precedent.replace(/_/g, " ")}
                        </p>
                      )}
                      {scoped.refs && scoped.refs.length > 0 && (
                        <p className="figure-sense-refs">
                          {scoped.refs.join(" · ")}
                        </p>
                      )}
                    </li>
                  );
                })}
          </ul>
        </div>
      )}
    </section>
  );
}