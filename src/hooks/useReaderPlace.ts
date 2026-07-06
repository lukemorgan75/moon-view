import { useEffect, useLayoutEffect, useRef } from "react";
import { afterLayout } from "../utils/after-layout";
import {
  captureReaderPlace,
  loadReaderPlace,
  restoreReaderPlace,
  saveReaderPlace,
} from "../utils/reader-place";

const SAVE_THROTTLE_MS = 200;
const RESTORE_SUPPRESS_MS = 600;

export function useReaderPlace(
  placeKey: string,
  verseCount: number,
  restoreKey: string,
  pinnedVerse: string | null,
  contentReady: boolean,
): void {
  const placeKeyRef = useRef(placeKey);
  const prevPlaceKeyRef = useRef(placeKey);
  const prevRestoreKeyRef = useRef(restoreKey);
  const suppressSaveUntilRef = useRef(0);
  const lastSaveAtRef = useRef(0);
  const pendingSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    placeKeyRef.current = placeKey;
  }, [placeKey]);

  useLayoutEffect(() => {
    if (verseCount < 1) return;

    if (prevPlaceKeyRef.current !== placeKey) {
      saveReaderPlace(prevPlaceKeyRef.current, captureReaderPlace());
      prevPlaceKeyRef.current = placeKey;
    }

    if (prevRestoreKeyRef.current !== restoreKey) {
      saveReaderPlace(placeKeyRef.current, captureReaderPlace());
      prevRestoreKeyRef.current = restoreKey;
    }
  }, [placeKey, restoreKey, verseCount]);

  const persistPlace = () => {
    if (Date.now() < suppressSaveUntilRef.current) return;
    saveReaderPlace(placeKeyRef.current, captureReaderPlace());
  };

  const schedulePersist = () => {
    const now = Date.now();
    const elapsed = now - lastSaveAtRef.current;
    if (elapsed >= SAVE_THROTTLE_MS) {
      lastSaveAtRef.current = now;
      persistPlace();
      return;
    }

    if (pendingSaveRef.current) return;
    pendingSaveRef.current = setTimeout(() => {
      pendingSaveRef.current = null;
      lastSaveAtRef.current = Date.now();
      persistPlace();
    }, SAVE_THROTTLE_MS - elapsed);
  };

  useEffect(() => {
    const onScroll = () => schedulePersist();
    window.addEventListener("scroll", onScroll, { passive: true });

    const onBeforeUnload = () => persistPlace();
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (pendingSaveRef.current) {
        clearTimeout(pendingSaveRef.current);
        pendingSaveRef.current = null;
      }
      persistPlace();
    };
  }, []);

  useLayoutEffect(() => {
    if (!contentReady || verseCount < 1) return;

    const place = loadReaderPlace(placeKey);
    if (!place && !pinnedVerse) return;

    const attemptRestore = () =>
      restoreReaderPlace(place ?? { verseKey: null, scrollY: 0, anchorTop: 0 }, pinnedVerse);

    suppressSaveUntilRef.current = Date.now() + RESTORE_SUPPRESS_MS;

    afterLayout(attemptRestore);
  }, [placeKey, verseCount, restoreKey, pinnedVerse, contentReady]);
}