import React from "react";
import { BottomSheet, sheetRowClass } from "./BottomSheet";

// Support and About Us are left out: the page footer already links to Support
// and Company (about logm8), so the menu only carries what the footer doesn't.
const NAV_LINKS = [
  { label: "Home", href: "https://logm8.com/" },
  { label: "Shop", href: "https://logm8.com/collections/all" },
  { label: "Contact", href: "https://logm8.com/pages/contact" },
];

export interface NavMenuPanelProps {
  isOpen: boolean;
  /** Should be stable (e.g. useCallback), it is an effect dependency. */
  onClose: () => void;
}

/** Compact menu sheet with links to the logm8 website. */
export function NavMenuPanel({ isOpen, onClose }: NavMenuPanelProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Menu">
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
