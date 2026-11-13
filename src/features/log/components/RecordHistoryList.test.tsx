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

test("untitled records show their category and can be found by it", () => {
  render(
    <RecordHistoryList
      serviceRecords={[...records, rec("5", "", "2026-08-01")]}
      openRecord={() => {}}
    />
  );
  // "Engine" is the category the helper gives every record.
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "engine" } });
  expect(rowTitles()).toHaveLength(1);
  expect(rowTitles()[0]).toMatch(/^Engine/);
  expect(rowTitles()[0]).toMatch(/1,000 km/);
});

test("the sort/filter sheet lists each category once, even after records change", () => {
  const { rerender } = render(<RecordHistoryList serviceRecords={records} openRecord={() => {}} />);
  // Each new records array used to append the categories again.
  rerender(<RecordHistoryList serviceRecords={[...records, rec("5", "Spark Plugs", "2026-07-01")]} openRecord={() => {}} />);
  rerender(<RecordHistoryList serviceRecords={[...records]} openRecord={() => {}} />);

  fireEvent.click(screen.getByRole("button", { name: /^Sort and filter/ }));
  const sheet = screen.getByRole("dialog", { name: /sort/i });
  expect(within(sheet).getAllByRole("group", { name: "Engine" })).toHaveLength(1);
  expect(within(sheet).queryByText("Spark Plugs")).not.toBeInTheDocument();
});

test("a service filter for a title that no longer exists is dropped", () => {
  const { rerender } = render(<RecordHistoryList serviceRecords={records} openRecord={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: /^Sort and filter/ }));
  fireEvent.click(within(screen.getByRole("dialog", { name: /sort/i })).getByLabelText(/Chain Lube/));
  expect(rowTitles()).toHaveLength(1);

  // Chain Lube is renamed, so nothing has that title any more.
  rerender(
    <RecordHistoryList
      serviceRecords={records.map((r) => (r.id === "3" ? { ...r, ServiceOption: "Chain Clean" } : r))}
      openRecord={() => {}}
    />
  );
  expect(rowTitles()).toHaveLength(4);
});
