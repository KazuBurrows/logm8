// fireEvent rather than user-event: user-event resolves a second copy of
// @testing-library/dom whose events aren't wrapped in act().
import { act, fireEvent, render, screen } from "@testing-library/react";
import { RecordDetail } from "./RecordDetail";

const record: ServiceRecord = {
  id: "r1",
  TagId: "t1",
  EnteredDate: null,
  LastModified: null,
  ServicedDate: "2026-10-28",
  MechanicName: "Bruce McLaren",
  Odometer: "41250 km",
  ServiceCategory: "Engine",
  ServiceType: "Maintenance",
  ServiceOption: "Oil Change",
  Comment: "Mobil 1 10w-40",
  FileUrls: ["https://files.example/receipts/invoice-1.pdf?sig=secret"],
  canEdit: true,
};

function renderDetail(props: Partial<React.ComponentProps<typeof RecordDetail>> = {}) {
  const onEdit = jest.fn();
  const onDelete = jest.fn(() => Promise.resolve());
  render(
    <RecordDetail
      isOpen
      onClose={() => {}}
      record={record}
      categoryPath={["Engine", "Oil", "Oil Change"]}
      canEdit
      onEdit={onEdit}
      onDelete={onDelete}
      {...props}
    />
  );
  return { onEdit, onDelete };
}

test("shows the record's details read-only", async () => {
  renderDetail();
  // findBy lets the panel's slide-in frame settle inside act().
  expect(await screen.findByRole("dialog", { name: "Oil Change" })).toBeInTheDocument();
  expect(screen.getByText("28 October 2026")).toBeInTheDocument();
  expect(screen.getByText("Bruce McLaren")).toBeInTheDocument();
  expect(screen.getByText("41,250 km")).toBeInTheDocument();
  expect(
    screen.getByText((_, el) => el?.tagName === "DD" && el.textContent === "Engine›Oil›Oil Change")
  ).toBeInTheDocument();
  expect(screen.getByText("Maintenance")).toBeInTheDocument();
  expect(screen.getByText("Mobil 1 10w-40")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /invoice-1\.pdf/ })).toHaveAttribute("target", "_blank");
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
});

test("Edit opens the form", async () => {
  const { onEdit } = renderDetail();
  fireEvent.click(await screen.findByRole("button", { name: "Edit" }));
  expect(onEdit).toHaveBeenCalledTimes(1);
});

test("no Edit or Delete button for a record the viewer can't edit", async () => {
  renderDetail({ canEdit: false });
  await screen.findByRole("dialog");
  expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
});

test("Delete asks first, and only deletes once confirmed", async () => {
  const { onDelete } = renderDetail();
  fireEvent.click(await screen.findByRole("button", { name: "Delete" }));

  expect(await screen.findByRole("dialog", { name: "Delete this record?" })).toBeInTheDocument();
  expect(screen.getByText(/along with its receipts/)).toBeInTheDocument();
  expect(onDelete).not.toHaveBeenCalled();

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Delete record" }));
  });
  expect(onDelete).toHaveBeenCalledTimes(1);
});

test("Cancel leaves the record alone", async () => {
  const { onDelete } = renderDetail();
  fireEvent.click(await screen.findByRole("button", { name: "Delete" }));
  fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));
  expect(onDelete).not.toHaveBeenCalled();
});

test("a failed delete keeps the confirmation open to try again", async () => {
  renderDetail({ onDelete: () => Promise.reject(new Error("network")) });
  fireEvent.click(await screen.findByRole("button", { name: "Delete" }));

  await act(async () => {
    fireEvent.click(await screen.findByRole("button", { name: "Delete record" }));
  });

  expect(screen.getByRole("dialog", { name: "Delete this record?" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Delete record" })).toBeEnabled();
});

test("empty fields say so instead of rendering blank", async () => {
  renderDetail({ record: { ...record, MechanicName: "", Comment: "", FileUrls: [] } });
  await screen.findByRole("dialog");
  expect(screen.getByText("No comment")).toBeInTheDocument();
  expect(screen.getByText("No receipts")).toBeInTheDocument();
  expect(screen.getByText("Not recorded")).toBeInTheDocument();
});

test("a record without an option name is titled by its category", async () => {
  renderDetail({ record: { ...record, ServiceOption: "" } });
  expect(await screen.findByRole("dialog", { name: "Engine" })).toBeInTheDocument();
});
