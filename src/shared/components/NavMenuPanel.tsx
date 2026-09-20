import React from "react";
import { Svg } from "./Svg";
import { useSlideInPanel } from "../hooks/useSlideInPanel";
import { useEscapeAndScrollLock } from "../hooks/useEscapeAndScrollLock";

const NAV_LINKS = [
  { label: "Home", href: "https://logm8.com/", tile: "bg-[#4a5fc9] text-white" },
  { label: "Shop", href: "https://logm8.com/collections/all", tile: "bg-[#e0522f] text-white" },
  { label: "Support", href: "https://logm8.com/pages/support", tile: "bg-white text-slate-900" },
  { label: "About Us", href: "https://logm8.com/pages/about-us", tile: "bg-[#8b5cf6] text-white" },
  { label: "Contact", href: "https://logm8.com/pages/contact", tile: "bg-[#f2c230] text-slate-900" },
];

export interface NavMenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NavMenuPanel({ isOpen, onClose }: NavMenuPanelProps) {
  const { mounted, slideClass, slideStyle } = useSlideInPanel(isOpen);
  useEscapeAndScrollLock(mounted, onClose);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto text-white funnel-display-font bg-gradient-to-b from-zinc-800 via-zinc-900 to-black ${slideClass}`}
      style={slideStyle}
    >
      <div className="max-w-md mx-auto px-4 pt-6 pb-12">
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"
          >
            <span className="rotate-90 flex">
              <Svg type="angle-small-down1" size="lg" color="white" />
            </span>
          </button>
          <h2 className="text-4xl font-light tracking-tight">Menu</h2>
        </div>

        <nav className="flex flex-col gap-3">
          {NAV_LINKS.map(({ label, href, tile }) => (
            <a
              key={label}
              href={href}
              className={`h-24 rounded-3xl p-5 flex items-end justify-between ${tile}`}
            >
              <span className="text-4xl font-light leading-none tracking-tight">
                {label}
              </span>
              <span aria-hidden="true" className="text-2xl leading-none">
                ↗
              </span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
