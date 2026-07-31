import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadParallelVerses } from "./api/bible";
import {
  booksForCorpus,
  clampChapter,
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
import {
  deriveViewState,
  type EnglishVersion,
  type NaturalEnglishVersion,
  type VerseRow,
  type ViewMode,
  type ViewerPreferences,
} from "./types";
import { readerHref, replaceAppHash } from "./utils/app-routing";

interface AppProps {
  corpus: Corpus;
  /** Deep-link book from the hash (canonical display name). */
  urlBook?: string;
  urlChapter?: number;
  urlVerse?: number;
  /** Natural-mode single-column focus (`?col=kjv`). */
  urlCol?: EnglishVersion;
  urlMode?: ViewMode;
  urlEng?: NaturalEnglishVersion;
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

function routeKey(
  corpus: Corpus,
  book?: string,
  chapter?: number,
  verse?: number,
  col?: EnglishVersion,
  mode?: ViewMode,
  eng?: NaturalEnglishVersion,
): string {
  return `${corpus}|${book ?? ""}|${chapter ?? ""}|${verse ?? ""}|${col ?? ""}|${mode ?? ""}|${eng ?? ""}`;
}

function App({
  corpus,
  urlBook,
  urlChapter,
  urlVerse,
  urlCol,
  urlMode,
  urlEng,
}: AppProps) {
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

  // Column focus is URL-backed (Speechify needs KJV-only layout in the address bar).
  const [focusedVersion, setFocusedVersion] = useState<EnglishVersion | null>(
    () => urlCol ?? null,
  );

  // Apply deep-link place when the hash route changes (not on our own replaceState).
  const deepLinkKey = routeKey(
    corpus,
    urlBook,
    urlChapter,
    urlVerse,
    urlCol,
    urlMode,
    urlEng,
  );
  const lastDeepLinkKey = useRef<string | null>(null);
  useEffect(() => {
    if (lastDeepLinkKey.current === deepLinkKey) return;
    lastDeepLinkKey.current = deepLinkKey;

    const patch: Partial<ViewerPreferences> = {};
    if (urlBook) {
      patch.corpus = corpus;
      patch.book = urlBook;
      if (urlChapter != null) patch.chapter = urlChapter;
    } else if (storedPrefs.corpus !== corpus) {
      patch.corpus = corpus;
    }

    if (urlMode === "natural" || urlMode === "analytic") {
      patch.viewMode = urlMode;
    }
    if (urlCol) {
      // Column focus only applies in continuous natural mode.
      patch.viewMode = "natural";
      if (urlCol === "kjv") patch.naturalEnglish = "kjv";
      if (urlCol === "jps") patch.naturalEnglish = "jps";
    }
    if (urlEng === "kjv" || urlEng === "jps") {
      patch.naturalEnglish = urlEng;
    }

    if (Object.keys(patch).length > 0) update(patch);
    setFocusedVersion(urlCol ?? null);
  }, [
    deepLinkKey,
    corpus,
    urlBook,
    urlChapter,
    urlCol,
    urlMode,
    urlEng,
    storedPrefs.corpus,
    update,
  ]);

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

  // Keep the address bar aligned with reading place + column focus.
  useEffect(() => {
    const verseForUrl =
      urlVerse != null &&
      urlBook === prefs.book &&
      (urlChapter == null || urlChapter === prefs.chapter)
        ? urlVerse
        : undefined;

    // Always encode mode; encode col when single-column focus is active;
    // encode eng for Torah so KJV/JPS choice is shareable.
    const href = readerHref(
      prefs.corpus,
      prefs.book,
      clampChapter(prefs.book, prefs.chapter),
      verseForUrl,
      {
        col: focusedVersion ?? undefined,
        mode: prefs.viewMode,
        eng: prefs.corpus === "torah" ? prefs.naturalEnglish : undefined,
      },
    );
    replaceAppHash(href);
  }, [
    prefs.corpus,
    prefs.book,
    prefs.chapter,
    prefs.viewMode,
    prefs.naturalEnglish,
    focusedVersion,
    urlBook,
    urlChapter,
    urlVerse,
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

  // Clear column focus when leaving natural mode (matches prior ParallelView behavior).
  useEffect(() => {
    if (prefs.viewMode !== "natural" && focusedVersion) {
      setFocusedVersion(null);
    }
  }, [prefs.viewMode, focusedVersion]);

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

  // Scroll target from deep link only while book/chapter still match the URL intent.
  const focusVerseKey =
    urlBook != null &&
    urlBook === prefs.book &&
    urlChapter != null &&
    urlChapter === prefs.chapter
      ? `${prefs.chapter}:${urlVerse != null && urlVerse >= 1 ? urlVerse : 1}`
      : null;

  return (
    <div className="app">
      <Toolbar
        prefs={prefs}
        loading={loading}
        onUpdate={update}
        focusedVersion={focusedVersion}
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
            view={view}
            notes={notes}
            onNoteChange={setNote}
            contentReady={!loading}
            focusVerseKey={focusVerseKey}
            focusedVersion={focusedVersion}
            onFocusedVersionChange={setFocusedVersion}
          />
        )}
      </main>
    </div>
  );
}

export default App;
