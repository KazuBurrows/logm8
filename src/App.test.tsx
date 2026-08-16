import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the home page at / without crashing", async () => {
  window.history.pushState({}, "", "/");
  render(<App />);
  expect(
    await screen.findByText(/your vehicle's digital maintenance logbook/i)
  ).toBeInTheDocument();
});

test("renders NotFound for an unmatched route", async () => {
  window.history.pushState({}, "", "/this-route-does-not-exist");
  render(<App />);
  expect(await screen.findByText(/back to homepage/i)).toBeInTheDocument();
});
