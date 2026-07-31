import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CorpusHome } from "./components/CorpusHome.tsx";
import { InfoView } from "./components/InfoView.tsx";
import { RevelationView } from "./components/RevelationView.tsx";
import { SplashGate } from "./components/SplashScreen.tsx";
import { parseRoute } from "./utils/app-routing";

function applyStoredTheme(): void {
  try {
    const raw =
      localStorage.getItem("moon-view-prefs") ??
      localStorage.getItem("moon-view-torah-prefs");
    if (!raw) return;
    const saved = JSON.parse(raw) as { theme?: string };
    if (saved.theme === "papyrus" || saved.theme === "dark") {
      document.documentElement.dataset.theme = saved.theme;
    }
  } catch {
    /* ignore */
  }
}

function Root() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    applyStoredTheme();
  }, []);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    // replaceState does not fire hashchange; popstate covers back/forward to
    // entries that used pushState. Hash links still use hashchange.
    window.addEventListener("popstate", onHash);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onHash);
    };
  }, []);

  const parsed = parseRoute(hash);
  const { route, corpus } = parsed;

  if (route === "info") return <InfoView />;
  if (route === "revelation") {
    return (
      <RevelationView
        urlChapter={parsed.chapter}
        urlVerse={parsed.verse}
      />
    );
  }
  if (route === "reader" && corpus) {
    return (
      <App
        corpus={corpus}
        urlBook={parsed.book}
        urlChapter={parsed.chapter}
        urlVerse={parsed.verse}
        urlCol={parsed.col}
        urlMode={parsed.mode}
        urlEng={parsed.eng}
      />
    );
  }
  return <CorpusHome />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SplashGate>
      <Root />
    </SplashGate>
  </StrictMode>,
);
