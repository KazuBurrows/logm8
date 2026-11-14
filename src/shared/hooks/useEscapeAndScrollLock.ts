import { useEffect } from "react";

// Shared by every open panel and sheet, so the page unlocks only when the last one closes,
// whatever order they close in. Each one saving and restoring the overflow it found broke
// when they closed out of order: the last to restore could put back another's "hidden".
let lockCount = 0;
let overflowBeforeLock = "";

function lockScroll() {
  if (lockCount++ === 0) {
    overflowBeforeLock = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
}

function unlockScroll() {
  if (--lockCount === 0) document.body.style.overflow = overflowBeforeLock;
}

/** While `active`, close on Escape and stop the page behind from scrolling. */
export function useEscapeAndScrollLock(active: boolean, onClose: () => void) {
  // Keyed on `active` alone, so a new onClose doesn't release and retake the lock.
  useEffect(() => {
    if (!active) return;
    lockScroll();
    return unlockScroll;
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, onClose]);
}
