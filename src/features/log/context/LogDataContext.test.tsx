import { act, render, screen, waitFor } from "@testing-library/react";
import { LogDataProvider, useLogData } from "./LogDataContext";
import { readLogCache, writeLogCache } from "../api/logCache";

const mockGetLogData = jest.fn();
const mockGetServiceRecordHierarchy = jest.fn();

jest.mock("../api/useLog", () => ({
  useLog: () => ({
    getLogData: mockGetLogData,
    getServiceRecordHierarchy: mockGetServiceRecordHierarchy,
  }),
}));

const onNotFound = jest.fn();

function Probe() {
  const { isRetrievingData, isCheckingForUpdates, tag, serviceRecords, refresh } = useLogData();
  return (
    <>
      <div data-testid="log">
        {JSON.stringify({
          isRetrievingData,
          isCheckingForUpdates,
          tagId: tag.Id,
          ids: serviceRecords.map((r) => r.id),
        })}
      </div>
      <button onClick={() => refresh()}>refresh</button>
    </>
  );
}

function renderLog() {
  render(
    <LogDataProvider token="tok" onNotFound={onNotFound}>
      <Probe />
    </LogDataProvider>
  );
}

const state = () => JSON.parse(screen.getByTestId("log").textContent ?? "{}");

function cachedRecord(id: string, lastModified: string, servicedDate: string): ServiceRecord {
  return {
    id,
    TagId: "",
    EnteredDate: null,
    LastModified: lastModified,
    ServicedDate: servicedDate,
    MechanicName: "",
    Odometer: "",
    ServiceCategory: "",
    ServiceType: "",
    ServiceOption: "",
    Comment: "",
    FileUrls: [],
    UserId: "u1",
    canEdit: true,
  };
}

function serverRecord(id: string, lastModified: string, servicedDate: string) {
  return { id, LastModified: lastModified, ServicedDate: servicedDate, UserId: "u1", CanEdit: true };
}

// Without recordIds it's an older server's response, which never drops a record.
function response(tagId: string, records: object[], recordIds?: string[]) {
  return { tag: { id: tagId }, records, mode: 0, userId: "u1", ...(recordIds && { recordIds }) };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  localStorage.clear();
  mockGetLogData.mockReset();
  mockGetServiceRecordHierarchy.mockReset().mockResolvedValue({ MotorbikeOptions: [], OwnershipOptions: [] });
  onNotFound.mockReset();
});

test("a delta for the last viewed tag is merged from a single request", async () => {
  writeLogCache({
    id: "A",
    lastUpdated: "2026-10-01T00:00:00.000Z",
    logHistory: [cachedRecord("a1", "2026-10-01T00:00:00.0000000Z", "2026-01-01")],
  });
  mockGetLogData.mockResolvedValueOnce(
    response("A", [serverRecord("a2", "2026-10-02T00:00:00.0000000Z", "2026-02-01")])
  );

  renderLog();

  await waitFor(() => expect(state().isRetrievingData).toBe(false));
  expect(mockGetLogData).toHaveBeenCalledTimes(1);
  expect(mockGetLogData).toHaveBeenCalledWith("tok", "2026-10-01T00:00:00.000Z");
  expect(state()).toMatchObject({ isCheckingForUpdates: false, tagId: "A", ids: ["a2", "a1"] });
  expect(readLogCache("A")?.lastUpdated).toBe("2026-10-02T00:00:00.000Z");
});

test("a visit drops cached records the server no longer has", async () => {
  writeLogCache({
    id: "A",
    lastUpdated: "2026-10-01T00:00:00.000Z",
    logHistory: [
      cachedRecord("a1", "2026-10-01T00:00:00.0000000Z", "2026-02-01"),
      cachedRecord("a0", "2026-09-01T00:00:00.0000000Z", "2026-01-01"),
    ],
  });
  mockGetLogData.mockResolvedValueOnce(
    response("A", [serverRecord("a1", "2026-10-01T00:00:00.0000000Z", "2026-02-01")], ["a1"])
  );

  renderLog();

  await waitFor(() => expect(state().isRetrievingData).toBe(false));
  expect(state().ids).toEqual(["a1"]);
  expect(readLogCache("A")?.logHistory.map((r) => r.id)).toEqual(["a1"]);
});

test("refresh drops a record deleted since the last sync", async () => {
  mockGetLogData.mockResolvedValueOnce(
    response("A", [
      serverRecord("a2", "2026-10-02T00:00:00.0000000Z", "2026-02-01"),
      serverRecord("a1", "2026-10-01T00:00:00.0000000Z", "2026-01-01"),
    ])
  );

  renderLog();
  await waitFor(() => expect(state().isRetrievingData).toBe(false));

  mockGetLogData.mockResolvedValueOnce(
    response("A", [serverRecord("a2", "2026-10-02T00:00:00.0000000Z", "2026-02-01")], ["a2"])
  );
  await act(async () => screen.getByRole("button", { name: "refresh" }).click());

  expect(state().ids).toEqual(["a2"]);
  expect(readLogCache("A")?.logHistory.map((r) => r.id)).toEqual(["a2"]);
});

