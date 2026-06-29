import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { FigureDictionaryView } from "./components/FigureDictionaryView.tsx";
import { InfoView } from "./components/InfoView.tsx";
import { isInfoView } from "./utils/app-routing";
import { isFigureDictionaryView } from "./utils/figure-routing";

function Root() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (isInfoView(hash)) {
    return <InfoView />;
  }
  if (isFigureDictionaryView(hash)) {
    return <FigureDictionaryView hash={hash} />;
  }
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);