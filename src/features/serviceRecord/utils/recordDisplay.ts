// Display helpers for service records. Keep formatting here so the list, the
// detail view and Statistics show the same values the same way.

const LOCALE = "en-GB";

/**
 * ServicedDate is stored as a date-only "yyyy-mm-dd" (from a date input). The
 * Date constructor reads that form as UTC midnight, which shows as the
 * previous day west of UTC, so date-only strings are read as local dates.
 */
export function parseServicedDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** e.g. "28 Oct 2026", or "—" when missing/invalid. */
export function formatServicedDate(
  value: string | null | undefined,
  month: "short" | "long" = "short"
): string {
  const date = parseServicedDate(value);
  return date
    ? date.toLocaleDateString(LOCALE, { day: "numeric", month, year: "numeric" })
    : "—";
}

/** Last path segment of a receipt URL, without any query string (e.g. a SAS token). */
export function fileNameFromUrl(url: string, fallback: string): string {
  try {
    const name = new URL(url).pathname.split("/").pop();
    return name ? decodeURIComponent(name) : fallback;
  } catch {
    return url.split("?")[0].split("/").pop() || fallback;
  }
}
