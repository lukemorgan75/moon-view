import { assetUrl } from "../utils/assets";

export interface NewtonDefinition {
  id: string;
  label: string;
  newton_def: number | null;
  sense: string;
  role?: string | null;
  parent?: string | null;
  roots: string[];
  scope: string[];
  note?: string;
}

export interface NewtonVerseRef {
  chapter: number;
  verse: number;
}

export interface NewtonProposition {
  id: string;
  num: string;
  title: string;
  text: string;
  chapters: number[];
  verses?: NewtonVerseRef[];
}

interface DefinitionsFile {
  entries: NewtonDefinition[];
}

interface PropositionsFile {
  propositions: NewtonProposition[];
}

let defsPromise: Promise<NewtonDefinition[]> | null = null;
let propsPromise: Promise<NewtonProposition[]> | null = null;

export async function loadNewtonDefinitions(): Promise<NewtonDefinition[]> {
  if (!defsPromise) {
    defsPromise = fetch(assetUrl("/data/newton-definitions.json"))
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load Newton's definitions.");
        const data = (await r.json()) as DefinitionsFile;
        return data.entries ?? [];
      })
      .catch((err) => {
        defsPromise = null;
        throw err;
      });
  }
  return defsPromise;
}

export async function loadNewtonPropositions(): Promise<NewtonProposition[]> {
  if (!propsPromise) {
    propsPromise = fetch(assetUrl("/data/newton-propositions.json"))
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load Newton's propositions.");
        const data = (await r.json()) as PropositionsFile;
        return data.propositions ?? [];
      })
      .catch((err) => {
        propsPromise = null;
        throw err;
      });
  }
  return propsPromise;
}

export interface NewtonRulesSection {
  title: string;
  rules: string[];
}

export interface NewtonRulesSource {
  author?: string;
  work?: string;
  manuscript?: string;
  section?: string;
  newton_project_url: string;
  note?: string;
}

export interface NewtonRulesData {
  source: NewtonRulesSource;
  sections: NewtonRulesSection[];
}

let rulesPromise: Promise<NewtonRulesData> | null = null;

export async function loadNewtonRules(): Promise<NewtonRulesData> {
  if (!rulesPromise) {
    rulesPromise = fetch(assetUrl("/data/newton-rules.json"))
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load Newton's rules.");
        return (await r.json()) as NewtonRulesData;
      })
      .catch((err) => {
        rulesPromise = null;
        throw err;
      });
  }
  return rulesPromise;
}

/** Canonical Newton Project link for Yahuda Ms. 1.1 (THEM00135). */
export const NEWTON_PROJECT_THEM00135_URL =
  "https://www.newtonproject.ox.ac.uk/view/texts/normalized/THEM00135";

export interface NewtonIntroData {
  source: NewtonRulesSource;
  title?: string;
  paragraphs: string[];
}

let introPromise: Promise<NewtonIntroData> | null = null;

export async function loadNewtonIntro(): Promise<NewtonIntroData> {
  if (!introPromise) {
    introPromise = fetch(assetUrl("/data/newton-intro.json"))
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load Newton's introduction.");
        return (await r.json()) as NewtonIntroData;
      })
      .catch((err) => {
        introPromise = null;
        throw err;
      });
  }
  return introPromise;
}


export interface RootMatch {
  root: string;
  defIds: string[];
}

export interface BuildRootIndexOptions {
  /**
   * When true (default for Revelation), only index entries that carry a Newton
   * Definition number — excludes anatomy / non-definition seed roots like "hand".
   */
  newtonDefsOnly?: boolean;
}

/** Build case-insensitive root → definition ids (longest roots first for matching). */
export function buildRootIndex(
  defs: NewtonDefinition[],
  options: BuildRootIndexOptions = {},
): { byRoot: Map<string, string[]>; rootsLongestFirst: string[] } {
  const newtonDefsOnly = options.newtonDefsOnly ?? false;
  const byRoot = new Map<string, string[]>();
  for (const def of defs) {
    if (newtonDefsOnly && (def.newton_def == null || def.newton_def <= 0)) {
      continue;
    }
    for (const raw of def.roots) {
      const root = raw.trim().toLowerCase();
      if (!root || root.length < 3) continue;
      // Skip ultra-generic single letters / very short noise
      const list = byRoot.get(root) ?? [];
      if (!list.includes(def.id)) list.push(def.id);
      byRoot.set(root, list);
    }
  }
  const rootsLongestFirst = [...byRoot.keys()].sort(
    (a, b) => b.length - a.length || a.localeCompare(b),
  );
  return { byRoot, rootsLongestFirst };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Build a single global matcher for multi-word and single-word roots. */
export function buildHighlightRegex(rootsLongestFirst: string[]): RegExp | null {
  if (!rootsLongestFirst.length) return null;
  const parts = rootsLongestFirst.map((root) => {
    const spaced = escapeRegExp(root).replace(/\\ /g, "\\s+");
    return spaced;
  });
  return new RegExp(`\\b(?:${parts.join("|")})\\b`, "gi");
}

export function lookupDefsForRoot(
  byRoot: Map<string, string[]>,
  defsById: Map<string, NewtonDefinition>,
  matched: string,
): NewtonDefinition[] {
  const key = matched.toLowerCase().replace(/\s+/g, " ");
  // Try exact, then collapsed spaces
  const ids = byRoot.get(key) ?? byRoot.get(key.replace(/\s+/g, " ")) ?? [];
  return ids
    .map((id) => defsById.get(id))
    .filter((d): d is NewtonDefinition => !!d);
}

export function propositionsForChapter(
  props: NewtonProposition[],
  chapter: number,
): NewtonProposition[] {
  return props.filter((p) => p.chapters.includes(chapter));
}
