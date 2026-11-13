import React, { useId } from "react";
import { Svg } from "./Svg";
import { IconButton } from "./IconButton";
import { AmbientGlow } from "./AmbientGlow";
import { useSlideInPanel } from "../hooks/useSlideInPanel";
import { useEscapeAndScrollLock } from "../hooks/useEscapeAndScrollLock";

export interface PanelProps {
  isOpen: boolean;
  /** Should be stable (e.g. useCallback), it is an effect dependency. */
  onClose: () => void;
  title: React.ReactNode;
  /** Accessible name for the back button. */
  closeLabel?: string;
  /** Pinned to the bottom of the screen, in thumb reach, e.g. a primary action. */
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Full-screen panel that slides in from the right, with a back button and a
 * title. The shared shell for the log page's secondary screens.
 */
export function Panel({
  isOpen,
  onClose,
  title,
  closeLabel = "Close",
  footer,
  children,
}: PanelProps) {
  const { mounted, slideClass, slideStyle } = useSlideInPanel(isOpen);
  useEscapeAndScrollLock(mounted, onClose);
  const titleId = useId();

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      className={`fixed inset-0 z-50 flex flex-col overflow-y-auto overflow-x-hidden bg-canvas text-fg funnel-display-font ${slideClass}`}
      style={slideStyle}
    >
      <AmbientGlow />
      <div className="relative w-full max-w-md mx-auto flex-1 px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-12">
        <div className="flex items-center gap-4 mb-6">
          <IconButton label={closeLabel} onClick={onClose}>
            <span className="rotate-90 flex">
              <Svg type="angle-small-down1" size="lg" color="current" />
            </span>
          </IconButton>
          <h2 id={titleId} className="text-3xl font-light tracking-tight min-w-0">
            {title}
          </h2>
        </div>
        {children}
      </div>
      {footer && (
        <div className="sticky bottom-0 w-full bg-canvas/90 backdrop-blur-md border-t border-line">
          <div className="max-w-md mx-auto px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        </div>
      )}
    </div>
  );
}
