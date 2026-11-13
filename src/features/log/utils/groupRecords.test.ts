import { groupByMonth, matchesSearch } from "./groupRecords";

const rec = (id: string, ServicedDate: string) => ({ id, ServicedDate } as ServiceRecord);

test("groups date-sorted records by month and year", () => {
  const groups = groupByMonth([
    rec("a", "2026-10-28"),
    rec("b", "2026-10-02"),
    rec("c", "2026-09-30"),
    rec("d", "2025-10-15"),
  ]);
  expect(groups.map((g) => [g.label, g.records.map((r) => r.id)])).toEqual([
    ["October 2026", ["a", "b"]],
    ["September 2026", ["c"]],
    ["October 2025", ["d"]],
  ]);
});

test("records without a usable date get their own group", () => {
  const groups = groupByMonth([rec("a", "2026-10-28"), rec("b", ""), rec("c", "nonsense")]);
  expect(groups.map((g) => [g.label, g.records.length])).toEqual([
    ["October 2026", 1],
    ["No date", 2],
  ]);
});

test("search matches every word, in any order, ignoring case", () => {
  expect(matchesSearch("Front Brake Pads", "brake")).toBe(true);
  expect(matchesSearch("Front Brake Pads", "pads FRONT")).toBe(true);
  expect(matchesSearch("Front Brake Pads", "rear pads")).toBe(false);
  expect(matchesSearch("Front Brake Pads", "   ")).toBe(true);
  expect(matchesSearch("", "oil")).toBe(false);
});
