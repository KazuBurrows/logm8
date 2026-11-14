import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Svg } from "./Svg";
import { IconButton } from "./IconButton";
import { useSlideInPanel } from "../hooks/useSlideInPanel";
import { useEscapeAndScrollLock } from "../hooks/useEscapeAndScrollLock";

export interface BottomSheetProps {
  isOpen: boolean;
  /** Should be stable (e.g. useCallback), it is an effect dependency. */
  onClose: () => void;
  title: string;
  /** Pinned below the scrolling list, e.g. a Done button. */
  footer?: React.ReactNode;
  /** The row marked `data-selected="true"` is scrolled into view on open. */
  children: React.ReactNode;
}

/**
 * A sheet that slides up over a dimmed backdrop. Portalled to the body so it
 * isn't positioned inside a transformed parent such as a sliding panel.
 */
export function BottomSheet({ isOpen, onClose, title, footer, children }: BottomSheetProps) {
  const { mounted, shown, slideClass, slideStyle } = useSlideInPanel(isOpen, "bottom");
  useEscapeAndScrollLock(mounted, onClose);

  const titleId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (shown) {
      listRef.current
        ?.querySelector('[data-selected="true"]')
        ?.scrollIntoView({ block: "center" });
    }
  }, [shown]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] text-fg funnel-display-font">
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-labelledby={titleId}
        className={`absolute inset-x-0 bottom-0 mx-auto max-w-md max-h-[75vh] flex flex-col rounded-t-sheet bg-surface border-t border-line ${slideClass}`}
        style={slideStyle}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 id={titleId} className="text-2xl font-light tracking-tight">{title}</h3>
          <IconButton label="Close" onClick={onClose}>
            <Svg type="cross" size="sm" color="current" />
          </IconButton>
        </div>
        <div
          ref={listRef}
          className="overflow-y-auto overscroll-contain px-3 pb-3 flex flex-col gap-1"
        >
          {children}
        </div>
        <div className="px-3 pt-1 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {footer}
        </div>
      </div>
    </div>,
    document.body
  );
}

/** Tap-friendly row for use inside a BottomSheet. */
export const sheetRowClass = (active: boolean) =>
  `w-full min-h-14 flex items-center justify-between gap-3 rounded-card px-4 py-3 text-left text-lg font-light ${
    active ? "bg-accent text-accent-fg" : "text-fg-soft active:bg-raised"
  }`;
