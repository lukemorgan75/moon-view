import type { ColumnVisibility, EnglishVersion } from "../types";

export function englishVersionLabel(version: EnglishVersion): string {
  switch (version) {
    case "kjv":
      return "King James Version";
    case "jps":
      return "JPS 1985";
    case "ylt":
      return "Young's Literal Translation";
    case "esv":
      return "English Standard Version";
    default:
      return version;
  }
}

export function englishVersionShortLabel(version: EnglishVersion): string {
  switch (version) {
    case "kjv":
      return "KJV";
    case "jps":
      return "JPS";
    case "ylt":
      return "YLT";
    case "esv":
      return "ESV";
    default:
      return version;
  }
}

export function activeEnglishVersions(
  columns: ColumnVisibility,
): EnglishVersion[] {
  const versions: EnglishVersion[] = [];
  if (columns.kjv) versions.push("kjv");
  if (columns.jps) versions.push("jps");
  if (columns.esv) versions.push("esv");
  if (columns.ylt) versions.push("ylt");
  return versions;
}
