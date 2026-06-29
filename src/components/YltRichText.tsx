interface YltRichTextProps {
  html: string;
  className?: string;
}

export function YltRichText({ html, className }: YltRichTextProps) {
  if (!html) return null;

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}