export function stripHtml(text: string, removeFootnotes = false): string {
  if (!text) return "";

  let result = text
    .replace(/&nbsp;/g, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<span[^>]*>/gi, "")
    .replace(/<\/span>/gi, "")
    .replace(/<big>|<\/big>|<strong>|<\/strong>|<small>|<\/small>/gi, "");

  if (removeFootnotes) {
    result = result
      .replace(/<sup[^>]*class=["']footnote-marker["'][^>]*>[\s\S]*?<\/sup>/gi, "")
      .replace(/<i[^>]*class=["']footnote["'][^>]*>[\s\S]*?<\/i>/gi, "");
  }

  result = result.replace(/<[^>]+>/g, "");
  return result.replace(/\s+/g, " ").trim();
}