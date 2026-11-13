import { parseServicedDate, recordTitle } from "../../serviceRecord/utils/recordDisplay";

export interface RecordGroup {
  key: string;
  /** e.g. "October 2026", or "No date". */
  label: string;
  records: ServiceRecord[];
}

/**
 * Groups records into runs of the same month and year, in the order given. With
 * records sorted by date each month appears once; any other order would split
 * months into many small runs, so only group date-sorted lists.
 */
export function groupByMonth(records: ServiceRecord[]): RecordGroup[] {
  const groups: RecordGroup[] = [];
  for (const record of records) {
    const date = parseServicedDate(record.ServicedDate);
    const key = date ? `${date.getFullYear()}-${date.getMonth()}` : "none";
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.records.push(record);
    } else {
      groups.push({
        key,
        label: date
          ? date.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
          : "No date",
        records: [record],
      });
    }
  }
  return groups;
}

/** Case-insensitive match of every word in the query against a title. */
export function matchesSearch(title: string | null | undefined, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = (title ?? "").toLowerCase();
  return words.every((word) => haystack.includes(word));
}

export interface ServiceFilterOption {
  /** The record title the filter matches. */
  value: string;
  label: string;
  /** How many records have this title. */
  count: number;
}

export interface ServiceFilterGroup {
  /** Service category, e.g. "Engine". */
  label: string;
  options: ServiceFilterOption[];
}

/**
 * The sort/filter sheet's service options: each distinct record title, grouped
 * by category, alphabetically, with a count. Derived fresh from the records so
 * the list always matches them (no shared state to accumulate duplicates).
 */
export function serviceFilterGroups(records: ServiceRecord[]): ServiceFilterGroup[] {
  const byCategory = new Map<string, Map<string, number>>();
  for (const record of records) {
    const category = record.ServiceCategory?.trim() || "Other";
    const title = recordTitle(record);
    const titles = byCategory.get(category) ?? new Map<string, number>();
    titles.set(title, (titles.get(title) ?? 0) + 1);
    byCategory.set(category, titles);
  }
  const byName = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "base" });
  return Array.from(byCategory)
    .sort(([a], [b]) => byName(a, b))
    .map(([label, titles]) => ({
      label,
      options: Array.from(titles)
        .sort(([a], [b]) => byName(a, b))
        .map(([value, count]) => ({ value, label: value, count })),
    }));
}
