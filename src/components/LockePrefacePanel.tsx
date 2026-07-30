import { useEffect, useState } from "react";
import {
  LOCKE_PREFACE_SOURCE_URL,
  loadLockePreface,
  type LockePrefaceData,
} from "../api/locke-preface";

export function LockePrefacePanel() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<LockePrefaceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || data) return;
    let cancelled = false;
    loadLockePreface()
      .then((preface) => {
        if (!cancelled) setData(preface);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load preface.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, data]);

  const sourceUrl = data?.source.url ?? LOCKE_PREFACE_SOURCE_URL;

  return (
    <div className="rev-rules locke-preface-panel">
      <button
        type="button"
        className="rev-rules-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="rev-rules-toggle-label">
          Locke&apos;s preface, excerpt
        </span>
        <span className="rev-rules-chevron" aria-hidden="true">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open && (
        <div className="rev-rules-body">
          <p className="rev-rules-source">
            From Locke&apos;s essay for understanding St. Paul&apos;s epistles
            by consulting St. Paul himself (prefixed to the Paraphrase). Reading
            text cleaned from OCR.{" "}
            <a
              className="rev-rules-source-link"
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open source on Internet Archive
            </a>
            .
          </p>

          {error && <p className="rev-pane-empty">{error}</p>}
          {!data && !error && (
            <p className="rev-pane-empty">Loading preface…</p>
          )}

          {data && (
            <div className="rev-intro-prose">
              {data.paragraphs.map((para, index) => (
                <p key={`locke-pref-${index}`}>{para}</p>
              ))}
              {data.incomplete !== false && (
                <p className="rev-incomplete-ellipsis" aria-hidden="true">
                  …
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
