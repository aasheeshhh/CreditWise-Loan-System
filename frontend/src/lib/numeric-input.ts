/** Allow empty string while clearing/editing — do not coerce "" → 0. */
export function parseNumericInput(raw: string): number | "" {
  if (raw === "") return "";
  const n = Number(raw);
  return Number.isFinite(n) ? n : "";
}
