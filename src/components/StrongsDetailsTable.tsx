import type { StrongsDetail } from "../api/figures";

interface StrongsDetailsTableProps {
  details: StrongsDetail[];
  compact?: boolean;
}

export function StrongsDetailsTable({
  details,
  compact = false,
}: StrongsDetailsTableProps) {
  if (details.length === 0) return null;

  return (
    <table className={`strongs-details-table ${compact ? "strongs-details-table--compact" : ""}`}>
      <thead>
        <tr>
          <th>Strong&apos;s</th>
          <th>Lang</th>
          <th>Lemma</th>
          <th>Transliteration</th>
        </tr>
      </thead>
      <tbody>
        {details.map((row) => (
          <tr key={row.strong}>
            <td className="strongs-details-num">{row.strong}</td>
            <td className="strongs-details-lang">
              {row.lang === "he" ? "Hebrew" : "Greek"}
            </td>
            <td
              className="strongs-details-lemma"
              dir={row.lang === "he" ? "rtl" : "ltr"}
              lang={row.lang === "he" ? "he" : "el"}
            >
              {row.lemma}
            </td>
            <td className="strongs-details-xlit">{row.xlit}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}