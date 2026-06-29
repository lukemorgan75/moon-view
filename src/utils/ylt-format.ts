const DIVINE_PLACEHOLDER_START = "\uE000";
const DIVINE_PLACEHOLDER_END = "\uE001";

interface DivineReplacement {
  display: string;
  original: string;
}

/**
 * Seven primary divine names revealed in Genesis (YLT source → display form):
 * 1. Elohim      ← God
 * 2. YHWH        ← Jehovah
 * 3. El Elyon    ← God Most High
 * 4. El Shaddai  ← God Almighty
 * 5. El Olam     ← God age-during
 * 6. El Roi      ← Living One, my beholder / God, my beholder
 * 7. YHWH Yireh  ← Jehovah-Jireh
 *
 * Adonai ← Lord (divine address, case-sensitive) is also normalized.
 * Longer phrases must precede shorter ones in the list.
 */
const DIVINE_PRE_MAP: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bJehovah[\s-]Jireh\b/gi, "YHWH Yireh"],
  [/\bLiving One,\s*my beholder\b/gi, "El Roi"],
  [/\bGod,\s*my beholder\b/gi, "El Roi"],
  [/\bGod Most High\b/gi, "El Elyon"],
  [/\bGod Almighty\b/gi, "El Shaddai"],
  [/\bGod age-during\b/gi, "El Olam"],
  [/\bJehovah God\b/gi, "YHWH Elohim"],
  [/\bLord Jehovah\b/g, "Adonai YHWH"],
  [/\bLord God\b/g, "Adonai Elohim"],
  [/\bJehovah's\b/gi, "YHWH's"],
  [/\bJehovah\b/gi, "YHWH"],
  [/\bGod's\b/gi, "Elohim's"],
  [/\bGod\b/gi, "Elohim"],
  [/\bLord's\b/g, "Adonai's"],
  [/\bLord\b/g, "Adonai"],
];

const DIVINE_CAPITALIZE: ReadonlyArray<readonly [RegExp, string]> = [
  [/\byhwh yireh\b/gi, "YHWH Yireh"],
  [/\byhwh elohim\b/gi, "YHWH Elohim"],
  [/\badonai yhwh\b/gi, "Adonai YHWH"],
  [/\badonai elohim\b/gi, "Adonai Elohim"],
  [/\bel elyon\b/gi, "El Elyon"],
  [/\bel shaddai\b/gi, "El Shaddai"],
  [/\bel olam\b/gi, "El Olam"],
  [/\bel roi\b/gi, "El Roi"],
  [/\byhwh('s)?\b/gi, "YHWH$1"],
  [/\belohim('s)?\b/gi, "Elohim$1"],
  [/\badonai('s)?\b/gi, "Adonai$1"],
];

/** Human-readable map of Genesis divine-name substitutions (YLT → display). */
export const GENESIS_DIVINE_NAME_MAP: ReadonlyArray<{
  name: string;
  yltForms: readonly string[];
  display: string;
}> = [
  { name: "Elohim", yltForms: ["God", "God's"], display: "Elohim" },
  { name: "YHWH", yltForms: ["Jehovah", "Jehovah's"], display: "YHWH" },
  { name: "El Elyon", yltForms: ["God Most High"], display: "El Elyon" },
  { name: "El Shaddai", yltForms: ["God Almighty"], display: "El Shaddai" },
  { name: "El Olam", yltForms: ["God age-during"], display: "El Olam" },
  {
    name: "El Roi",
    yltForms: ["Living One, my beholder", "God, my beholder"],
    display: "El Roi",
  },
  {
    name: "YHWH Yireh",
    yltForms: ["Jehovah-Jireh", "Jehovah Jireh"],
    display: "YHWH Yireh",
  },
];

export interface YltDivineSubstitutionEntry {
  display: string;
  yltForms: readonly string[];
  note?: string;
}

/** Full substitution key for About page and reference (YLT English → display). */
export const YLT_DIVINE_SUBSTITUTION_KEY: readonly YltDivineSubstitutionEntry[] =
  [
    ...GENESIS_DIVINE_NAME_MAP.map((entry) => ({
      display: entry.display,
      yltForms: entry.yltForms,
      note:
        entry.name === entry.display
          ? "One of the seven primary divine names in Genesis"
          : undefined,
    })),
    {
      display: "YHWH Elohim",
      yltForms: ["Jehovah God"],
      note: "Compound",
    },
    {
      display: "Adonai Elohim",
      yltForms: ["Lord God"],
      note: "Compound",
    },
    {
      display: "Adonai YHWH",
      yltForms: ["Lord Jehovah"],
      note: "Compound",
    },
    {
      display: "Adonai",
      yltForms: ["Lord", "Lord's"],
      note: "Divine address (case-sensitive)",
    },
  ];

/** Strip YLT inline emphasis markers (<FI>…<Fi>) from source text. */
export function cleanYltSource(text: string): string {
  return text
    .replace(/<\s*\/?\s*F\s*I\s*>/gi, "")
    .replace(/`/g, "'");
}

function placeholderPattern(): RegExp {
  return new RegExp(
    `${DIVINE_PLACEHOLDER_START}(\\d+)${DIVINE_PLACEHOLDER_END}`,
    "g",
  );
}

function markDivineNames(text: string): {
  text: string;
  replacements: DivineReplacement[];
} {
  const replacements: DivineReplacement[] = [];
  let out = text;

  for (const [pattern, display] of DIVINE_PRE_MAP) {
    out = out.replace(pattern, (match) => {
      const index = replacements.length;
      replacements.push({ display, original: match });
      return `${DIVINE_PLACEHOLDER_START}${index}${DIVINE_PLACEHOLDER_END}`;
    });
  }

  return { text: out, replacements };
}

function capitalizeDivineTitles(text: string): string {
  let out = text;
  for (const [pattern, replacement] of DIVINE_CAPITALIZE) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function transformOutsidePlaceholders(
  text: string,
  transform: (segment: string) => string,
): string {
  const pattern = placeholderPattern();
  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    result += transform(text.slice(lastIndex, match.index));
    result += match[0];
    lastIndex = match.index + match[0].length;
  }

  result += transform(text.slice(lastIndex));
  return result;
}

function renderPlaceholders(
  text: string,
  replacements: DivineReplacement[],
  options: { lowercaseDisplay: boolean },
): string {
  return text.replace(placeholderPattern(), (_match, indexText) => {
    const entry = replacements[Number(indexText)];
    if (!entry) return "";

    const title = options.lowercaseDisplay
      ? capitalizeDivineTitles(entry.display.toLowerCase())
      : entry.display;

    return `<strong class="ylt-divine-name">${title}</strong> <span class="ylt-divine-gloss">(${entry.original})</span>`;
  });
}

function plainFromPlaceholders(
  text: string,
  replacements: DivineReplacement[],
  options: { lowercaseDisplay: boolean },
): string {
  return text.replace(placeholderPattern(), (_match, indexText) => {
    const entry = replacements[Number(indexText)];
    if (!entry) return "";

    return options.lowercaseDisplay
      ? capitalizeDivineTitles(entry.display.toLowerCase())
      : entry.display;
  });
}

export interface YltFormatOptions {
  divineNames: boolean;
}

function markYltDivinePhrases(text: string): {
  text: string;
  replacements: DivineReplacement[];
} {
  const replacements: DivineReplacement[] = [];
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

function restoreYltDivinePhrases(
  text: string,
  replacements: DivineReplacement[],
): string {
  return text.replace(placeholderPattern(), (_match, indexText) => {
    const entry = replacements[Number(indexText)];
    return entry?.original ?? "";
  });
}

/** Original YLT wording; in natural mode, lowercase prose but keep divine titles capped. */
function formatYltWithoutDivineNames(
  text: string,
  mode: "natural" | "analytic",
): string {
  const cleaned = cleanYltSource(text);
  if (mode !== "natural") return cleaned;

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

function formatYltCore(
  text: string,
  mode: "natural" | "analytic",
  options: YltFormatOptions,
): { html: string; plain: string } {
  if (!options.divineNames) {
    const plain = formatYltWithoutDivineNames(text, mode);
    return { html: plain, plain };
  }

  const { text: marked, replacements } = markDivineNames(cleanYltSource(text));
  let working = marked;

  if (mode === "natural") {
    working = transformOutsidePlaceholders(working, (segment) =>
      segment
        .replace(/[`"]/g, "")
        .replace(/[.,;:!?()[\]{}—–-]/g, " ")
        .replace(/\s+/g, " ")
        .toLowerCase(),
    );
    working = working.trim().replace(/\s+/g, " ");
  }

  const lowercaseDisplay = mode === "natural";

  return {
    html: renderPlaceholders(working, replacements, { lowercaseDisplay }),
    plain: plainFromPlaceholders(working, replacements, { lowercaseDisplay }),
  };
}

/** Natural-mode YLT: no punctuation, no capitals except divine titles. */
export function formatYltNatural(
  text: string,
  options: YltFormatOptions = { divineNames: true },
): string {
  return formatYltCore(text, "natural", options).html;
}

/** Analytic-mode YLT: readable text with divine titles normalized. */
export function formatYltAnalytic(
  text: string,
  options: YltFormatOptions = { divineNames: true },
): string {
  return formatYltCore(text, "analytic", options).html;
}

/** Plain substituted YLT (no HTML glosses) for tokenization and alignment display. */
export function formatYltPlain(
  text: string,
  viewMode: "natural" | "analytic",
  options: YltFormatOptions = { divineNames: true },
): string {
  return formatYltCore(
    text,
    viewMode === "natural" ? "natural" : "analytic",
    options,
  ).plain;
}