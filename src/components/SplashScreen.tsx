import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { assetUrl } from "../utils/assets";

const STORAGE_KEY = "moon-view-splash-seen";
const MIN_DISPLAY_MS = 2000;
const FADE_MS = 700;
const MAX_DISPLAY_MS = 5500;

const MOON_IMAGE = assetUrl("/images/splash-moon.jpg");

function hasSeenSplash(): boolean {
  try {
    return !!localStorage.getItem(STORAGE_KEY);
  } catch {
    return true;
  }
}

function markSplashSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

interface SplashGateProps {
  children: ReactNode;
}

export function SplashGate({ children }: SplashGateProps) {
  const [showSplash, setShowSplash] = useState(() => !hasSeenSplash());
  const [fading, setFading] = useState(false);
  const dismissedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    timersRef.current.push(setTimeout(fn, delay));
  }, []);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    clearTimers();
    setFading(true);
    schedule(() => {
      markSplashSeen();
      setShowSplash(false);
    }, FADE_MS);
  }, [clearTimers, schedule]);

  useEffect(() => {
    if (!showSplash) return;

    document.body.classList.add("splash-active");

    const startedAt = Date.now();
    const img = new Image();
    img.src = MOON_IMAGE;

    const dismissAfterMinDisplay = () => {
      const elapsed = Date.now() - startedAt;
      schedule(dismiss, Math.max(0, MIN_DISPLAY_MS - elapsed));
    };

    img.addEventListener("load", dismissAfterMinDisplay);
    img.addEventListener("error", dismissAfterMinDisplay);
    schedule(dismiss, MAX_DISPLAY_MS);

    return () => {
      img.removeEventListener("load", dismissAfterMinDisplay);
      img.removeEventListener("error", dismissAfterMinDisplay);
      clearTimers();
      document.body.classList.remove("splash-active");
    };
  }, [showSplash, dismiss, schedule, clearTimers]);

  useEffect(() => {
    if (showSplash) return;
    document.body.classList.remove("splash-active");
  }, [showSplash]);

  return (
    <>
      {children}
      {showSplash && (
        <div
          className={`splash-screen${fading ? " splash-screen--fading" : ""}`}
          role="dialog"
          aria-label="Moon View"
          aria-modal="true"
          onClick={dismiss}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              dismiss();
            }
          }}
          tabIndex={-1}
        >
          <img
            className="splash-screen-image"
            src={MOON_IMAGE}
            alt="The moon"
            draggable={false}
          />
        </div>
      )}
    </>
  );
}