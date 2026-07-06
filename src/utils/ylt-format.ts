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

function renderPlaceholders(
  text: string,
  replacements: DivineReplacement[],
): string {
  return text.replace(placeholderPattern(), (_match, indexText) => {
    const entry = replacements[Number(indexText)];
    if (!entry) return "";

    return `<strong class="ylt-divine-name">${entry.display}</strong> <span class="ylt-divine-gloss">(${entry.original})</span>`;
  });
}

function plainFromPlaceholders(
  text: string,
  replacements: DivineReplacement[],
): string {
  return text.replace(placeholderPattern(), (_match, indexText) => {
    const entry = replacements[Number(indexText)];
    if (!entry) return "";

    return entry.display;
  });
}

export interface YltFormatOptions {
  divineNames: boolean;
}

/** Original YLT wording with source punctuation and capitalization preserved. */
function formatYltWithoutDivineNames(text: string): string {
  return cleanYltSource(text);
}

function formatYltCore(
  text: string,
  _mode: "natural" | "analytic",
  options: YltFormatOptions,
): { html: string; plain: string } {
  if (!options.divineNames) {
    const plain = formatYltWithoutDivineNames(text);
    return { html: plain, plain };
  }

  const { text: marked, replacements } = markDivineNames(cleanYltSource(text));

  return {
    html: renderPlaceholders(marked, replacements),
    plain: plainFromPlaceholders(marked, replacements),
  };
}

/** Natural-mode YLT: continuous narrative prose with YLT punctuation and caps. */
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