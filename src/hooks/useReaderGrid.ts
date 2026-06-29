import { useMemo } from "react";
import { activeEnglishVersions } from "../api/constants";
import type { DerivedViewState } from "../types";

export function useReaderGrid(view: DerivedViewState) {
  const englishCols = activeEnglishVersions(view.columns);

  const gridTemplate = useMemo(() => {
    const cols: string[] = [];
    if (view.showRefs && !view.continuousMode) cols.push("var(--col-ref)");
    for (const _version of englishCols) cols.push("1fr");
    if (view.columns.hebrew) cols.push("1fr");
    if (view.columns.notes) {
      cols.push(view.notesCollapsed ? "var(--col-notes-collapsed)" : "1fr");
    }
    return cols.length ? cols.join(" ") : "1fr";
  }, [view, englishCols]);

  const showRefs = view.showRefs && !view.continuousMode;

  const visibleColumns = [
    showRefs,
    ...englishCols.map(() => true),
    view.columns.hebrew,
    view.columns.notes,
  ].filter(Boolean).length;

  return { englishCols, gridTemplate, showRefs, visibleColumns };
}