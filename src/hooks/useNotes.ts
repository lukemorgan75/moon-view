import { useCallback, useEffect, useState } from "react";

function notesKey(book: string): string {
  return `bible-parallel-notes-${book}`;
}

export function useNotes(book: string) {
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem(notesKey(book));
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(notesKey(book));
      setNotes(raw ? JSON.parse(raw) : {});
    } catch {
      setNotes({});
    }
  }, [book]);

  useEffect(() => {
    localStorage.setItem(notesKey(book), JSON.stringify(notes));
  }, [book, notes]);

  const setNote = useCallback((key: string, value: string) => {
    setNotes((current) => ({ ...current, [key]: value }));
  }, []);

  return { notes, setNote };
}