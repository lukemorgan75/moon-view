import { useEffect, useMemo, useState } from "react";
import {
  getFigureEntry,
  listRootFigures,
  loadFigureDictionary,
  lookupFigures,
  type FigureBundle,
  type FigureEntry,
} from "../api/figures";
import { FigureSenseLayers } from "./FigureSenseLayers";
import { StrongsDetailsTable } from "./StrongsDetailsTable";
import {
  parseFigureDictionaryHash,
  type FigureDictionaryLocation,
} from "../utils/figure-routing";

function FigureTreeNode({
  entry,
  bundle,
  depth,
  selectedId,
  onSelect,
}: {
  entry: FigureEntry;
  bundle: FigureBundle;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const children = (entry.children ?? [])
    .map((id) => getFigureEntry(bundle, id))
    .filter((e): e is FigureEntry => Boolean(e))
    .sort((a, b) => (a.newton_def ?? 9999) - (b.newton_def ?? 9999));

  const indentRem = depth + 0.5;

  return (
    <li className="figure-tree-item">
      <button
        type="button"
        className={`figure-tree-btn ${selectedId === entry.id ? "figure-tree-btn--active" : ""}`}
        style={{ paddingLeft: `${indentRem}rem` }}
        onClick={() => onSelect(entry.id)}
      >
        <span className="figure-tree-label">{entry.label}</span>
        <span className="figure-tree-meta">
          {entry.role}
          {entry.newton_def != null && ` · Def ${entry.newton_def}`}
        </span>
      </button>
      {children.length > 0 && (
        <ul className="figure-tree">
          {children.map((child) => (
            <FigureTreeNode
              key={child.id}
              entry={child}
              bundle={bundle}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function FigureDetail({
  entry,
  bundle,
  bookContext,
}: {
  entry: FigureEntry;
  bundle: FigureBundle;
  bookContext?: string;
}) {
  const ancestors = useMemo(() => {
    const chain: FigureEntry[] = [];
    let current = entry;
    while (current.parent) {
      const parent = getFigureEntry(bundle, current.parent);
      if (!parent) break;
      chain.push(parent);
      current = parent;
    }
    return chain.reverse();
  }, [entry, bundle]);

  const conditionLabels = (entry.conditions ?? [])
    .map((id) => bundle.conditions.find((c) => c.id === id)?.label)
    .filter(Boolean);

  const scopeTags = entry.scope ?? [];

  return (
    <article className="figure-detail">
      <header className="figure-detail-header">
        <h2>{entry.label}</h2>
        <p className="figure-detail-id">{entry.id}</p>
      </header>

      {bookContext && (
        <p className="figure-context-banner">
          Opened from <strong>{bookContext}</strong> — the matching genre and
          book-scoped senses are highlighted below.
        </p>
      )}

      {ancestors.length > 0 && (
        <p className="figure-breadcrumb">
          {ancestors.map((a) => a.label).join(" → ")} → {entry.label}
        </p>
      )}

      <dl className="figure-detail-grid">
        <dt>Role</dt>
        <dd>{entry.role}</dd>
        {entry.newton_def != null && (
          <>
            <dt>Newton Def</dt>
            <dd>{entry.newton_def}</dd>
          </>
        )}
        <dt>Figure likelihood</dt>
        <dd>{entry.figure_likelihood}</dd>
        <dt>Scope</dt>
        <dd>{scopeTags.join(", ") || "—"}</dd>
        {conditionLabels.length > 0 && (
          <>
            <dt>Conditions</dt>
            <dd>{conditionLabels.join("; ")}</dd>
          </>
        )}
        {entry.sense &&
          !entry.canon_senses?.length &&
          (!entry.scoped_senses || entry.scoped_senses.length === 0) && (
            <>
              <dt>Sense</dt>
              <dd>{entry.sense}</dd>
            </>
          )}
        {entry.note && (
          <>
            <dt>Note</dt>
            <dd>{entry.note}</dd>
          </>
        )}
        {entry.roots?.en && entry.roots.en.length > 0 && (
          <>
            <dt>EN roots</dt>
            <dd>{entry.roots.en.join(", ")}</dd>
          </>
        )}
      </dl>

      {entry.strongs_details && entry.strongs_details.length > 0 && (
        <section className="figure-strongs-section">
          <h3>Strong&apos;s</h3>
          <StrongsDetailsTable details={entry.strongs_details} />
        </section>
      )}

      <FigureSenseLayers
        entry={entry}
        bundle={bundle}
        book={bookContext}
      />

      {entry.alternate_senses &&
        entry.alternate_senses.length > 0 &&
        !entry.canon_senses?.length && (
        <section className="figure-alt-senses">
          <h3>Alternate senses (same scope family)</h3>
          <ul>
            {entry.alternate_senses.map((alt, index) => (
              <li key={`${alt.sense.slice(0, 40)}-${index}`}>
                <strong>
                  {(alt.conditions ?? [])
                    .map(
                      (id) =>
                        bundle.conditions.find((c) => c.id === id)?.label ??
                        id,
                    )
                    .join("; ")}
                </strong>
                : {alt.sense}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(entry.children ?? []).length > 0 && (
        <section className="figure-children">
          <h3>Children ({entry.children.length})</h3>
          <ul>
            {entry.children.map((id) => {
              const child = getFigureEntry(bundle, id);
              return child ? (
                <li key={id}>
                  <strong>{child.label}</strong> ({child.role}) — {child.sense}
                </li>
              ) : null;
            })}
          </ul>
        </section>
      )}
    </article>
  );
}

function applyLocation(
  location: FigureDictionaryLocation,
  bundle: FigureBundle,
  setSelectedId: (id: string) => void,
  setQuery: (q: string) => void,
  setBookContext: (book?: string) => void,
) {
  setBookContext(location.book);

  if (location.figureId && getFigureEntry(bundle, location.figureId)) {
    setSelectedId(location.figureId);
    return;
  }

  if (location.query) {
    setQuery(location.query);
    const results = lookupFigures(
      bundle,
      /^[HG]?\d+$/i.test(location.query)
        ? { he: location.query }
        : { en: location.query },
    );
    if (results[0]) {
      setSelectedId(results[0].entry.id);
    }
    return;
  }

  const roots = listRootFigures(bundle);
  if (roots[0]) setSelectedId(roots[0].id);
}

interface FigureDictionaryViewProps {
  hash: string;
}

export function FigureDictionaryView({ hash }: FigureDictionaryViewProps) {
  const [bundle, setBundle] = useState<FigureBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bookContext, setBookContext] = useState<string | undefined>();

  const location = useMemo(() => parseFigureDictionaryHash(hash), [hash]);

  useEffect(() => {
    loadFigureDictionary()
      .then((data) => {
        setBundle(data);
        applyLocation(location, data, setSelectedId, setQuery, setBookContext);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load."),
      );
  }, []);

  useEffect(() => {
    if (!bundle) return;
    applyLocation(location, bundle, setSelectedId, setQuery, setBookContext);
  }, [bundle, location.figureId, location.book, location.query]);

  const searchResults = useMemo(() => {
    if (!bundle || !query.trim()) return [];
    const q = query.trim();
    const byStrong = /^[HG]?\d+$/i.test(q);
    return lookupFigures(bundle, byStrong ? { he: q } : { en: q });
  }, [bundle, query]);

  const selected =
    bundle && selectedId ? getFigureEntry(bundle, selectedId) : null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams();
      if (bookContext) params.set("book", bookContext);
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        `#figures/${encodeURIComponent(id)}${qs ? `?${qs}` : ""}`,
      );
    }
  };

  return (
    <div className="secondary-page figure-dict-page">
      <div className="figure-dict-toolbar">
        <header className="figure-dict-header">
          <h1>Figure Dictionary</h1>
          <a className="figure-dict-back" href="#">
            ← Moon View
          </a>
        </header>

        {error && <p className="error-banner">{error}</p>}

        <div className="figure-dict-search">
          <label>
            Lookup by English word or Strong&apos;s (e.g. cedar, H730, G5115)
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="cedar, waters, bow…"
            />
          </label>
        </div>

        {searchResults.length > 0 && (
          <section className="figure-search-results">
            <h2>Search results</h2>
            <ul>
              {searchResults.map((r) => (
                <li key={r.entry.id}>
                  <button type="button" onClick={() => handleSelect(r.entry.id)}>
                    {r.entry.label}
                  </button>
                  <span className="figure-search-meta">
                    via {r.matchedVia}:{r.matchedRoot} · {r.entry.role}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {bundle && (
        <div className="figure-dict-layout">
          <nav className="figure-tree-panel" aria-label="Figure hierarchy">
            <h2 className="figure-panel-title">Hierarchy</h2>
            <div className="figure-tree-scroll">
              <ul className="figure-tree">
                {listRootFigures(bundle).map((root) => (
                  <FigureTreeNode
                    key={root.id}
                    entry={root}
                    bundle={bundle}
                    depth={0}
                    selectedId={selectedId}
                    onSelect={handleSelect}
                  />
                ))}
              </ul>
            </div>
          </nav>
          <div className="figure-detail-panel">
            {selected ? (
              <FigureDetail
                entry={selected}
                bundle={bundle}
                bookContext={bookContext}
              />
            ) : (
              <p>Select an entry from the tree or search.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}