import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";

function Bomb(): JSX.Element {
  throw new Error("boom");
}

test("renders children when there is no error", () => {
  render(
    <ErrorBoundary>
      <div>safe content</div>
    </ErrorBoundary>
  );
  expect(screen.getByText("safe content")).toBeInTheDocument();
});

test("renders a fallback when a child throws", () => {
  const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

  render(
    <ErrorBoundary>
      <Bomb />
    </ErrorBoundary>
  );

  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  consoleError.mockRestore();
});
