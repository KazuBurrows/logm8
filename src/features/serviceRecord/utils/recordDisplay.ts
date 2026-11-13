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

// Spelled out: browsers disagree on short month names ("Sep" vs "Sept").
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** e.g. "28 Oct 2026" (or "28 October 2026" for "long"); "—" when missing/invalid. */
export function formatServicedDate(
  value: string | null | undefined,
  month: "short" | "long" = "short"
): string {
  const date = parseServicedDate(value);
  if (!date) return "—";
  if (month === "long") {
    return date.toLocaleDateString(LOCALE, { day: "numeric", month: "long", year: "numeric" });
  }
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
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

/**
 * What to call a record. Some records were saved without an option name; show
 * the category (then the type) rather than a blank row.
 */
export function recordTitle(
  record: Pick<ServiceRecord, "ServiceOption" | "ServiceCategory" | "ServiceType">
): string {
  return (
    record.ServiceOption?.trim() ||
    record.ServiceCategory?.trim() ||
    record.ServiceType?.trim() ||
    "Untitled record"
  );
}

export interface OdometerReading {
  /** null when the stored value isn't a number. */
  value: number | null;
  /** Display unit ("km", "mi", "hrs"), the stored unit if unrecognised, or "" if none. */
  unit: string;
  raw: string;
}

// Stored units come from the form's KM/Miles/Hours toggle; accept common variants too.
const UNIT_LABELS: Record<string, string> = {
  km: "km",
  kms: "km",
  kilometres: "km",
  kilometers: "km",
  mi: "mi",
  mile: "mi",
  miles: "mi",
  h: "hrs",
  hr: "hrs",
  hrs: "hrs",
  hour: "hrs",
  hours: "hrs",
};

/**
 * Reads a stored odometer value ("<number> <unit>", e.g. "41250 km"). Display
 * only: the stored string is never rewritten, and no unit is converted.
 */
export function parseOdometer(raw: string | null | undefined): OdometerReading {
  const text = (raw ?? "").trim();
  const match = /^(-?[\d,]*\.?\d+)\s*(.*)$/.exec(text);
  if (!match) return { value: null, unit: "", raw: text };
  const value = Number(match[1].replace(/,/g, ""));
  const storedUnit = match[2].trim();
  return {
    value: Number.isFinite(value) ? value : null,
    unit: UNIT_LABELS[storedUnit.toLowerCase()] ?? storedUnit,
    raw: text,
  };
}

/** e.g. "41,250 km", "24,929 mi", "993 hrs"; "" when there's no reading. */
export function formatOdometer(raw: string | null | undefined): string {
  const { value, unit, raw: text } = parseOdometer(raw);
  if (value === null) return text;
  const number = value.toLocaleString(LOCALE, { maximumFractionDigits: 1 });
  const label = unit === "hrs" && value === 1 ? "hr" : unit;
  return label ? `${number} ${label}` : number;
}
