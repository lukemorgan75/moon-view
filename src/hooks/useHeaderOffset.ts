import { useEffect, useRef } from "react";

/** Keeps --app-header-offset in sync with the sticky toolbar (+ error banner). */
export function useHeaderOffset(hasErrorBanner: boolean): void {
  const lastHeightRef = useRef(-1);

  useEffect(() => {
    const update = () => {
      const toolbar = document.querySelector(".toolbar");
      const banner = hasErrorBanner
        ? document.querySelector(".error-banner")
        : null;
      let height = 0;
      if (toolbar) height += toolbar.getBoundingClientRect().height;
      if (banner) height += banner.getBoundingClientRect().height;

      const next = Math.ceil(height);
      if (next === lastHeightRef.current) return;
      lastHeightRef.current = next;
      document.documentElement.style.setProperty(
        "--app-header-offset",
        `${next}px`,
      );
    };

    update();

    const observer = new ResizeObserver(update);
    const toolbar = document.querySelector(".toolbar");
    if (toolbar) observer.observe(toolbar);

    let banner: Element | null = null;
    if (hasErrorBanner) {
      banner = document.querySelector(".error-banner");
      if (banner) observer.observe(banner);
    }

    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [hasErrorBanner]);
}