test("refresh merges changes since the last sync, and a failed one keeps the log showing", async () => {
  const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  mockGetLogData.mockResolvedValueOnce(
    response("A", [serverRecord("a1", "2026-10-01T00:00:00.0000000Z", "2026-01-01")])
  );

  renderLog();
  await waitFor(() => expect(state().isRetrievingData).toBe(false));

  mockGetLogData.mockResolvedValueOnce(
    response("A", [
      serverRecord("a1", "2026-10-01T00:00:00.0000000Z", "2026-01-01"),
      serverRecord("a2", "2026-10-03T00:00:00.0000000Z", "2026-02-01"),
    ])
  );
  await act(async () => screen.getByRole("button", { name: "refresh" }).click());

  expect(mockGetLogData).toHaveBeenLastCalledWith("tok", "2026-10-01T00:00:00.000Z");
  expect(state().ids).toEqual(["a2", "a1"]);
  expect(readLogCache("A")?.lastUpdated).toBe("2026-10-03T00:00:00.000Z");

  mockGetLogData.mockRejectedValueOnce(new Error("network"));
  await act(async () => screen.getByRole("button", { name: "refresh" }).click());

  expect(mockGetLogData).toHaveBeenLastCalledWith("tok", "2026-10-03T00:00:00.000Z");
  expect(state().ids).toEqual(["a2", "a1"]);
  expect(onNotFound).not.toHaveBeenCalled();
  consoleError.mockRestore();
});

test("switching to a cached tag shows its records while its own changes load", async () => {
  writeLogCache({
    id: "B",
    lastUpdated: "2026-09-01T00:00:00.000Z",
    logHistory: [cachedRecord("b1", "2026-09-01T00:00:00.0000000Z", "2026-01-01")],
  });
  writeLogCache({
    id: "A",
    lastUpdated: "2026-10-01T00:00:00.000Z",
    logHistory: [cachedRecord("a1", "2026-10-01T00:00:00.0000000Z", "2026-01-01")],
  });
  const delta = deferred<object>();
  mockGetLogData
    .mockResolvedValueOnce(response("B", [serverRecord("b3", "2026-10-05T00:00:00.0000000Z", "2026-03-01")]))
    .mockReturnValueOnce(delta.promise);

  renderLog();

  await waitFor(() => expect(state().isCheckingForUpdates).toBe(true));
  expect(state()).toMatchObject({ isRetrievingData: false, tagId: "B", ids: ["b3", "b1"] });
  expect(mockGetLogData).toHaveBeenLastCalledWith("tok", "2026-09-01T00:00:00.000Z");
  // Nothing is written mid-check, so B's cache still points at its last full sync.
  expect(readLogCache("B")).toMatchObject({ lastUpdated: "2026-09-01T00:00:00.000Z", logHistory: [{ id: "b1" }] });

  await act(async () =>
    delta.resolve(
      response("B", [
        serverRecord("b2", "2026-09-15T00:00:00.0000000Z", "2026-02-01"),
        serverRecord("b3", "2026-10-05T00:00:00.0000000Z", "2026-03-01"),
      ])
    )
  );

  expect(state()).toMatchObject({ isCheckingForUpdates: false, ids: ["b3", "b2", "b1"] });
  expect(readLogCache("B")?.lastUpdated).toBe("2026-10-05T00:00:00.000Z");
});

test("switching to a tag this device hasn't cached keeps the loader until the full fetch", async () => {
  writeLogCache({
    id: "A",
    lastUpdated: "2026-10-01T00:00:00.000Z",
    logHistory: [cachedRecord("a1", "2026-10-01T00:00:00.0000000Z", "2026-01-01")],
  });
  const full = deferred<object>();
  mockGetLogData
    .mockResolvedValueOnce(response("C", [serverRecord("c2", "2026-10-05T00:00:00.0000000Z", "2026-02-01")]))
    .mockReturnValueOnce(full.promise);

  renderLog();

  await waitFor(() => expect(mockGetLogData).toHaveBeenCalledTimes(2));
  expect(mockGetLogData).toHaveBeenLastCalledWith("tok");
  expect(state()).toMatchObject({ isRetrievingData: true, isCheckingForUpdates: false, ids: [] });

  await act(async () =>
    full.resolve(
      response("C", [
        serverRecord("c2", "2026-10-05T00:00:00.0000000Z", "2026-02-01"),
        serverRecord("c1", "2026-08-01T00:00:00.0000000Z", "2026-01-01"),
      ])
    )
  );

  expect(state()).toMatchObject({ isRetrievingData: false, tagId: "C", ids: ["c2", "c1"] });
  expect(readLogCache("C")?.lastUpdated).toBe("2026-10-05T00:00:00.000Z");
});

test("if the update check fails, the cached records stay and the next visit retries from the same point", async () => {
  const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  writeLogCache({
    id: "B",
    lastUpdated: "2026-09-01T00:00:00.000Z",
    logHistory: [cachedRecord("b1", "2026-09-01T00:00:00.0000000Z", "2026-01-01")],
  });
  writeLogCache({
    id: "A",
    lastUpdated: "2026-10-01T00:00:00.000Z",
    logHistory: [cachedRecord("a1", "2026-10-01T00:00:00.0000000Z", "2026-01-01")],
  });
  mockGetLogData
    .mockResolvedValueOnce(response("B", [serverRecord("b3", "2026-10-05T00:00:00.0000000Z", "2026-03-01")]))
    .mockRejectedValueOnce(new Error("network"));

  renderLog();

  // The cache is only written once the check has ended.
  await waitFor(() => expect(readLogCache("B")?.logHistory.map((r) => r.id)).toEqual(["b3", "b1"]));
  expect(readLogCache("B")?.lastUpdated).toBe("2026-09-01T00:00:00.000Z");
  expect(state()).toMatchObject({ isRetrievingData: false, isCheckingForUpdates: false, tagId: "B" });
  expect(onNotFound).not.toHaveBeenCalled();
  consoleError.mockRestore();
});
