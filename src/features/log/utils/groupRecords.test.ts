import { groupByMonth, matchesSearch, serviceFilterGroups } from "./groupRecords";

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

test("filter options are each record title once, grouped by category with counts", () => {
  const r = (ServiceCategory: string, ServiceOption: string) =>
    ({ ServiceCategory, ServiceOption, ServiceType: "Maintenance" } as ServiceRecord);
  const groups = serviceFilterGroups([
    r("Engine", "Oil Change"),
    r("Brakes", "Front Pads"),
    r("Engine", "Air Filter"),
    r("Engine", "Oil Change"),
    r("", "Wash"),
    r("Engine", ""),
  ]);
  expect(groups).toEqual([
    { label: "Brakes", options: [{ value: "Front Pads", label: "Front Pads", count: 1 }] },
    {
      label: "Engine",
      options: [
        { value: "Air Filter", label: "Air Filter", count: 1 },
        { value: "Engine", label: "Engine", count: 1 },
        { value: "Oil Change", label: "Oil Change", count: 2 },
      ],
    },
    { label: "Other", options: [{ value: "Wash", label: "Wash", count: 1 }] },
  ]);
});
