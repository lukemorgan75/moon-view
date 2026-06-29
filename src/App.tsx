import { useCallback, useEffect, useRef, useState } from "react";
import { loadParallelVerses } from "./api/bible";
import { loadStrongsDictionary } from "./api/strongs";
import { ParallelView } from "./components/ParallelView";
import { Toolbar } from "./components/Toolbar";
import { useAutoCollapseToolbar } from "./hooks/useAutoCollapseToolbar";
import { useHeaderOffset } from "./hooks/useHeaderOffset";
import { useNotes } from "./hooks/useNotes";
import { usePreferences } from "./hooks/usePreferences";
import type { VerseRow } from "./types";

function App() {
  const { prefs, update, toggleColumn } = usePreferences();
  const { notes, setNote } = useNotes(prefs.book);
  const [verses, setVerses] = useState<VerseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadGen = useRef(0);

  useEffect(() => {
    if (prefs.columns.hebrew) {
      loadStrongsDictionary().catch(() => {});
    }
  }, [prefs.columns.hebrew]);

  const loadText = useCallback(async () => {
    if (prefs.chapterStart < 1 || prefs.chapterEnd < prefs.chapterStart) {
      setError("Invalid chapter range.");
      return;
    }

    const generation = ++loadGen.current;
    setLoading(true);
    setError(null);

    try {
      const rows = await loadParallelVerses(
        prefs.book,
        prefs.chapterStart,
        prefs.chapterEnd,
        prefs.columns,
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
  }, [prefs.book, prefs.chapterStart, prefs.chapterEnd, prefs.columns]);

  useEffect(() => {
    loadText();
  }, [loadText]);

  const collapseToolbar = useCallback(() => {
    update({ toolbarExpanded: false });
  }, [update]);

  useAutoCollapseToolbar(prefs.toolbarExpanded, collapseToolbar);
  useHeaderOffset(!!error);

  return (
    <div className="app">
      <Toolbar
        prefs={prefs}
        loading={loading}
        verseCount={verses.length}
        onUpdate={update}
        onToggleColumn={toggleColumn}
        onReload={loadText}
      />

      {error && <p className="error-banner">{error}</p>}

      <main className={`reader ${loading ? "reader--loading" : ""}`}>
        {loading && verses.length === 0 && (
          <p className="loading-state">Loading {prefs.book}…</p>
        )}
        {verses.length > 0 && (
          <ParallelView
            verses={verses}
            prefs={prefs}
            notes={notes}
            onNoteChange={setNote}
            onUpdate={update}
          />
        )}
      </main>
    </div>
  );
}

export default App;