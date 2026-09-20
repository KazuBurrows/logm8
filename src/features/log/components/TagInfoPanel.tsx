import React from "react";
import { Svg } from "../../../shared/components/Svg";
import { Tile } from "../../../shared/components/Tile";
import { useSlideInPanel } from "../../../shared/hooks/useSlideInPanel";
import { useEscapeAndScrollLock } from "../../../shared/hooks/useEscapeAndScrollLock";

/** Fuel arrives either as an array or as a JSON-encoded string. */
const parseFuel = (fuel: unknown): string[] => {
  if (Array.isArray(fuel)) return fuel;
  if (typeof fuel === "string" && fuel !== "") {
    try {
      const parsed = JSON.parse(fuel);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const orDash = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === "" ? "—" : String(value);

interface InfoTileProps {
  label: string;
  value: string;
  className?: string;
}

const InfoTile = ({ label, value, className = "" }: InfoTileProps) => (
  <Tile className={`p-4 ${className}`}>
    <div className="text-sm text-white/50 leading-none mb-2">{label}</div>
    <div className="text-2xl font-light leading-tight break-words">{value}</div>
  </Tile>
);

export interface TagInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tag: ServiceTag;
}

export function TagInfoPanel({ isOpen, onClose, tag }: TagInfoPanelProps) {
  const { mounted, slideClass, slideStyle } = useSlideInPanel(isOpen);
  useEscapeAndScrollLock(mounted, onClose);

  if (!mounted) return null;

  const fuel = parseFuel(tag.Fuel);

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
            aria-label="Close vehicle info"
            className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"
          >
            <span className="rotate-90 flex">
              <Svg type="angle-small-down1" size="lg" color="white" />
            </span>
          </button>
          <h2 className="text-4xl font-light tracking-tight">Vehicle Info</h2>
        </div>

        {/* Make / model / year */}
        <div className="rounded-3xl bg-[#4a5fc9] text-white p-5 mb-3 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="text-lg font-medium leading-none mb-2">
              {orDash(tag.Make)}
            </div>
            <div className="text-5xl font-light leading-none tracking-tight break-words">
              {orDash(tag.Model)}
            </div>
          </div>
          <span className="text-2xl font-light leading-none">
            {orDash(tag.Year)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoTile label="Vehicle" value={orDash(tag.Vehicle)} />
          <InfoTile
            label="Engine"
            value={tag.Engine ? `${tag.Engine} cc` : "—"}
          />
          <Tile className="col-span-2 p-4">
            <div className="text-sm text-white/50 leading-none mb-2">Fuel</div>
            {fuel.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {fuel.map((type) => (
                  <span
                    key={type}
                    className="rounded-full bg-white/10 px-3 py-1 text-lg font-light leading-tight"
                  >
                    {type}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-2xl font-light leading-tight">—</div>
            )}
          </Tile>
          <InfoTile label="Transmission" value={orDash(tag.Transmission)} />
          <InfoTile label="Colour" value={orDash(tag.Color)} />
          <InfoTile label="Style" value={orDash(tag.Style)} />
          <InfoTile label="Licence plate" value={orDash(tag.LicencePlate)} />
          <InfoTile
            label="VIN"
            value={orDash(tag.VinNumber)}
            className="col-span-2"
          />
        </div>
      </div>
    </div>
  );
}
