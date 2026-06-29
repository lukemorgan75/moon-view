export function isInfoView(hash: string): boolean {
  const raw = (hash || "").replace(/^#/, "") || "reader";
  return raw === "info" || raw === "about";
}