import type { Corpus } from "../api/book-meta";

export type AppRoute = "home" | "reader" | "revelation" | "info";

export interface ParsedRoute {
  route: AppRoute;
  corpus?: Corpus;
}

export function parseRoute(hash: string): ParsedRoute {
  const raw = (hash || "").replace(/^#/, "").replace(/^\//, "") || "home";
  const path = raw.split("?")[0].toLowerCase();

  if (path === "info" || path === "about") return { route: "info" };
  if (
    path === "revelation" ||
    path === "rev" ||
    path === "apocalypse" ||
    path === "reader/revelation"
  ) {
    return { route: "revelation" };
  }
  if (path === "torah" || path === "reader/torah") {
    return { route: "reader", corpus: "torah" };
  }
  if (
    path === "paul" ||
    path === "pauline" ||
    path === "epistles" ||
    path === "reader/paul"
  ) {
    return { route: "reader", corpus: "paul" };
  }
  // Legacy bare reader hash and retired god-names deep links → home
  if (path === "reader" || path === "god-names" || path === "info/god-names") {
    return { route: "home" };
  }
  if (path === "home" || path === "") return { route: "home" };

  return { route: "home" };
}

export function corpusHref(corpus: Corpus): string {
  return corpus === "paul" ? "#paul" : "#torah";
}

export function revelationHref(): string {
  return "#revelation";
}

export function homeHref(): string {
  return "#home";
}

export function infoHref(): string {
  return "#info";
}
