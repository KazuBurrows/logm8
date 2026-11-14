import { render, screen } from "@testing-library/react";
import App from "./App";

// Routes are lazy-loaded; under a full parallel test run the chunk can take
// longer than findBy's 1s default to resolve.
const LAZY_ROUTE = { timeout: 5000 };

test("renders the home page at / without crashing", async () => {
  window.history.pushState({}, "", "/");
  render(<App />);
  expect(
    await screen.findByText(/your vehicle's digital maintenance logbook/i, {}, LAZY_ROUTE)
  ).toBeInTheDocument();
});

test("renders NotFound for an unmatched route", async () => {
  window.history.pushState({}, "", "/this-route-does-not-exist");
  render(<App />);
  expect(await screen.findByText(/back to homepage/i, {}, LAZY_ROUTE)).toBeInTheDocument();
});
