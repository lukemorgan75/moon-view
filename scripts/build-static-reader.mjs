/**
 * Build plain HTML chapter/book pages so Speechify (and other URL importers)
 * can read verse text without running the SPA JavaScript.
 *
 * Output (under --out, default public/s):
 *   {corpus}/{book-slug}/{version}.html          full book
 *   {corpus}/{book-slug}/{chapter}/{version}.html one chapter
 *   revelation/{chapter}.html
 *   revelation.html
 *
 * Usage:
 *   node scripts/build-static-reader.mjs
 *   node scripts/build-static-reader.mjs --out dist/s
 *   GITHUB_PAGES=true node scripts/build-static-reader.mjs --out dist/s
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "public", "data", "bibles");

const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const OUT = path.resolve(
  ROOT,
  outIdx >= 0 && args[outIdx + 1] ? args[outIdx + 1] : "public/s",
);

const SITE_BASE =
  process.env.GITHUB_PAGES === "true" || process.env.GITHUB_PAGES === "1"
    ? "/moon-view/"
    : "/";

const TORAH = [
  ["Genesis", "Genesis.json", 50],
  ["Exodus", "Exodus.json", 40],
  ["Leviticus", "Leviticus.json", 27],
  ["Numbers", "Numbers.json", 36],
  ["Deuteronomy", "Deuteronomy.json", 34],
];

const PAUL = [
  ["Romans", "Romans.json", "Romans.json", 16],
  ["I Corinthians", "1Corinthians.json", "I Corinthians.json", 16],
  ["II Corinthians", "2Corinthians.json", "II Corinthians.json", 13],
  ["Galatians", "Galatians.json", "Galatians.json", 6],
  ["Ephesians", "Ephesians.json", "Ephesians.json", 6],
  ["Philippians", "Philippians.json", "Philippians.json", 4],
  ["Colossians", "Colossians.json", "Colossians.json", 4],
  ["I Thessalonians", "1Thessalonians.json", "I Thessalonians.json", 5],
  ["II Thessalonians", "2Thessalonians.json", "II Thessalonians.json", 3],
  ["I Timothy", "1Timothy.json", "I Timothy.json", 6],
  ["II Timothy", "2Timothy.json", "II Timothy.json", 4],
  ["Titus", "Titus.json", "Titus.json", 3],
  ["Philemon", "Philemon.json", "Philemon.json", 1],
];

const LOCKE_BOOKS = new Set([
  "Galatians",
  "I Corinthians",
  "II Corinthians",
  "Romans",
  "Ephesians",
]);

function bookToSlug(book) {
  return book
    .trim()
    .toLowerCase()
    .replace(/[._]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/** Normalize to Map chapterNum -> Array<{verse, text}> */
function loadKjvStyle(filePath) {
  const data = readJson(filePath);
  if (!data?.chapters) return null;
  const byChapter = new Map();
  for (const ch of data.chapters) {
    const n = Number(ch.chapter);
    const verses = (ch.verses || []).map((v) => ({
      verse: Number(v.verse),
      text: String(v.text || "").trim(),
    }));
    byChapter.set(n, verses);
  }
  return byChapter;
}

/** ESV / YLT style: { "1:1": "text", ... } */
function loadKeyStyle(filePath) {
  const data = readJson(filePath);
  if (!data || typeof data !== "object" || data.chapters) return null;
  const byChapter = new Map();
  for (const [key, text] of Object.entries(data)) {
    const m = /^(\d+):(\d+)$/.exec(key);
    if (!m) continue;
    const ch = Number(m[1]);
    const vs = Number(m[2]);
    if (!byChapter.has(ch)) byChapter.set(ch, []);
    byChapter.get(ch).push({ verse: vs, text: String(text || "").trim() });
  }
  for (const verses of byChapter.values()) {
    verses.sort((a, b) => a.verse - b.verse);
  }
  return byChapter;
}

function writeFile(relPath, contents) {
  const full = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents, "utf8");
}

