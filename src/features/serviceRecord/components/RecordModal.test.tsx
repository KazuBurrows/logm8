// fireEvent rather than user-event: user-event resolves a second copy of
// @testing-library/dom whose events aren't wrapped in act().
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RecordModal } from "./RecordModal";
import { shrinkImageToFit } from "../utils/shrinkImage";

const mockUpdateServiceRecord = jest.fn();

// jsdom can't decode or draw images; shrinkImage.test.ts covers the shrinking itself.
jest.mock("../utils/shrinkImage", () => ({ shrinkImageToFit: jest.fn() }));
const mockShrink = shrinkImageToFit as jest.MockedFunction<typeof shrinkImageToFit>;

jest.mock("../api/useServiceRecord", () => ({
  useServiceRecord: () => ({
    loading: false,
    submitRecord: jest.fn(),
    updateServiceRecord: mockUpdateServiceRecord,
  }),
}));

const node = (Id: number, Name: string, Children: ServiceOption[] = [], ServiceTypes: string[] = []) => ({
  Id,
  Name,
  Description: "",
  ServiceTypes,
  Children,
});

const services = [node(1, "Engine", [node(11, "Oil", [node(111, "Oil Change", [], ["Maintenance"])])])];

const receiptA = "https://files.example/receipts/a.pdf";
const receiptB = "https://files.example/receipts/b.pdf";

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
  Comment: "",
  FileUrls: [receiptA, receiptB],
  canEdit: true,
};

function renderEdit() {
  render(
    <MemoryRouter initialEntries={["/log?token=tok"]}>
      <RecordModal
        mode="edit"
        isOpen
        onClose={() => {}}
        recordToEdit={record}
        onUpdate={() => {}}
        logServiceOptions={services}
        logOwnershipOptions={[]}
      />
    </MemoryRouter>
  );
}

async function save(): Promise<FormData> {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  });
  expect(mockUpdateServiceRecord).toHaveBeenCalledTimes(1);
  return mockUpdateServiceRecord.mock.calls[0][0];
}

let alertSpy: jest.SpyInstance;
beforeEach(() => {
  mockUpdateServiceRecord.mockReset().mockResolvedValue(record);
  mockShrink.mockReset().mockImplementation(async (file) => file);
  // The form reports validation problems with alert(); none are expected here.
  alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
});
afterEach(() => {
  expect(alertSpy).not.toHaveBeenCalled();
  alertSpy.mockRestore();
});

test("a removed receipt is sent for deletion when the form is saved", async () => {
  renderEdit();
  fireEvent.click(await screen.findByRole("button", { name: "Remove b.pdf" }));

  expect(screen.queryByRole("link", { name: /b\.pdf/ })).not.toBeInTheDocument();
  expect(screen.getByText("Removed receipts are deleted when you save.")).toBeInTheDocument();
  // Nothing is deleted until the save.
  expect(mockUpdateServiceRecord).not.toHaveBeenCalled();

  const formData = await save();
  expect(formData.getAll("RemoveFileUrls")).toEqual([receiptB]);
});

test("Undo keeps the receipt", async () => {
  renderEdit();
  fireEvent.click(await screen.findByRole("button", { name: "Remove a.pdf" }));
  fireEvent.click(screen.getByRole("button", { name: "Keep a.pdf" }));

  expect(screen.getByRole("link", { name: /a\.pdf/ })).toBeInTheDocument();

  const formData = await save();
  expect(formData.getAll("RemoveFileUrls")).toEqual([]);
});

const MB = 1024 * 1024;

function fileOfSize(name: string, type: string, size: number): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

const pickReceipts = (...files: File[]) =>
  fireEvent.change(screen.getByLabelText("Add receipts"), { target: { files } });

const saveButtonReady = () =>
  waitFor(() => expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled());

test("a photo over 10MB is shrunk and attached instead of refused", async () => {
  const original = fileOfSize("engine-bay.jpg", "image/jpeg", 24 * MB);
  const shrunk = fileOfSize("engine-bay.jpg", "image/jpeg", 4 * MB);
  mockShrink.mockResolvedValue(shrunk);

  renderEdit();
  pickReceipts(original);
  await saveButtonReady();

  expect(mockShrink).toHaveBeenCalledWith(original, 10 * MB);
  const formData = await save();
  const sent = formData.getAll("Files");
  expect(sent).toHaveLength(1);
  expect(sent[0]).toBe(shrunk);
});

test("saving waits until the photos are ready", async () => {
  let finish!: (file: File) => void;
  mockShrink.mockReturnValue(new Promise<File>((resolve) => (finish = resolve)));
  const photo = fileOfSize("pads.jpg", "image/jpeg", 2 * MB);

  renderEdit();
  pickReceipts(photo);

  expect(screen.getByRole("button", { name: "Preparing photos…" })).toBeDisabled();
  await act(async () => finish(photo));
  await saveButtonReady();
});

test("a newer pick replaces one that is still being prepared", async () => {
  let finishFirst!: (file: File) => void;
  const first = fileOfSize("first.jpg", "image/jpeg", 2 * MB);
  const second = fileOfSize("second.jpg", "image/jpeg", 2 * MB);
  mockShrink
    .mockReturnValueOnce(new Promise<File>((resolve) => (finishFirst = resolve)))
    .mockImplementation(async (file) => file);

  renderEdit();
  pickReceipts(first);
  pickReceipts(second);
  await saveButtonReady();
  await act(async () => finishFirst(first));

  const formData = await save();
  const sent = formData.getAll("Files");
  expect(sent).toHaveLength(1);
  expect(sent[0]).toBe(second);
});

test("a file still over 10MB after shrinking is refused", async () => {
  renderEdit();
  pickReceipts(fileOfSize("workshop-manual.pdf", "application/pdf", 12 * MB));

  await waitFor(() =>
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("workshop-manual.pdf"))
  );
  alertSpy.mockClear();

  const formData = await save();
  expect(formData.getAll("Files")).toEqual([]);
});
