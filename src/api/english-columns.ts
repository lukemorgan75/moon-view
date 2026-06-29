import type { ColumnVisibility, EnglishVersion } from "../types";

export function englishVersionLabel(version: EnglishVersion): string {
  switch (version) {
    case "kjv":
      return "King James Version";
    case "jps":
      return "JPS 1985";
    case "ylt":
      return "Young's Literal Translation";
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
  if (columns.ylt) versions.push("ylt");
  return versions;
}