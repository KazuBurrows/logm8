import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecordDetail } from "./RecordDetail";

const record: ServiceRecord = {
  Token: "",
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
  render(
    <RecordDetail
      isOpen
      onClose={() => {}}
      record={record}
      categoryPath={["Engine", "Oil", "Oil Change"]}
      canEdit
      onEdit={onEdit}
      {...props}
    />
  );
  return { onEdit };
}

test("shows the record's details read-only", () => {
  renderDetail();
  expect(screen.getByRole("dialog", { name: "Oil Change" })).toBeInTheDocument();
  expect(screen.getByText("28 October 2026")).toBeInTheDocument();
  expect(screen.getByText("Bruce McLaren")).toBeInTheDocument();
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
  await userEvent.click(screen.getByRole("button", { name: "Edit" }));
  expect(onEdit).toHaveBeenCalledTimes(1);
});

test("no Edit button for a record the viewer can't edit", () => {
  renderDetail({ canEdit: false });
  expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
});

test("empty fields say so instead of rendering blank", () => {
  renderDetail({ record: { ...record, MechanicName: "", Comment: "", FileUrls: [] } });
  expect(screen.getByText("No comment")).toBeInTheDocument();
  expect(screen.getByText("No receipts")).toBeInTheDocument();
  expect(screen.getByText("Not recorded")).toBeInTheDocument();
});
