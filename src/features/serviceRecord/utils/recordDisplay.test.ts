import {
  cleanOdometerInput,
  fileNameFromUrl,
  formatOdometer,
  groupOdometerInput,
  formatServicedDate,
  parseOdometer,
  parseServicedDate,
  recordTitle,
} from "./recordDisplay";

test("a date-only value is read as a local date, not UTC midnight", () => {
  const date = parseServicedDate("2026-10-01");
  expect(date?.getFullYear()).toBe(2026);
  expect(date?.getMonth()).toBe(9);
  expect(date?.getDate()).toBe(1);
});

test("missing or invalid dates format as a dash", () => {
  expect(parseServicedDate("")).toBeNull();
  expect(parseServicedDate("not a date")).toBeNull();
  expect(formatServicedDate(undefined)).toBe("—");
});

test("formats dates consistently", () => {
  expect(formatServicedDate("2026-10-28")).toBe("28 Oct 2026");
  expect(formatServicedDate("2026-10-28", "long")).toBe("28 October 2026");
  expect(formatServicedDate("2026-09-05")).toBe("5 Sep 2026");
});

test("receipt names drop the query string and decode", () => {
  expect(fileNameFromUrl("https://x.blob.core.windows.net/r/My%20receipt.pdf?sv=1&sig=abc", "f")).toBe(
    "My receipt.pdf"
  );
  expect(fileNameFromUrl("https://x.example/", "Receipt 1")).toBe("Receipt 1");
});

test("records without an option name fall back to the category, then the type", () => {
  const base = { ServiceOption: "", ServiceCategory: "", ServiceType: "" };
  expect(recordTitle({ ...base, ServiceOption: "Oil Change", ServiceCategory: "Engine" })).toBe("Oil Change");
  expect(recordTitle({ ...base, ServiceOption: "  ", ServiceCategory: "Engine" })).toBe("Engine");
  expect(recordTitle({ ...base, ServiceType: "WOF" })).toBe("WOF");
  expect(recordTitle(base)).toBe("Untitled record");
});

test("odometer readings format consistently without converting units", () => {
  expect(formatOdometer("41250 km")).toBe("41,250 km");
  expect(formatOdometer("24929 miles")).toBe("24,929 mi");
  expect(formatOdometer("993 hours")).toBe("993 hrs");
  expect(formatOdometer("1 hours")).toBe("1 hr");
  expect(formatOdometer("41250 Km")).toBe("41,250 km");
  expect(formatOdometer("1234.56 km")).toBe("1,234.6 km");
  expect(formatOdometer("41250")).toBe("41,250");
  expect(formatOdometer("41250 furlongs")).toBe("41,250 furlongs");
  expect(formatOdometer("unknown")).toBe("unknown");
  expect(formatOdometer("")).toBe("");
  expect(formatOdometer(undefined)).toBe("");
});

test("the odometer field keeps only a plain number", () => {
  expect(cleanOdometerInput("41,250")).toBe("41250");
  expect(cleanOdometerInput("041250")).toBe("41250");
  expect(cleanOdometerInput("0")).toBe("0");
  expect(cleanOdometerInput("1500.")).toBe("1500.");
  expect(cleanOdometerInput("1,500.5.2")).toBe("1500.52");
  expect(cleanOdometerInput("12a3 km")).toBe("123");
  expect(cleanOdometerInput("")).toBe("");
});

test("the odometer field shows thousands commas", () => {
  expect(groupOdometerInput("1500")).toBe("1,500");
  expect(groupOdometerInput("1234567")).toBe("1,234,567");
  expect(groupOdometerInput("999")).toBe("999");
  expect(groupOdometerInput("41250.5")).toBe("41,250.5");
  expect(groupOdometerInput("1500.")).toBe("1,500.");
  expect(groupOdometerInput("")).toBe("");
});

test("parseOdometer keeps the value and a display unit", () => {
  expect(parseOdometer("24929 miles")).toEqual({ value: 24929, unit: "mi", raw: "24929 miles" });
  expect(parseOdometer("n/a")).toEqual({ value: null, unit: "", raw: "n/a" });
});
