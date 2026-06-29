export interface FigureDictionaryLocation {
  figureId?: string;
  book?: string;
  query?: string;
}

export function isFigureDictionaryView(hash: string): boolean {
  const raw = (hash || "").replace(/^#/, "") || "reader";
  return raw === "figures" || raw.startsWith("figures/") || raw.startsWith("figures?");
}

export function parseFigureDictionaryHash(
  hash: string,
): FigureDictionaryLocation {
  const raw = (hash || "").replace(/^#/, "");
  if (!raw.startsWith("figures")) return {};

  const [path, queryString] = raw.split("?");
  const segments = path.split("/").filter(Boolean);
  const params = new URLSearchParams(queryString ?? "");

  return {
    figureId: segments[1] || params.get("figure") || undefined,
    book: params.get("book") || undefined,
    query: params.get("q") || undefined,
  };
}

export function figureDictionaryHref(figureId: string, book?: string): string {
  const params = new URLSearchParams();
  if (book) params.set("book", book);
  const qs = params.toString();
  return `#figures/${encodeURIComponent(figureId)}${qs ? `?${qs}` : ""}`;
}