import { act, render, screen } from "@testing-library/react";
import { PullToRefresh } from "./PullToRefresh";

// jsdom's TouchEvent won't take plain touch points, so build the events by hand.
function touch(type: string, y: number, target: EventTarget = window, x = 100) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "touches", {
    value: type === "touchend" ? [] : [{ clientX: x, clientY: y }],
  });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
}

function drag(fromY: number, toY: number, target: EventTarget = window, toX = 100) {
  touch("touchstart", fromY, target);
  const move = touch("touchmove", toY, target, toX);
  touch("touchend", toY, target);
  return move;
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test("pulling past the trigger refreshes, with the spinner showing until it's done", async () => {
  let finish!: () => void;
  const onRefresh = jest.fn(() => new Promise<void>((resolve) => (finish = resolve)));
  render(<PullToRefresh onRefresh={onRefresh} />);

  const move = drag(100, 300);

  expect(move.defaultPrevented).toBe(true);
  expect(onRefresh).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("status")).toHaveTextContent("Refreshing the log…");

  // A second pull mid-refresh doesn't start another.
  drag(100, 300);
  expect(onRefresh).toHaveBeenCalledTimes(1);

  await act(async () => {
    finish();
    jest.advanceTimersByTime(600);
  });
  expect(screen.getByRole("status")).toHaveTextContent("");
});

test("a short pull, a sideways swipe or a pull inside a dialog doesn't refresh", () => {
  const onRefresh = jest.fn(() => Promise.resolve());
  render(
    <div role="dialog">
      <span data-testid="in-dialog" />
    </div>
  );
  render(<PullToRefresh onRefresh={onRefresh} />);

  drag(100, 200);
  const sideways = drag(100, 150, window, 300);
  const inDialog = drag(100, 300, screen.getByTestId("in-dialog"));

  expect(sideways.defaultPrevented).toBe(false);
  expect(inDialog.defaultPrevented).toBe(false);
  expect(onRefresh).not.toHaveBeenCalled();
});

test("nothing happens once the page is scrolled down", () => {
  const onRefresh = jest.fn(() => Promise.resolve());
  render(<PullToRefresh onRefresh={onRefresh} />);
  Object.defineProperty(window, "scrollY", { value: 200, configurable: true });

  const move = drag(100, 300);

  expect(move.defaultPrevented).toBe(false);
  expect(onRefresh).not.toHaveBeenCalled();
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
});
