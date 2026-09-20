import { useEffect, useState } from "react";

export const SLIDE_MS = 300;

// Full class names so Tailwind can see them.
const SLIDE_CLASSES = {
  right: { shown: "translate-x-0", hidden: "translate-x-full" },
  bottom: { shown: "translate-y-0", hidden: "translate-y-full" },
};

/**
 * Drives a panel that slides in from an edge (the right by default) and back
 * out to it. Render nothing while `mounted` is false, and apply `slideClass`
 * plus `slideStyle` to the panel's root so the transition can play. `shown` is
 * exposed for fading a backdrop in step with the slide.
 */
export function useSlideInPanel(
  isOpen: boolean,
  from: keyof typeof SLIDE_CLASSES = "right"
) {
  const [mounted, setMounted] = useState(isOpen);
  const [shown, setShown] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShown(false);
      setMounted(true);
      // Two frames so the off-screen position is painted before sliding in.
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }

    setShown(false);
    const timer = setTimeout(() => setMounted(false), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const classes = SLIDE_CLASSES[from];

  return {
    mounted,
    shown,
    slideClass: `transition-transform ease-out ${
      shown ? classes.shown : classes.hidden
    }`,
    slideStyle: { transitionDuration: `${SLIDE_MS}ms` },
  };
}
