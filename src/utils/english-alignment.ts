import type { SourceLanguage } from "../api/book-meta";
import {
  lookupStrongs,
  type StrongsDictionaries,
  type StrongsEntry,
} from "../api/strongs";
import type { EnglishVersion, MorphWord } from "../types";

export interface EnglishToken {
  type: "word" | "space" | "punct";
  text: string;
  wordIndex?: number;
}

export type AlignableEnglishVersion = Extract<EnglishVersion, "ylt" | "kjv">;

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "of",
  "to",
  "in",
  "on",
  "at",
  "by",
  "for",
  "with",
  "from",
  "as",
  "be",
  "is",
  "was",
  "were",
  "are",
  "it",
  "its",
  "he",
  "she",
  "they",
  "them",
  "his",
  "her",
  "their",
  "this",
  "that",
  "which",
  "who",
  "whom",
  "not",
  "no",
  "so",
  "if",
  "but",
  "into",
  "upon",
  "over",
  "under",
  "all",
  "every",
  "shall",
  "will",
  "would",
  "has",
  "had",
  "have",
  "having",
  "said",
  "let",
  "there",
  "then",
  "when",
  "where",
  "also",
  "even",
  "only",
  "one",
  "two",
  "three",
  "being",
  "according",
  "idiom",
  "phrase",
]);

const VARIANTS: Record<string, string[]> = {
  god: ["god", "gods", "divine"],
  heaven: ["heaven", "heavens", "sky"],
  earth: ["earth", "land", "ground"],
  sea: ["sea", "seas", "water", "waters"],
  water: ["water", "waters"],
  light: ["light", "lights"],
  day: ["day", "days"],
  night: ["night", "nights"],
  man: ["man", "men", "humankind", "human", "humans"],
  woman: ["woman", "women", "female"],
  male: ["male"],
  female: ["female"],
  beginning: ["beginning", "began", "begin"],
  create: ["create", "created", "creates", "creating"],
  make: ["make", "made", "makes", "making"],
  give: ["give", "gave", "given", "gives"],
  bring: ["bring", "brought", "brings"],
  call: ["call", "called", "calls", "named"],
  see: ["see", "saw", "seen", "sees"],
  say: ["say", "said", "says", "speak", "spoke"],
  rule: ["rule", "rules", "dominate", "dominates", "master"],
  fill: ["fill", "filled", "fills"],
  increase: ["increase", "increases", "fertile", "multiply"],
  beast: ["beast", "beasts", "animal", "animals"],
  bird: ["bird", "birds", "fowl"],
  fish: ["fish", "fishes"],
  tree: ["tree", "trees"],
  star: ["star", "stars"],
  sun: ["sun"],
  moon: ["moon"],
  wind: ["wind", "winds", "windy", "spirit", "spiritual", "breath", "blast", "tempest"],
  spirit: ["spirit", "spiritual", "wind", "breath", "blast"],
  breath: ["breath", "wind", "spirit", "blast"],
  blast: ["blast", "wind", "spirit", "tempest"],
  tempest: ["tempest", "wind", "storm"],
  darkness: ["darkness", "dark"],
  dark: ["dark", "darkness"],
  deep: ["deep", "depth", "abyss"],
  depth: ["depth", "deep"],
  void: ["void", "empty", "emptiness", "unformed", "formless"],
  form: ["form", "formless", "unformed", "without"],
  face: ["face", "surface"],
  move: ["move", "moved", "moving", "flutter", "fluttered", "fluttering", "hover", "hovered", "sweep", "sweeping", "swept"],
  flutter: ["flutter", "fluttered", "move", "moved", "hover", "sweep", "sweeping"],
  sweep: ["sweep", "sweeping", "swept", "move", "moved"],
};

