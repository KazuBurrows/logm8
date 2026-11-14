// fireEvent rather than user-event: user-event resolves a second copy of
// @testing-library/dom whose events aren't wrapped in act().
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreateTag, { isSafeRedirectUrl } from "./CreateTag";

const mockConfigureTag = jest.fn();
jest.mock("../api/useLog", () => ({
  useLog: () => ({ configureTag: mockConfigureTag }),
}));

const mockDispatchToast = jest.fn();
jest.mock("../../../shared/components/Toast/toastService", () => ({
  dispatchToast: (...args: unknown[]) => mockDispatchToast(...args),
}));

beforeEach(() => {
  mockConfigureTag.mockReset();
  mockDispatchToast.mockReset();
});

test("submitting sets up the sticker with the setup link's token, never a raw tag ID", async () => {
  // No URL back, so the page stays put (jsdom can't navigate) and says it's done.
  mockConfigureTag.mockResolvedValue(undefined);
  render(
    <MemoryRouter initialEntries={["/tag/create?token=setup-token"]}>
      <CreateTag />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText("Make"), { target: { value: "Honda" } });
  fireEvent.change(screen.getByLabelText("Model"), { target: { value: "CB750" } });
  fireEvent.change(screen.getByLabelText("Year"), { target: { value: "2023" } });
  fireEvent.click(screen.getByRole("button", { name: "Create NFC" }));

  await waitFor(() => expect(mockConfigureTag).toHaveBeenCalledTimes(1));
  const [token, details] = mockConfigureTag.mock.calls[0];
  expect(token).toBe("setup-token");
  expect(details).toMatchObject({ Make: "Honda", Model: "CB750", Year: 2023, Vehicle: "Motorbike" });
  expect(details).not.toHaveProperty("TagId");
  await waitFor(() => expect(mockDispatchToast).toHaveBeenCalledWith(expect.stringMatching(/set up/), "success"));
});

test("redirects only to this site or logm8.com", () => {
  expect(isSafeRedirectUrl("https://app.logm8.com/log?token=t")).toBe(true);
  expect(isSafeRedirectUrl("https://logm8.com/")).toBe(true);
  expect(isSafeRedirectUrl("/log?token=t")).toBe(true);
  expect(isSafeRedirectUrl("https://evil.example/log?token=t")).toBe(false);
  expect(isSafeRedirectUrl("https://logm8.com.evil.example/")).toBe(false);
  expect(isSafeRedirectUrl("javascript:alert(1)")).toBe(false);
});
