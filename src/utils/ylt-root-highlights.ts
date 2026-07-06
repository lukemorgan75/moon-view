/** Hebrew roots to highlight in YLT (Strong's number → class suffix). */
export const YLT_ROOT_STRONGS = {
  bara: "1254",
  asah: "6213",
  toledot: "8435",
  qadash: "6942",
} as const;

export type YltRootHighlight = keyof typeof YLT_ROOT_STRONGS;

const STRONGS_TO_ROOT: Record<string, YltRootHighlight> = {
  [YLT_ROOT_STRONGS.bara]: "bara",
  [YLT_ROOT_STRONGS.asah]: "asah",
  [YLT_ROOT_STRONGS.toledot]: "toledot",
  [YLT_ROOT_STRONGS.qadash]: "qadash",
};

export function yltRootHighlightClass(strongs: string[]): string | null {
  for (const strong of strongs) {
    const rootClass = yltRootHighlightClassFromStrong(strong);
    if (rootClass) return rootClass;
  }
  return null;
}

export function yltRootHighlightClassFromStrong(strong: string): string | null {
  const key = strong.replace(/^H/i, "");
  const root = STRONGS_TO_ROOT[key];
  return root ? `ylt-root--${root}` : null;
}