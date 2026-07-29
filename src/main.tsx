import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CorpusHome } from "./components/CorpusHome.tsx";
import { InfoView } from "./components/InfoView.tsx";
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
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const { route, corpus } = parseRoute(hash);

  if (route === "info") return <InfoView />;
  if (route === "reader" && corpus) return <App corpus={corpus} />;
  return <CorpusHome />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SplashGate>
      <Root />
    </SplashGate>
  </StrictMode>,
);
