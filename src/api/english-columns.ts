import { getBookMeta } from "./book-meta";
import type { ColumnVisibility, EnglishVersion } from "../types";

export type SecondaryEnglishVersion = Extract<EnglishVersion, "jps" | "rsv">;

export function secondaryEnglishVersion(book: string): SecondaryEnglishVersion {
  return getBookMeta(book).testament === "OT" ? "jps" : "rsv";
}

export function secondaryEnglishLabel(book: string): string {
  return getBookMeta(book).testament === "OT" ? "JPS" : "RSV";
}

export function englishVersionLabel(
  version: EnglishVersion,
  book: string,
): string {
  switch (version) {
    case "kjv":
      return "King James Version";
    case "jps":
      return "JPS 1985";
    case "rsv":
      return "RSV";
    default:
      return secondaryEnglishLabel(book);
  }
}

export function activeEnglishVersions(
  columns: ColumnVisibility,
  book: string,
): EnglishVersion[] {
  const versions: EnglishVersion[] = [];
  if (columns.kjv) versions.push("kjv");
  if (columns.jps) versions.push(secondaryEnglishVersion(book));
  return versions;
}