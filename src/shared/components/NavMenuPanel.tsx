import React from "react";
import { Panel } from "./Panel";

const NAV_LINKS = [
  { label: "Home", href: "https://logm8.com/" },
  { label: "Shop", href: "https://logm8.com/collections/all" },
  { label: "Support", href: "https://logm8.com/pages/support" },
  { label: "About Us", href: "https://logm8.com/pages/about-us" },
  { label: "Contact", href: "https://logm8.com/pages/contact" },
];

export interface NavMenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NavMenuPanel({ isOpen, onClose }: NavMenuPanelProps) {
  return (
    <Panel isOpen={isOpen} onClose={onClose} title="Menu" closeLabel="Close menu">
      <nav className="flex flex-col gap-3">
        {NAV_LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="h-24 rounded-card p-5 flex items-end justify-between bg-surface border border-line text-fg"
          >
            <span className="text-4xl font-light leading-none tracking-tight">{label}</span>
            <span aria-hidden="true" className="text-2xl leading-none text-fg-muted">
              ↗
            </span>
          </a>
        ))}
      </nav>
    </Panel>
  );
}
