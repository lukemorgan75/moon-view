import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadParallelVerses } from "./api/bible";
import {
  booksForCorpus,
  defaultBookForCorpus,
  getBookMeta,
  type Corpus,
} from "./api/book-meta";
import { loadHebrewNameDictionary } from "./api/hebrew-names";
import { loadStrongsDictionaries } from "./api/strongs";
import { ParallelView } from "./components/ParallelView";
import { Toolbar } from "./components/Toolbar";
import { useHeaderOffset } from "./hooks/useHeaderOffset";
import { useNotes } from "./hooks/useNotes";
import { usePreferences } from "./hooks/usePreferences";
import { deriveViewState, type VerseRow, type ViewerPreferences } from "./types";

interface AppProps {
  corpus: Corpus;
}

function resolvePrefsForCorpus(
  prefs: ViewerPreferences,
  corpus: Corpus,
): ViewerPreferences {
  if (prefs.corpus === corpus && booksForCorpus(corpus).includes(prefs.book)) {
    return prefs;
  }
  const book =
    prefs.lastBookByCorpus[corpus] ?? defaultBookForCorpus(corpus);
  const chapter = prefs.lastChapterByCorpus[corpus] ?? 1;
  return {
    ...prefs,
    corpus,
    book,
    chapter,
  };
}

function App({ corpus }: AppProps) {
  const { prefs: storedPrefs, update } = usePreferences();
  const prefs = useMemo(
    () => resolvePrefsForCorpus(storedPrefs, corpus),
    [storedPrefs, corpus],
  );
  const { notes, setNote } = useNotes(prefs.book);
  const [verses, setVerses] = useState<VerseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadGen = useRef(0);

  // Persist route corpus (and restored book) into preferences.
  useEffect(() => {
    if (
      storedPrefs.corpus !== corpus ||
      storedPrefs.book !== prefs.book ||
      storedPrefs.chapter !== prefs.chapter
    ) {
      update({
        corpus,
        book: prefs.book,
        chapter: prefs.chapter,
      });
    }
  }, [
    corpus,
    prefs.book,
    prefs.chapter,
    storedPrefs.corpus,
    storedPrefs.book,
    storedPrefs.chapter,
    update,
  ]);

  const view = useMemo(() => {
    try {
      const { chapters } = getBookMeta(prefs.book);
      return deriveViewState(prefs, chapters);
    } catch {
      return deriveViewState(prefs, 1);
    }
  }, [prefs]);

  useEffect(() => {
    if (prefs.viewMode !== "analytic") return;
    const lang = getBookMeta(prefs.book).sourceLanguage;
    loadStrongsDictionaries(lang).catch(() => {});
    if (lang === "hebrew") {
      loadHebrewNameDictionary().catch(() => {});
    }
  }, [prefs.viewMode, prefs.book]);

  const loadText = useCallback(async () => {
    const generation = ++loadGen.current;
    setLoading(true);
    setError(null);

    try {
      const { chapters } = getBookMeta(prefs.book);
      const viewState = deriveViewState(prefs, chapters);
      const rows = await loadParallelVerses(
        prefs.book,
        viewState.chapterStart,
        viewState.chapterEnd,
        viewState.columns,
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
  }, [prefs]);

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
            contentReady={!loading}
          />
        )}
      </main>
    </div>
  );
}

export default App;
