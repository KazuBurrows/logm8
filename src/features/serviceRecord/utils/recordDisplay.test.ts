import { fileNameFromUrl, formatServicedDate, parseServicedDate } from "./recordDisplay";

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
});

test("receipt names drop the query string and decode", () => {
  expect(fileNameFromUrl("https://x.blob.core.windows.net/r/My%20receipt.pdf?sv=1&sig=abc", "f")).toBe(
    "My receipt.pdf"
  );
  expect(fileNameFromUrl("https://x.example/", "Receipt 1")).toBe("Receipt 1");
});
