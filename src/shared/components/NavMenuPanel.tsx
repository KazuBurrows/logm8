import React from "react";
import { BottomSheet, sheetRowClass } from "./BottomSheet";

// Support and About Us are left out: the page footer already links to Support
// and Company (about logm8), so the menu only carries what the footer doesn't.
const NAV_LINKS = [
  { label: "Home", href: "https://logm8.com/" },
  { label: "Shop", href: "https://logm8.com/collections/all" },
  { label: "Contact", href: "https://logm8.com/pages/contact" },
];

export interface NavMenuAction {
  label: string;
  onClick: () => void;
}

export interface NavMenuPanelProps {
  isOpen: boolean;
  /** Should be stable (e.g. useCallback), it is an effect dependency. */
  onClose: () => void;
  /** In-app actions shown above the website links, e.g. "Share read-only link". */
  actions?: NavMenuAction[];
}

/** Compact menu sheet: any in-app actions, then links to the logm8 website. */
export function NavMenuPanel({ isOpen, onClose, actions = [] }: NavMenuPanelProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Menu">
      {actions.length > 0 && (
        <div className="flex flex-col gap-1 pb-2 mb-1 border-b border-line">
          {actions.map(({ label, onClick }) => (
            <button key={label} type="button" onClick={onClick} className={sheetRowClass(false)}>
              <span className="text-fg">{label}</span>
              <span aria-hidden="true" className="text-fg-muted">
                ›
              </span>
            </button>
          ))}
        </div>
      )}
      <nav aria-label="logm8 website" className="flex flex-col gap-1">
        {NAV_LINKS.map(({ label, href }) => (
          <a key={label} href={href} className={sheetRowClass(false)}>
            <span className="text-fg">{label}</span>
            <span aria-hidden="true" className="text-fg-muted">
              ↗
            </span>
          </a>
        ))}
      </nav>
    </BottomSheet>
  );
}
