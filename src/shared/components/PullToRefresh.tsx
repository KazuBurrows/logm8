import { useEffect, useRef, useState } from "react";
import { Svg } from "./Svg";

export interface PullToRefreshProps {
  /** Runs when a pull is let go past the trigger point; the spinner stays until it settles. */
  onRefresh: () => Promise<unknown>;
}

const TRIGGER = 64; // px the indicator travels before letting go refreshes
const MAX_PULL = 96;
const RESISTANCE = 0.5; // the indicator moves half as far as the finger
const MIN_SPIN_MS = 600; // so a quick refresh still reads as one

type Phase = "idle" | "pulling" | "refreshing" | "done";

/**
 * Pull down from the top of the page to refresh. The installed (standalone) app has no
 * browser pull-to-refresh, so this stands in for it everywhere. Touches inside a dialog
 * (panels, sheets) are left alone, since those scroll on their own.
 */
export function PullToRefresh({ onRefresh }: PullToRefreshProps) {
  const [pull, setPull] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");

  // Read at release time, so the listeners below never need re-adding.
  const onRefreshRef = useRef(onRefresh);
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    let start: { x: number; y: number } | null = null;
    let engaged = false;
    let distance = 0;
    let busy = false;

    const reset = () => {
      start = null;
      engaged = false;
      distance = 0;
    };

    const onTouchStart = (e: TouchEvent) => {
      reset();
      if (busy || e.touches.length !== 1 || window.scrollY > 0) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest('[role="dialog"]') || document.body.style.overflow === "hidden") return;
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!start) return;
      const dx = e.touches[0].clientX - start.x;
      const dy = e.touches[0].clientY - start.y;
      if (!engaged) {
        if (dx === 0 && dy === 0) return;
        // Scrolling up or swiping sideways: the browser keeps this gesture.
        if (dy <= Math.abs(dx) || window.scrollY > 0) {
          start = null;
          return;
        }
        engaged = true;
        setPhase("pulling");
      }
      // Stops the page bouncing (and any browser pull-to-refresh) under the indicator.
      if (e.cancelable) e.preventDefault();
      distance = Math.min(MAX_PULL, Math.max(0, dy) * RESISTANCE);
      setPull(distance);
    };

    const onTouchEnd = async () => {
      const shouldRefresh = engaged && distance >= TRIGGER;
      const wasEngaged = engaged;
      reset();
      if (!wasEngaged) return;
      if (!shouldRefresh) {
        setPhase("idle");
        setPull(0);
        return;
      }
      busy = true;
      setPhase("refreshing");
      setPull(TRIGGER);
      await Promise.all([
        onRefreshRef.current().catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, MIN_SPIN_MS)),
      ]);
      busy = false;
      // "done" keeps the spinner (not the arrow) showing while it slides away.
      setPhase("done");
      setPull(0);
    };

    const onTouchCancel = () => {
      if (engaged) {
        setPhase("idle");
        setPull(0);
      }
      reset();
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchCancel);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
    };
  }, []);

  const progress = Math.min(1, pull / TRIGGER);
  const showSpinner = phase === "refreshing" || phase === "done";

  return (
    <>
      {/* Rests in the empty middle of the log page's top bar, above it (z-40) and below panels (z-50). */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed left-1/2 top-[calc(0.75rem+env(safe-area-inset-top))] z-[45] ${
          phase === "pulling" ? "" : "transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none"
        }`}
        style={{
          transform: `translate(-50%, ${pull - TRIGGER}px) scale(${0.6 + 0.4 * progress})`,
          opacity: progress,
        }}
      >
        <div className="w-10 h-10 rounded-full bg-raised border border-line shadow-lg shadow-black/50 flex items-center justify-center text-fg">
          {showSpinner ? (
            <span className="h-5 w-5 rounded-full border-2 border-line border-t-accent animate-spin" />
          ) : (
            // Flips to point up once letting go will refresh.
            <span
              className={`flex transition-transform duration-200 motion-reduce:transition-none ${
                pull >= TRIGGER ? "rotate-180" : ""
              }`}
            >
              <Svg type="angle-small-down1" size="md" color="current" />
            </span>
          )}
        </div>
      </div>
      <p className="sr-only" role="status">
        {phase === "refreshing" ? "Refreshing the log…" : ""}
      </p>
    </>
  );
}
