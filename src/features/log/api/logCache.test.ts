import {
  applyCanEdit,
  latestLastModified,
  LogCache,
  mergeRecords,
  readLastViewedLog,
  readLogCache,
  writeLogCache,
} from "./logCache";

function record(overrides: Partial<ServiceRecord>): ServiceRecord {
  return {
    id: "r1",
    TagId: "",
    EnteredDate: null,
    LastModified: null,
    ServicedDate: "2026-01-01",
    MechanicName: "",
    Odometer: "",
    ServiceCategory: "",
    ServiceType: "",
    ServiceOption: "",
    Comment: "",
    FileUrls: [],
    ...overrides,
  };
}

function entry(id: string, lastUpdated = ""): LogCache {
  return { id, lastUpdated, logHistory: [record({ id: `${id}-record` })] };
}

beforeEach(() => localStorage.clear());

describe("latestLastModified", () => {
  test("rounds the server's 7-digit fraction down to milliseconds", () => {
    const records = [record({ LastModified: "2026-10-07T03:12:45.1239999Z" })];
    expect(latestLastModified(records)).toBe("2026-10-07T03:12:45.123Z");
  });

  test("picks the newest value and skips missing or invalid ones", () => {
    const records = [
      record({ id: "a", LastModified: "2026-10-07T03:12:45.1000000Z" }),
      record({ id: "b", LastModified: null }),
      record({ id: "c", LastModified: "not-a-date" }),
      record({ id: "d", LastModified: "2026-10-08T00:00:00.0000000Z" }),
    ];
    expect(latestLastModified(records)).toBe("2026-10-08T00:00:00.000Z");
  });

  test("returns an empty string when no record has a LastModified", () => {
    expect(latestLastModified([record({})])).toBe("");
    expect(latestLastModified([])).toBe("");
  });
});

describe("mergeRecords", () => {
  test("upserts by id, keeps cached-only records and sorts by ServicedDate desc", () => {
    const cached = [
      record({ id: "a", ServicedDate: "2026-01-01", Comment: "old" }),
      record({ id: "b", ServicedDate: "2026-03-01" }),
    ];
    const incoming = [
      record({ id: "a", ServicedDate: "2026-01-01", Comment: "edited" }),
      record({ id: "c", ServicedDate: "2026-02-01" }),
    ];

    const merged = mergeRecords(cached, incoming);

    expect(merged.map((r) => r.id)).toEqual(["b", "c", "a"]);
    expect(merged.find((r) => r.id === "a")?.Comment).toBe("edited");
  });

  test("an empty delta leaves the cached records as they were", () => {
    const cached = [record({ id: "a", ServicedDate: "2026-02-01" }), record({ id: "b" })];
    expect(mergeRecords(cached, [])).toEqual(cached);
  });
});

describe("applyCanEdit", () => {
  const records = [
    record({ id: "mine", UserId: "u1", canEdit: false }),
    record({ id: "theirs", UserId: "u2", canEdit: true }),
    record({ id: "legacy", UserId: null, canEdit: true }),
  ];

  test("a service-mode caller can edit only their own records", () => {
    expect(applyCanEdit(records, true, "u1").map((r) => r.canEdit)).toEqual([true, false, false]);
  });

  test("a guest can edit nothing", () => {
    expect(applyCanEdit(records, false, "u1").map((r) => r.canEdit)).toEqual([false, false, false]);
  });

  test("a caller without a user id can edit nothing, including records with no owner", () => {
    expect(applyCanEdit(records, true, null).map((r) => r.canEdit)).toEqual([false, false, false]);
  });
});

describe("log cache storage", () => {
  test("round-trips entries and tracks the last viewed tag", () => {
    writeLogCache(entry("tag+a/1=", "2026-10-07T03:12:45.123Z"));
    writeLogCache(entry("tag-b"));

    expect(readLogCache("tag+a/1=")).toEqual(entry("tag+a/1=", "2026-10-07T03:12:45.123Z"));
    expect(readLastViewedLog()?.id).toBe("tag-b");

    writeLogCache(entry("tag+a/1=", "2026-10-07T03:12:46.000Z"));
    expect(readLastViewedLog()?.lastUpdated).toBe("2026-10-07T03:12:46.000Z");
  });

  test("evicts the least recently viewed tags beyond 20", () => {
    for (let i = 0; i <= 20; i++) writeLogCache(entry(`tag-${i}`));

    expect(readLogCache("tag-0")).toBeNull();
    expect(readLogCache("tag-1")).not.toBeNull();
    expect(readLastViewedLog()?.id).toBe("tag-20");
  });

  test("treats corrupt or malformed entries as missing", () => {
    writeLogCache(entry("tag-a"));
    localStorage.setItem("logm8:log:v2:tag-a", "{not json");
    expect(readLogCache("tag-a")).toBeNull();
    expect(readLastViewedLog()).toBeNull();

    localStorage.setItem(
      "logm8:log:v2:tag-b",
      JSON.stringify({ id: "tag-b", lastUpdated: "garbage", logHistory: [] })
    );
    expect(readLogCache("tag-b")).toBeNull();
  });

  test("returns nothing when no log has been cached", () => {
    expect(readLastViewedLog()).toBeNull();
    expect(readLogCache("tag-a")).toBeNull();
  });
});

test("caches from the old version, which held record tokens, are deleted on first use", () => {
  localStorage.setItem("logm8:log:v1", JSON.stringify(["A"]));
  localStorage.setItem(
    "logm8:log:v1:A",
    JSON.stringify({ id: "A", lastUpdated: "", logHistory: [{ id: "r1", Token: "service-token" }] })
  );
  localStorage.setItem("unrelated", "keep");

  // A fresh copy of the module: the purge runs once per page load.
  jest.isolateModules(() => {
    const fresh = require("./logCache");
    expect(fresh.readLastViewedLog()).toBeNull();
  });

  expect(localStorage.getItem("logm8:log:v1")).toBeNull();
  expect(localStorage.getItem("logm8:log:v1:A")).toBeNull();
  expect(localStorage.getItem("unrelated")).toBe("keep");
});

test("applyCanEdit compares opaque owner keys when the API sends them", () => {
  const records = [
    record({ id: "mine", OwnerKey: "k1", UserId: null }),
    record({ id: "theirs", OwnerKey: "k2", UserId: null }),
    record({ id: "legacy", OwnerKey: null, UserId: null }),
  ];
  expect(applyCanEdit(records, true, "k1", "owner").map((r) => r.canEdit)).toEqual([true, false, false]);
  expect(applyCanEdit(records, false, "k1", "owner").map((r) => r.canEdit)).toEqual([false, false, false]);
  expect(applyCanEdit(records, true, null, "owner").map((r) => r.canEdit)).toEqual([false, false, false]);
});
