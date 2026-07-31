import { englishVersionLabel } from "../api/english-columns";
import { loadNarrativeBook } from "../api/bible";
import type { EnglishVersion } from "../types";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Open a print-ready narrative document and trigger the browser print dialog.
 * Choose “Save as PDF” to download — preserves system fonts (SF Pro / elegant
 * body type matching Moon View natural prose).
 */
export async function downloadNarrativeBookPdf(
  book: string,
  version: EnglishVersion,
): Promise<void> {
  const { paragraphs } = await loadNarrativeBook(book, version);
  const versionLabel = englishVersionLabel(version);
  const title = `${book} (${englishVersionShort(version)})`;

  const body = paragraphs
    .map((p) => `    <p>${escapeHtml(p)}</p>`)
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} · Moon View</title>
  <style>
    @page {
      margin: 0.85in 0.9in;
    }
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0.5rem 0 2rem;
      color: #1a1a1a;
      background: #fff;
      /* Match Moon View body / natural prose */
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
        "Segoe UI", system-ui, sans-serif;
      font-size: 11.5pt;
      font-weight: 400;
      line-height: 1.58;
      letter-spacing: -0.022em;
      -webkit-font-smoothing: antialiased;
    }
    header {
      margin-bottom: 1.75rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid #e5e2dc;
    }
    h1 {
      margin: 0 0 0.25rem;
      font-size: 1.45rem;
      font-weight: 600;
      letter-spacing: -0.03em;
      line-height: 1.2;
    }
    .meta {
      margin: 0;
      font-size: 0.8rem;
      font-weight: 500;
      letter-spacing: 0.01em;
      color: #5c574f;
    }
    article p {
      margin: 0 0 1em;
      text-align: justify;
      text-justify: inter-word;
      hyphens: auto;
      orphans: 3;
      widows: 3;
    }
    article p:last-child {
      margin-bottom: 0;
    }
    @media print {
      body { padding: 0; }
      header {
        break-after: avoid;
      }
      a { color: inherit; text-decoration: none; }
    }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(book)}</h1>
    <p class="meta">${escapeHtml(versionLabel)} · Moon View</p>
  </header>
  <article>
${body}
  </article>
  <script>
    window.addEventListener("load", function () {
      setTimeout(function () {
        window.focus();
        window.print();
      }, 250);
    });
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    URL.revokeObjectURL(url);
    throw new Error(
      "Pop-up blocked. Allow pop-ups for Moon View to download the PDF.",
    );
  }
  // Revoke after the new document has had time to load.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function englishVersionShort(version: EnglishVersion): string {
  switch (version) {
    case "kjv":
      return "KJV";
    case "jps":
      return "JPS";
    case "ylt":
      return "YLT";
    case "esv":
      return "ESV";
    case "locke":
      return "Locke";
    default:
      return version;
  }
}
