import { useRef } from "react";

export function useHoldToEdit(callback: () => void, delay = 700) {
  const holdTimer = useRef<NodeJS.Timeout | null>(null);

  const onPointerDown = () => {
    holdTimer.current = setTimeout(() => {
      callback();
    }, delay);
  };

  const onPointerUp = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  return {
    onPointerDown,
    onPointerUp,
    onPointerLeave: onPointerUp,
  };
}
