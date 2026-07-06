#!/usr/bin/env node
/**
 * Build hebrew-names.json from Torah morph proper nouns (Np) + Strong's Hebrew.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "public", "data");

const TORAH_MORPH = ["Gen", "Exod", "Lev", "Num", "Deut"];

const PLACE_RE =
  /\b(river|mountain|mount|city|cities|town|land|region|country|valley|pool|garden|plain|sea|wilderness|gate|tower|island|hill|brook|fountain|forest|desert|territory|kingdom|field|house of)\b/i;
const PERSON_RE =
  /\b(son of|daughter of|father of|mother of|patriarch|patriach|king|queen|priest|prophet|man|woman|wife|husband|eunuch|tribe|people|antediluvian|Israelite|Hebrew|descendants|descendant|child|first woman|first man)\b/i;

function classifyKind(def) {
  if (PLACE_RE.test(def)) return "place";
  if (PERSON_RE.test(def)) return "person";
  return "name";
}

function primaryEnglish(kjv) {
  if (!kjv) return "";
  return kjv.split(/[,;]/)[0]?.trim() ?? kjv;
}

function extractMeaning(def) {
  const trimmed = def.trim();
  const comma = trimmed.indexOf(",");
  if (comma > 0) {
    const tail = trimmed.slice(comma + 1).trim().replace(/\.$/, "");
    if (tail.length > 0) return tail;
  }
  return trimmed.replace(/\.$/, "");
}

const strongs = JSON.parse(
  readFileSync(join(dataDir, "strongs-hebrew.json"), "utf8"),
);

const npStrongs = new Set();

for (const morphId of TORAH_MORPH) {
  const morph = JSON.parse(
    readFileSync(join(dataDir, "morph", `${morphId}.json`), "utf8"),
  );
  for (const words of Object.values(morph)) {
    for (const word of words) {
      if (word.m && /Np/.test(word.m)) npStrongs.add(word.s);
    }
  }
}

const names = {};

for (const strong of [...npStrongs].sort((a, b) => Number(a) - Number(b))) {
  const entry = strongs[`H${strong}`];
  if (!entry?.lemma) continue;

  const def = (entry.def ?? "").trim();
  const english = primaryEnglish(entry.kjv ?? "");

  names[strong] = {
    strong,
    lemma: entry.lemma,
    xlit: entry.xlit ?? "",
    english,
    meaning: extractMeaning(def),
    context: def,
    kind: classifyKind(def),
  };
}

writeFileSync(
  join(dataDir, "hebrew-names.json"),
  JSON.stringify(names),
);

console.log(`Wrote ${Object.keys(names).length} Hebrew name entries.`);