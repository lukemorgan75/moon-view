import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GodNamesView } from "./components/GodNamesView.tsx";
import { InfoView } from "./components/InfoView.tsx";
import { SplashGate } from "./components/SplashScreen.tsx";
import { parseRoute } from "./utils/app-routing";

function Root() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const route = parseRoute(hash);

  if (route === "info") return <InfoView />;
  if (route === "god-names") return <GodNamesView />;

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SplashGate>
      <Root />
    </SplashGate>
  </StrictMode>,
);