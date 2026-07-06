export type AppRoute = "reader" | "info" | "god-names";

export function parseRoute(hash: string): AppRoute {
  const raw = (hash || "").replace(/^#/, "") || "reader";
  if (raw === "info" || raw === "about") return "info";
  if (raw === "god-names" || raw === "info/god-names") return "god-names";
  return "reader";
}

export function isInfoView(hash: string): boolean {
  return parseRoute(hash) === "info";
}

export function isGodNamesView(hash: string): boolean {
  return parseRoute(hash) === "god-names";
}