function normalizeToken(word: string): string {
  return word
    .toLowerCase()
    .replace(/^['"]+|['"]+$/g, "")
    .replace(/['']s$/, "");
}

function cleanGlossText(text: string): string {
  return text
    .replace(/\[idiom\]/gi, " ")
    .replace(/\[phrase\]/gi, " ")
    .replace(/\{[^}]*\}/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/compare[^.]*\.?/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pull lemma-like tokens from Strong's gloss strings, including spirit(-ual) forms. */
function extractGlossWords(text: string): string[] {
  const cleaned = cleanGlossText(text);
  const words: string[] = [];
  const re = /[A-Za-z][A-Za-z'()-]*/g;

  for (const token of cleaned.match(re) ?? []) {
    const base = token.replace(/\(-?[A-Za-z]+\)/g, "").replace(/[^A-Za-z]/g, "");
    if (base.length >= 2) words.push(base);

    const suffix = token.match(/\(-([A-Za-z]+)\)/);
    if (suffix && suffix[1].length >= 2) words.push(suffix[1]);

    const prefix = token.match(/\(([A-Za-z]+)-\)/);
    if (prefix && prefix[1].length >= 2) words.push(prefix[1]);
  }

  return words;
}

function addTerm(terms: Set<string>, word: string): void {
  const norm = normalizeToken(word);
  if (norm.length < 2 || STOPWORDS.has(norm)) return;
  terms.add(norm);
  const variants = VARIANTS[norm];
  if (variants) variants.forEach((v) => terms.add(v));
}

function glossTerms(
  entry: StrongsEntry | null,
  version: AlignableEnglishVersion,
): string[] {
  if (!entry) return [];
  if (/unrepresented in english/i.test(entry.kjv)) return [];

  const terms = new Set<string>();
  const limit = 24;

  const ingest = (text: string) => {
    for (const word of extractGlossWords(text)) {
      addTerm(terms, word);
      if (terms.size >= limit) return;
    }
    for (const chunk of text.split(/[,;]/)) {
      for (const word of extractGlossWords(chunk)) {
        addTerm(terms, word);
        if (terms.size >= limit) return;
      }
    }
  };

  if (version === "kjv") {
    ingest(entry.kjv);
    ingest(entry.def.split(/[;.]/)[0] ?? "");
  } else {
    ingest(entry.def.split(/[;.]/)[0] ?? "");
    ingest(entry.def);
    ingest(entry.kjv);
  }

  return [...terms];
}

function termsMatch(token: string, terms: string[]): boolean {
  const norm = normalizeToken(token);
  if (!norm) return false;

  for (const term of terms) {
    if (norm === term) return true;
    if (norm.length >= 4 && term.length >= 4) {
      if (norm.startsWith(term) || term.startsWith(norm)) return true;
    }
    const variants = VARIANTS[term];
    if (variants?.includes(norm)) return true;
  }
  return false;
}

export function tokenizeEnglishVerse(text: string): EnglishToken[] {
  const tokens: EnglishToken[] = [];
  const re = /[A-Za-z']+|\s+|[^A-Za-z'\s]+/g;
  let match: RegExpExecArray | null;
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

/** Hebrew word index → English word indices in the same verse. */
export function alignMorphToEnglish(
  morph: MorphWord[],
  englishText: string,
  strongs: StrongsDictionaries,
  sourceLang: SourceLanguage,
  version: AlignableEnglishVersion,
): number[][] {
  const tokens = tokenizeEnglishVerse(englishText);
  const wordTokens = tokens.filter(
    (t): t is EnglishToken & { wordIndex: number } => t.type === "word",
  );
  const alignments: number[][] = morph.map(() => []);
  let cursor = 0;

  for (let hi = 0; hi < morph.length; hi++) {
    const terms = glossTerms(
      lookupStrongs(strongs, morph[hi].s, sourceLang),
      version,
    );
    if (!terms.length) continue;

    const sequential: number[] = [];
    for (let ji = cursor; ji < wordTokens.length; ji++) {
      if (termsMatch(wordTokens[ji].text, terms)) sequential.push(ji);
    }

    let picked: number[] = [];
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
      if (anywhere.length === 1) {
        picked = anywhere;
      } else if (anywhere.length > 1) {
        const after = anywhere.filter((ji) => ji >= cursor);
        picked = after.length ? [after[0]] : [anywhere[0]];
        cursor = picked[0] + 1;
      }
    }

    alignments[hi] = picked;
  }

  return alignments;
}

export function hebrewIndicesForEnglishIndex(
  align: number[][],
  englishIndex: number,
): number[] {
  const indices: number[] = [];
  align.forEach((englishIndices, hi) => {
    if (englishIndices.includes(englishIndex)) indices.push(hi);
  });
  return indices;
}

export function strongsForEnglishIndex(
  morph: MorphWord[],
  align: number[][],
  englishIndex: number,
): string[] {
  const strongs = new Set<string>();
  for (const hi of hebrewIndicesForEnglishIndex(align, englishIndex)) {
    strongs.add(morph[hi].s);
  }
  return [...strongs];
}

export function buildEnglishAlignments(
  morph: MorphWord[],
  english: Partial<Record<EnglishVersion, string>>,
  strongs: StrongsDictionaries,
  sourceLang: SourceLanguage,
): Partial<Record<AlignableEnglishVersion, number[][]>> {
  const result: Partial<Record<AlignableEnglishVersion, number[][]>> = {};
  if (english.ylt) {
    result.ylt = alignMorphToEnglish(morph, english.ylt, strongs, sourceLang, "ylt");
  }
  if (english.kjv) {
    result.kjv = alignMorphToEnglish(morph, english.kjv, strongs, sourceLang, "kjv");
  }
  return result;
}