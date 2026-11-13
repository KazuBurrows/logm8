// fireEvent rather than user-event: user-event resolves a second copy of
// @testing-library/dom whose events aren't wrapped in act().
import { fireEvent, render, screen, within } from "@testing-library/react";
import { RecordHistoryList } from "./RecordHistoryList";

const rec = (id: string, ServiceOption: string, ServicedDate: string, ServiceType = "Maintenance") =>
  ({
    id,
    ServiceOption,
    ServicedDate,
    ServiceType,
    ServiceCategory: "Engine",
    Odometer: "1000 km",
    FileUrls: [],
  } as unknown as ServiceRecord);

const records = [
  rec("1", "Oil Change", "2026-10-28"),
  rec("2", "Front Brake Pads", "2026-10-02", "Replacement"),
  rec("3", "Chain Lube", "2026-09-15"),
  rec("4", "Rear Brake Pads", "2025-01-10", "Inspection"),
];

function renderList() {
  const openRecord = jest.fn();
  render(<RecordHistoryList serviceRecords={records} openRecord={openRecord} />);
  return { openRecord };
}

const rowTitles = () =>
  screen.queryAllByRole("listitem").map((li) => within(li).getByRole("button").textContent);

test("groups records under month headings, newest first", () => {
  renderList();
  expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.firstChild?.textContent)).toEqual([
    "October 2026",
    "September 2026",
    "January 2025",
  ]);
  const october = screen.getByRole("region", { name: /October 2026/ });
  expect(within(october).getAllByRole("listitem")).toHaveLength(2);
});

test("search filters by title and works with the type chips", () => {
  renderList();
  fireEvent.change(screen.getByRole("searchbox", { name: "Search records by title" }), {
    target: { value: "brake" },
  });
  expect(rowTitles()).toHaveLength(2);
  expect(rowTitles().every((t) => /Brake Pads/.test(t ?? ""))).toBe(true);

  fireEvent.click(screen.getByRole("button", { name: "Replacement", pressed: false }));
  expect(rowTitles()).toHaveLength(1);
  expect(rowTitles()[0]).toMatch(/Front Brake Pads/);
});

test("no matches shows a message and a way to clear the search", () => {
  renderList();
  const search = screen.getByRole("searchbox");
  fireEvent.change(search, { target: { value: "turbo" } });
  expect(screen.getByRole("heading", { name: "No records match “turbo”." })).toBeInTheDocument();

  fireEvent.click(screen.getAllByRole("button", { name: "Clear search" })[0]);
  expect(search).toHaveValue("");
  expect(search).toHaveFocus();
  expect(rowTitles()).toHaveLength(4);
});

test("tapping a row opens that record", () => {
  const { openRecord } = renderList();
  fireEvent.click(screen.getByRole("button", { name: /Chain Lube/ }));
  expect(openRecord).toHaveBeenCalledWith(records[2]);
});
