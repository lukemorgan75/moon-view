/** Morphology tag marks a proper noun (person, place, or name). */
export function isProperNoun(morphTag: string | undefined): boolean {
  return !!morphTag && /Np/.test(morphTag);
}