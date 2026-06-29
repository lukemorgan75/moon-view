/** Strong's H216 — אוֹר (light). */
export const LIGHT_STRONG = "216";

export function isLightWordClick(strong: string, englishWord?: string): boolean {
  const normalizedStrong = strong.replace(/^H/i, "");
  if (normalizedStrong === LIGHT_STRONG) return true;

  if (!englishWord) return false;
  return englishWord.toLowerCase().replace(/[^a-z]/g, "") === "light";
}