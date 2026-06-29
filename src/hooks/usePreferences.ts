import { useCallback, useEffect, useState } from "react";
import { DEFAULT_PREFERENCES, type ViewerPreferences } from "../types";

const STORAGE_KEY = "bible-parallel-prefs";

function loadPreferences(): ViewerPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const saved = JSON.parse(raw);
    const { esv: _esv, rsv: _rsv, ...savedColumns } = saved.columns ?? {};
    return {
      ...DEFAULT_PREFERENCES,
      ...saved,
      columns: { ...DEFAULT_PREFERENCES.columns, ...savedColumns },
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<ViewerPreferences>(loadPreferences);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    document.documentElement.dataset.theme = prefs.darkMode ? "dark" : "light";
  }, [prefs.darkMode]);

  const update = useCallback((patch: Partial<ViewerPreferences>) => {
    setPrefs((current) => ({ ...current, ...patch }));
  }, []);

  const toggleColumn = useCallback(
    (column: keyof ViewerPreferences["columns"]) => {
      setPrefs((current) => ({
        ...current,
        columns: { ...current.columns, [column]: !current.columns[column] },
      }));
    },
    [],
  );

  return { prefs, update, toggleColumn };
}