/** Resolve a site-root path for fetch() against the Vite base URL (GitHub Pages subpath). */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${normalized}`;
}