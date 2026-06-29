import { useEffect, useRef } from "react";

const SCROLL_COLLAPSE_THRESHOLD_PX = 6;

/** Collapse the toolbar deck when the user scrolls the main page. */
export function useAutoCollapseToolbar(
  expanded: boolean,
  onCollapse: () => void,
): void {
  const expandedRef = useRef(expanded);
  const scrollYAtExpandRef = useRef(0);
  const onCollapseRef = useRef(onCollapse);

  useEffect(() => {
    onCollapseRef.current = onCollapse;
  }, [onCollapse]);

  useEffect(() => {
    expandedRef.current = expanded;
    if (expanded) {
      scrollYAtExpandRef.current = window.scrollY;
    }
  }, [expanded]);

  useEffect(() => {
    const onScroll = () => {
      if (!expandedRef.current) return;
      if (
        Math.abs(window.scrollY - scrollYAtExpandRef.current) >=
        SCROLL_COLLAPSE_THRESHOLD_PX
      ) {
        expandedRef.current = false;
        onCollapseRef.current();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}