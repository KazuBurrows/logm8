import { parseServicedDate } from "../../serviceRecord/utils/recordDisplay";

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
