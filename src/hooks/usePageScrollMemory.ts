import { useEffect, useLayoutEffect, useRef } from "react";

const SAVE_THROTTLE_MS = 200;
const RESTORE_SUPPRESS_MS = 600;

export function usePageScrollMemory(storageKey: string): void {
  const suppressSaveUntilRef = useRef(0);
  const lastSaveAtRef = useRef(0);
  const pendingSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistScroll = () => {
    if (Date.now() < suppressSaveUntilRef.current) return;
    localStorage.setItem(storageKey, String(window.scrollY));
  };

  const schedulePersist = () => {
    const now = Date.now();
    const elapsed = now - lastSaveAtRef.current;
    if (elapsed >= SAVE_THROTTLE_MS) {
      lastSaveAtRef.current = now;
      persistScroll();
      return;
    }

    if (pendingSaveRef.current) return;
    pendingSaveRef.current = setTimeout(() => {
      pendingSaveRef.current = null;
      lastSaveAtRef.current = Date.now();
      persistScroll();
    }, SAVE_THROTTLE_MS - elapsed);
  };

  useLayoutEffect(() => {
    const raw = localStorage.getItem(storageKey);
    const scrollY = raw ? Number(raw) : 0;
    if (!Number.isFinite(scrollY) || scrollY <= 0) return;

    suppressSaveUntilRef.current = Date.now() + RESTORE_SUPPRESS_MS;
    window.scrollTo({ top: scrollY, behavior: "auto" });
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: "auto" });
    });
  }, [storageKey]);

  useEffect(() => {
    const onScroll = () => schedulePersist();
    window.addEventListener("scroll", onScroll, { passive: true });

    const onBeforeUnload = () => persistScroll();
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (pendingSaveRef.current) {
        clearTimeout(pendingSaveRef.current);
        pendingSaveRef.current = null;
      }
      persistScroll();
    };
  }, [storageKey]);
}