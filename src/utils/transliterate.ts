import { transliterate } from "hebrew-transliteration";
import type { MorphWord } from "../types";
import { stripHtml } from "./html";

export function transliterateWord(text: string): string {
  const clean = stripHtml(text);
  if (!clean) return "";
  return transliterate(clean);
}

export function transliterateVerse(verse: string): string {
  const clean = stripHtml(verse);
  const words = clean.split(/[\s־]+/).filter(Boolean);
  return words.map((word) => transliterate(word)).join(" ");
}

export function transliterateMorphWords(morph: MorphWord[]): string[] {
  return morph.map((word) => transliterateWord(word.t));
}