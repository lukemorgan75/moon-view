import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(ROOT, "../public/data");

const ROOT_STRONGS = {
  bara: "1254",
  asah: "6213",
  toledot: "8435",
  qadash: "6942",
};

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "of", "to", "in", "on", "at", "by", "for", "with",
  "from", "as", "be", "is", "was", "were", "are", "it", "its", "he", "she", "they",
  "them", "his", "her", "their", "this", "that", "which", "who", "whom", "not", "no",
  "so", "if", "but", "into", "upon", "over", "under", "all", "every", "shall", "will",
  "would", "has", "had", "have", "having", "said", "let", "there", "then", "when",
  "where", "also", "even", "only", "one", "two",
]);

function normalizeToken(token) {
  return token.toLowerCase().replace(/[^a-z']/g, "");
}

function extractGlossWords(text) {
  return text
    .toLowerCase()
    .split(/[^a-z']+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

function glossTerms(entry, version = "ylt") {
  if (!entry) return [];
  if (/unrepresented in english/i.test(entry.kjv ?? "")) return [];

  const terms = new Set();
  const limit = 24;
  const ingest = (text) => {
    for (const word of extractGlossWords(text)) {
      terms.add(word);
      if (terms.size >= limit) return;
    }
    for (const chunk of text.split(/[,;]/)) {
      for (const word of extractGlossWords(chunk)) {
        terms.add(word);
        if (terms.size >= limit) return;
      }
    }
  };

  if (version === "kjv") {
    ingest(entry.kjv ?? "");
    ingest((entry.def ?? "").split(/[;.]/)[0] ?? "");
  } else {
    ingest((entry.def ?? "").split(/[;.]/)[0] ?? "");
    ingest(entry.def ?? "");
    ingest(entry.kjv ?? "");
  }

  return [...terms];
}

function termsMatch(token, terms) {
  const norm = normalizeToken(token);
  if (!norm) return false;
  for (const term of terms) {
    if (norm === term) return true;
    if (norm.length >= 4 && term.length >= 4) {
      if (norm.startsWith(term) || term.startsWith(norm)) return true;
    }
  }
  return false;
}

function tokenizeEnglishVerse(text) {
  const tokens = [];
  const re = /[A-Za-z']+|\s+|[^A-Za-z'\s]+/g;
  let match;
  let wordIndex = 0;
  while ((match = re.exec(text)) !== null) {
    const part = match[0];
    if (/[A-Za-z']+/.test(part)) {
      tokens.push({ type: "word", text: part, wordIndex: wordIndex++ });
    } else if (/^\s+$/.test(part)) {
      tokens.push({ type: "space", text: part });
    } else {
      tokens.push({ type: "punct", text: part });
    }
  }
  return tokens;
}

function alignMorphToEnglish(morph, englishText, strongs, version = "ylt") {
  const tokens = tokenizeEnglishVerse(englishText);
  const wordTokens = tokens.filter((t) => t.type === "word");
  const alignments = morph.map(() => []);
  let cursor = 0;

  for (let hi = 0; hi < morph.length; hi++) {
    const key = morph[hi].s?.replace(/^H/i, "") ?? "";
    const entry = strongs[`H${key}`] ?? strongs[key];
    const terms = glossTerms(entry, version);
    if (!terms.length) continue;

    const sequential = [];
    for (let ji = cursor; ji < wordTokens.length; ji++) {
      if (termsMatch(wordTokens[ji].text, terms)) sequential.push(ji);
    }

    let picked = [];
    if (sequential.length === 1) {
      picked = sequential;
      cursor = sequential[0] + 1;
    } else if (sequential.length > 1) {
      picked = [sequential[0]];
      cursor = sequential[0] + 1;
    } else {
      const anywhere = wordTokens
        .map((t, ji) => (termsMatch(t.text, terms) ? ji : -1))
        .filter((ji) => ji >= 0);
      if (anywhere.length === 1) picked = anywhere;
      else if (anywhere.length > 1) {
        const after = anywhere.filter((ji) => ji >= cursor);
        picked = after.length ? [after[0]] : [anywhere[0]];
        cursor = picked[0] + 1;
      }
    }

    alignments[hi] = picked;
  }

  return alignments;
}

function strongsForEnglishIndex(morph, align, englishIndex) {
  const strongs = new Set();
  align.forEach((englishIndices, hi) => {
    if (englishIndices.includes(englishIndex)) strongs.add(morph[hi].s);
  });
  return [...strongs];
}

function rootForStrongs(strongsList) {
  for (const strong of strongsList) {
    const key = String(strong).replace(/^H/i, "");
    for (const [root, code] of Object.entries(ROOT_STRONGS)) {
      if (key === code) return root;
    }
  }
  return null;
}

const DIVINE_PLACEHOLDER_START = "\uE000";
const DIVINE_PLACEHOLDER_END = "\uE001";

const DIVINE_PRE_MAP = [
  [/\bJehovah[\s-]Jireh\b/gi, "YHWH Yireh"],
  [/\bLiving One,\s*my beholder\b/gi, "El Roi"],
  [/\bGod,\s*my beholder\b/gi, "El Roi"],
  [/\bGod Most High\b/gi, "El Elyon"],
  [/\bGod Almighty\b/gi, "El Shaddai"],
  [/\bGod age-during\b/gi, "El Olam"],
  [/\bJehovah God\b/gi, "YHWH Elohim"],
  [/\bLord Jehovah\b/g, "Adonai YHWH"],
  [/\bLord God\b/g, "Adonai Elohim"],
  [/\bJehovah's\b/gi, "Jehovah's"],
  [/\bJehovah\b/gi, "Jehovah"],
  [/\bGod's\b/gi, "God's"],
  [/\bGod\b/gi, "God"],
  [/\bLord's\b/g, "Lord's"],
  [/\bLord\b/g, "Lord"],
];

function cleanYltSource(text) {
  return text.replace(/<\s*\/?\s*F\s*I\s*>/gi, "").replace(/`/g, "'");
}

function placeholderPattern() {
  return new RegExp(
    `${DIVINE_PLACEHOLDER_START}(\\d+)${DIVINE_PLACEHOLDER_END}`,
    "g",
  );
}

function markYltDivinePhrases(text) {
  const replacements = [];
  let out = text;
  for (const [pattern] of DIVINE_PRE_MAP) {
    out = out.replace(pattern, (match) => {
      const index = replacements.length;
      replacements.push({ display: match, original: match });
      return `${DIVINE_PLACEHOLDER_START}${index}${DIVINE_PLACEHOLDER_END}`;
    });
  }
  return { text: out, replacements };
}

function restoreYltDivinePhrases(text, replacements) {
  return text.replace(placeholderPattern(), (_match, indexText) => {
    const entry = replacements[Number(indexText)];
    return entry?.original ?? "";
  });
}

function transformOutsidePlaceholders(text, transform) {
  const pattern = placeholderPattern();
  let result = "";
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    result += transform(text.slice(lastIndex, match.index));
    result += match[0];
    lastIndex = match.index + match[0].length;
  }
  result += transform(text.slice(lastIndex));
  return result;
}

/** Match natural-mode YLT prose in the Word doc (lowercase, divine titles preserved). */
function formatYltNaturalPlain(text) {
  const cleaned = cleanYltSource(text);
  const { text: marked, replacements } = markYltDivinePhrases(cleaned);
  let working = transformOutsidePlaceholders(marked, (segment) =>
    segment
      .replace(/[`"]/g, "")
      .replace(/[.,;:!?()[\]{}—–-]/g, " ")
      .replace(/\s+/g, " ")
      .toLowerCase(),
  );
  working = working.trim().replace(/\s+/g, " ");
  return restoreYltDivinePhrases(working, replacements);
}

function verseKeys(obj) {
  return Object.keys(obj).sort((a, b) => {
    const [ac, av] = a.split(":").map(Number);
    const [bc, bv] = b.split(":").map(Number);
    return ac - bc || av - bv;
  });
}

const ylt = JSON.parse(
  fs.readFileSync(path.join(DATA, "bibles/ylt/Genesis.json"), "utf8"),
);
const morph = JSON.parse(
  fs.readFileSync(path.join(DATA, "morph/Gen.json"), "utf8"),
);
const strongs = JSON.parse(
  fs.readFileSync(path.join(DATA, "strongs-hebrew.json"), "utf8"),
);

const verses = [];

for (const key of verseKeys(ylt)) {
  const raw = ylt[key];
  const words = morph[key];
  if (!raw || !words?.length) continue;

  const plain = formatYltNaturalPlain(raw);
  const align = alignMorphToEnglish(words, plain, strongs, "ylt");
  const tokens = tokenizeEnglishVerse(plain);
  const verseWords = [];

  for (const token of tokens) {
    if (token.type !== "word" || token.wordIndex == null) continue;
    const root = rootForStrongs(
      strongsForEnglishIndex(words, align, token.wordIndex),
    );
    verseWords.push({ text: token.text, root });
  }

  verses.push({ key, words: verseWords });
}

const outPath = process.argv[2];
if (!outPath) {
  console.error("Usage: node export-ylt-root-highlights.mjs <output.json>");
  process.exit(1);
}

const counts = verses
  .flatMap((verse) => verse.words)
  .reduce((acc, item) => {
    if (item.root) acc[item.root] = (acc[item.root] ?? 0) + 1;
    return acc;
  }, {});

fs.writeFileSync(outPath, JSON.stringify({ verses }));
console.log(
  JSON.stringify({ verseCount: verses.length, wordCount: counts, counts }, null, 2),
);