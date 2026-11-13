import React from "react";

export interface IconButtonProps {
  /** Accessible name; required because the button has no visible text. */
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}

/** Round, icon-only button with a 44x44px tap target. */
export const IconButton = ({ label, onClick, className = "", children }: IconButtonProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    className={`w-11 h-11 shrink-0 rounded-full bg-raised border border-line text-fg flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
  >
    {children}
  </button>
);
