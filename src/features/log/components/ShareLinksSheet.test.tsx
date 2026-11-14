// fireEvent rather than user-event: user-event resolves a second copy of
// @testing-library/dom whose events aren't wrapped in act().
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { ShareLinksSheet } from "./ShareLinksSheet";
import { ShareLink } from "../utils/shareLinks";

const mockList = jest.fn();
const mockCreate = jest.fn();
const mockRevoke = jest.fn();
jest.mock("../api/useShareLinks", () => ({
  useShareLinks: () => ({
    listShareLinks: mockList,
    createShareLink: mockCreate,
    revokeShareLink: mockRevoke,
  }),
}));

jest.mock("../../../shared/components/Toast/toastService", () => ({ dispatchToast: jest.fn() }));

const inDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString();
const link = (token: string, days: number): ShareLink => ({
  url: `https://app.logm8.com/log?token=${token}`,
  token,
  expiresAt: inDays(days),
});

beforeEach(() => {
  mockList.mockReset();
  mockCreate.mockReset();
  mockRevoke.mockReset().mockResolvedValue(undefined);
});

function renderSheet() {
  render(<ShareLinksSheet isOpen onClose={() => {}} token="service-token" />);
  return screen.findByRole("dialog", { name: "Share read-only link" });
}

test("creates a 7-day link by default and shows it ready to copy", async () => {
  mockList.mockResolvedValue([]);
  mockCreate.mockResolvedValue(link("new", 7));
  const sheet = await renderSheet();

  await waitFor(() => expect(within(sheet).getByText("No active links.")).toBeInTheDocument());
  expect(within(sheet).getByLabelText("7 days")).toBeChecked();

  fireEvent.click(within(sheet).getByRole("button", { name: "Create link" }));

  await waitFor(() => expect(mockCreate).toHaveBeenCalledWith(7));
  expect(await within(sheet).findByDisplayValue("https://app.logm8.com/log?token=new")).toBeInTheDocument();
  expect(within(sheet).getByRole("button", { name: /Revoke read-only link/ })).toBeInTheDocument();
});

test("revoking removes the link", async () => {
  mockList.mockResolvedValue([link("a", 7)]);
  const sheet = await renderSheet();

  fireEvent.click(await within(sheet).findByRole("button", { name: /Revoke read-only link/ }));

  await waitFor(() => expect(mockRevoke).toHaveBeenCalledWith("a"));
  expect(await within(sheet).findByText("No active links.")).toBeInTheDocument();
});

test("at five active links, creating is disabled; guest scans don't count", async () => {
  const scan: ShareLink = { url: "u", token: "scan", expiresAt: new Date(Date.now() + 20 * 60000).toISOString() };
  mockList.mockResolvedValue([scan, ...["1", "2", "3", "4"].map((t) => link(t, 7))]);
  const sheet = await renderSheet();
  await within(sheet).findByText("Guest scan");
  expect(within(sheet).getByRole("button", { name: "Create link" })).toBeEnabled();

  mockList.mockResolvedValue([scan, ...["1", "2", "3", "4", "5"].map((t) => link(t, 7))]);
  render(<ShareLinksSheet isOpen onClose={() => {}} token="service-token" />);
  const sheets = await screen.findAllByRole("dialog", { name: "Share read-only link" });
  const full = sheets[sheets.length - 1];
  await waitFor(() => expect(within(full).getByRole("button", { name: "Create link" })).toBeDisabled());
  expect(within(full).getByText(/Revoke one to make another/)).toBeInTheDocument();
});
