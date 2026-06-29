import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadParallelVerses } from "./api/bible";
import { getBookMeta } from "./api/book-meta";
import { loadStrongsDictionary } from "./api/strongs";
import { ParallelView } from "./components/ParallelView";
import { Toolbar } from "./components/Toolbar";
import { useHeaderOffset } from "./hooks/useHeaderOffset";
import { useNotes } from "./hooks/useNotes";
import { usePreferences } from "./hooks/usePreferences";
import { deriveViewState, type VerseRow } from "./types";

function App() {
  const { prefs, update } = usePreferences();
  const { notes, setNote } = useNotes(prefs.book);
  const [verses, setVerses] = useState<VerseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadGen = useRef(0);

  const view = useMemo(() => {
    const { chapters } = getBookMeta(prefs.book);
    return deriveViewState(prefs, chapters);
  }, [prefs]);

  useEffect(() => {
    if (prefs.viewMode === "analytic") {
      loadStrongsDictionary().catch(() => {});
    }
  }, [prefs.viewMode]);

  const loadText = useCallback(async () => {
    const generation = ++loadGen.current;
    setLoading(true);
    setError(null);

    try {
      const rows = await loadParallelVerses(
        prefs.book,
        view.chapterStart,
        view.chapterEnd,
        view.columns,
      );
      if (generation !== loadGen.current) return;
      setVerses(rows);
    } catch (err) {
      if (generation !== loadGen.current) return;
      setError(err instanceof Error ? err.message : "Failed to load text.");
      setVerses([]);
    } finally {
      if (generation === loadGen.current) setLoading(false);
    }
  }, [prefs.book, view]);

  useEffect(() => {
    loadText();
  }, [loadText]);

  useHeaderOffset(!!error);

  return (
    <div className="app">
      <Toolbar prefs={prefs} loading={loading} onUpdate={update} />

      {error && <p className="error-banner">{error}</p>}

      <main className={`reader ${loading ? "reader--loading" : ""}`}>
        {loading && verses.length === 0 && (
          <p className="loading-state">Loading {prefs.book}…</p>
        )}
        {verses.length > 0 && (
          <ParallelView
            verses={verses}
            prefs={prefs}
            view={view}
            notes={notes}
            onNoteChange={setNote}
          />
        )}
      </main>
    </div>
  );
}

export default App;