function pageHtml({
  title,
  heading,
  versionLabel,
  interactiveHref,
  bodyHtml,
  description,
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index,follow" />
  <link rel="icon" href="${SITE_BASE}favicon.svg" type="image/svg+xml" />
  <style>
    :root { color-scheme: light dark; }
    body {
      margin: 0 auto;
      max-width: 42rem;
      padding: 1.25rem 1.1rem 3rem;
      font: 1.05rem/1.65 Georgia, "Times New Roman", serif;
      color: #1a1a1a;
      background: #faf8f5;
    }
    @media (prefers-color-scheme: dark) {
      body { color: #e8e6e3; background: #12151c; }
      a { color: #9ecbff; }
      .meta { color: #9a9590; }
      .verse-num { color: #8a8580; }
    }
    h1 { font-size: 1.45rem; line-height: 1.25; margin: 0 0 0.35rem; }
    h2 { font-size: 1.15rem; margin: 1.75rem 0 0.65rem; }
    .meta { font: 0.85rem/1.4 system-ui, sans-serif; color: #5c574f; margin: 0 0 1.25rem; }
    .meta a { margin-right: 0.75rem; }
    article p { margin: 0 0 0.65rem; }
    .verse-num {
      font: 0.75rem/1 system-ui, sans-serif;
      color: #6b6560;
      margin-right: 0.35rem;
      vertical-align: super;
    }
    .note {
      font: 0.8rem/1.4 system-ui, sans-serif;
      opacity: 0.85;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid color-mix(in srgb, currentColor 18%, transparent);
    }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(heading)}</h1>
    <p class="meta">
      <span>${escapeHtml(versionLabel)} · Moon View</span><br />
      <a href="${escapeHtml(interactiveHref)}">Open interactive reader</a>
      <a href="${SITE_BASE}">Home</a>
    </p>
  </header>
  <main>
    <article>
${bodyHtml}
    </article>
  </main>
  <p class="note">
    Plain-text page for screen readers and services like Speechify.
    Interactive study tools live in the Moon View app.
  </p>
</body>
</html>
`;
}

function versesToHtml(verses) {
  return verses
    .filter((v) => v.text)
    .map(
      (v) =>
        `      <p id="v${v.verse}"><span class="verse-num">${v.verse}</span>${escapeHtml(v.text)}</p>`,
    )
    .join("\n");
}

function chaptersToHtml(byChapter, onlyChapter = null) {
  const chapters = [...byChapter.keys()].sort((a, b) => a - b);
  const parts = [];
  for (const ch of chapters) {
    if (onlyChapter != null && ch !== onlyChapter) continue;
    const verses = byChapter.get(ch) || [];
    if (!verses.length) continue;
    parts.push(`      <section id="c${ch}">`);
    if (onlyChapter == null) {
      parts.push(`      <h2>Chapter ${ch}</h2>`);
    }
    parts.push(versesToHtml(verses));
    parts.push(`      </section>`);
  }
  return parts.join("\n");
}

function spaHash(corpus, book, chapter, version) {
  const slug = bookToSlug(book);
  const path =
    chapter != null
      ? `#${corpus}/${slug}/${chapter}`
      : `#${corpus}/${slug}`;
  const q = new URLSearchParams();
  if (version) q.set("col", version);
  q.set("mode", "natural");
  if (corpus === "torah" && (version === "kjv" || version === "jps")) {
    q.set("eng", version);
  }
  return `${SITE_BASE}${path}?${q.toString()}`;
}

function emitBookPages({
  corpus,
  book,
  version,
  versionLabel,
  byChapter,
}) {
  if (!byChapter || byChapter.size === 0) return 0;
  const slug = bookToSlug(book);
  let count = 0;

  // Full book
  const fullBody = chaptersToHtml(byChapter);
  if (fullBody.trim()) {
    writeFile(
      path.join(corpus, slug, `${version}.html`),
      pageHtml({
        title: `${book} (${versionLabel}) · Moon View`,
        heading: book,
        versionLabel,
        interactiveHref: spaHash(corpus, book, 1, version),
        bodyHtml: fullBody,
        description: `${book} in ${versionLabel}. Plain text for reading aloud.`,
      }),
    );
    count++;
  }

  for (const ch of byChapter.keys()) {
    const body = chaptersToHtml(byChapter, ch);
    if (!body.trim()) continue;
    writeFile(
      path.join(corpus, slug, String(ch), `${version}.html`),
      pageHtml({
        title: `${book} ${ch} (${versionLabel}) · Moon View`,
        heading: `${book} ${ch}`,
        versionLabel,
        interactiveHref: spaHash(corpus, book, ch, version),
        bodyHtml: body,
        description: `${book} chapter ${ch} in ${versionLabel}. Plain text for reading aloud.`,
      }),
    );
    count++;
  }
  return count;
}

function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  let pages = 0;

  // Torah: local ESV + YLT (KJV/JPS often remote — skip if missing)
  for (const [book, esvFile, chapterCount] of TORAH) {
    void chapterCount;
    const esv = loadKeyStyle(path.join(DATA, "esv", esvFile));
    pages += emitBookPages({
      corpus: "torah",
      book,
      version: "esv",
      versionLabel: "ESV",
      byChapter: esv,
    });
    const ylt = loadKeyStyle(path.join(DATA, "ylt", esvFile));
    pages += emitBookPages({
      corpus: "torah",
      book,
      version: "ylt",
      versionLabel: "YLT",
      byChapter: ylt,
    });
    // KJV if present under either name
    const kjv =
      loadKjvStyle(path.join(DATA, "kjv", esvFile)) ||
      loadKjvStyle(path.join(DATA, "kjv", `${book}.json`));
    pages += emitBookPages({
      corpus: "torah",
      book,
      version: "kjv",
      versionLabel: "KJV",
      byChapter: kjv,
    });
  }

  // Paul
  for (const [book, kjvFile, esvFile] of PAUL) {
    const kjv = loadKjvStyle(path.join(DATA, "kjv", kjvFile));
    pages += emitBookPages({
      corpus: "paul",
      book,
      version: "kjv",
      versionLabel: "KJV",
      byChapter: kjv,
    });
    const esv = loadKeyStyle(path.join(DATA, "esv", esvFile));
    pages += emitBookPages({
      corpus: "paul",
      book,
      version: "esv",
      versionLabel: "ESV",
      byChapter: esv,
    });
    if (LOCKE_BOOKS.has(book)) {
      const locke = loadKeyStyle(path.join(DATA, "locke", `${book}.json`));
      pages += emitBookPages({
        corpus: "paul",
        book,
        version: "locke",
        versionLabel: "Locke",
        byChapter: locke,
      });
    }
  }

  // Revelation (KJV)
  const rev = loadKjvStyle(path.join(DATA, "kjv", "Revelation.json"));
  if (rev) {
    const fullBody = chaptersToHtml(rev);
    writeFile(
      "revelation.html",
      pageHtml({
        title: "Revelation (KJV) · Moon View",
        heading: "Revelation",
        versionLabel: "KJV",
        interactiveHref: `${SITE_BASE}#revelation/1`,
        bodyHtml: fullBody,
        description: "Revelation in KJV. Plain text for reading aloud.",
      }),
    );
    pages++;
    for (const ch of rev.keys()) {
      const body = chaptersToHtml(rev, ch);
      if (!body.trim()) continue;
      writeFile(
        path.join("revelation", `${ch}.html`),
        pageHtml({
          title: `Revelation ${ch} (KJV) · Moon View`,
          heading: `Revelation ${ch}`,
          versionLabel: "KJV",
          interactiveHref: `${SITE_BASE}#revelation/${ch}`,
          bodyHtml: body,
          description: `Revelation chapter ${ch} in KJV. Plain text for reading aloud.`,
        }),
      );
      pages++;
    }
  }

  // Index for humans
  writeFile(
    "index.html",
    pageHtml({
      title: "Moon View · Listen pages",
      heading: "Moon View listen pages",
      versionLabel: "Plain HTML",
      interactiveHref: SITE_BASE,
      bodyHtml: `      <p>These pages are plain HTML exports of scripture text for tools that cannot run the interactive app (for example Speechify URL import).</p>
      <p>Example: <a href="${SITE_BASE}s/paul/i-thessalonians/1/esv.html">I Thessalonians 1 · ESV</a></p>
      <p>In the app, use <strong>Copy listen link</strong> to copy the matching URL for your current view.</p>`,
      description: "Index of Moon View plain-text listen pages.",
    }),
  );
  pages++;

  console.log(`Static reader: wrote ${pages} pages → ${path.relative(ROOT, OUT)} (base ${SITE_BASE})`);
}

main();
