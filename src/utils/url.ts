const SEFARIA_GCS_PREFIX = "https://storage.googleapis.com/sefaria-export/";

/** Encode each path segment once (decode first to avoid %2520 double-encoding). */
function encodePathSegments(path: string): string {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join("/");
}

const SEFARIA_CORS_RELAY = "https://api.allorigins.win/raw?url=";

/**
 * Route Sefaria GCS URLs through the Vite proxy in dev (GCS has no CORS headers).
 * In production, relay through a public CORS proxy so static hosting can fetch text.
 * Other URLs are returned with encoded path segments for fetch().
 */
export function fetchUrl(url: string): string {
  if (url.startsWith(SEFARIA_GCS_PREFIX)) {
    if (import.meta.env.DEV) {
      const path = url.slice(SEFARIA_GCS_PREFIX.length);
      return `/sefaria-export/${encodePathSegments(path)}`;
    }
    return `${SEFARIA_CORS_RELAY}${encodeURIComponent(url)}`;
  }

  const parsed = new URL(url);
  const encodedPath = encodePathSegments(parsed.pathname);
  return `${parsed.origin}${encodedPath}${parsed.search}${parsed.hash}`;
}