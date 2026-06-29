import { useMemo } from "react";
import { activeEnglishVersions } from "../api/constants";
import type { ViewerPreferences } from "../types";

export function useReaderGrid(prefs: ViewerPreferences) {
  const englishCols = activeEnglishVersions(prefs.columns, prefs.book);

  const gridTemplate = useMemo(() => {
    const cols: string[] = [];
    if (prefs.showRefs && !prefs.continuousMode) cols.push("var(--col-ref)");
    for (const _version of englishCols) cols.push("1fr");
    if (prefs.columns.hebrew) cols.push("1fr");
    if (prefs.columns.notes) {
      cols.push(prefs.notesCollapsed ? "var(--col-notes-collapsed)" : "1fr");
    }
    return cols.length ? cols.join(" ") : "1fr";
  }, [prefs, englishCols]);

  const showRefs = prefs.showRefs && !prefs.continuousMode;

  const visibleColumns = [
    showRefs,
    ...englishCols.map(() => true),
    prefs.columns.hebrew,
    prefs.columns.notes,
  ].filter(Boolean).length;

  return { englishCols, gridTemplate, showRefs, visibleColumns };
}