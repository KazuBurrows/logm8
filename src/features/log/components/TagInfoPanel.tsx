import React from "react";
import { Panel } from "../../../shared/components/Panel";
import { Tile } from "../../../shared/components/Tile";

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
    <div className="text-sm text-fg-muted leading-none mb-2">{label}</div>
    <div className="text-2xl font-light leading-tight break-words">{value}</div>
  </Tile>
);

export interface TagInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tag: ServiceTag;
}

export function TagInfoPanel({ isOpen, onClose, tag }: TagInfoPanelProps) {
  const fuel = parseFuel(tag.Fuel);

  return (
    <Panel isOpen={isOpen} onClose={onClose} title="Vehicle Info" closeLabel="Close vehicle info">
      {/* Make / model / year */}
      <Tile className="p-5 mb-3 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="text-lg font-medium text-fg-soft leading-none mb-2">
            {orDash(tag.Make)}
          </div>
          <div className="text-5xl font-light leading-none tracking-tight break-words">
            {orDash(tag.Model)}
          </div>
        </div>
        <span className="text-2xl font-light leading-none text-fg-soft">{orDash(tag.Year)}</span>
      </Tile>

      <div className="grid grid-cols-2 gap-3">
        <InfoTile label="Vehicle" value={orDash(tag.Vehicle)} />
        <InfoTile label="Engine" value={tag.Engine ? `${tag.Engine} cc` : "—"} />
        <Tile className="col-span-2 p-4">
          <div className="text-sm text-fg-muted leading-none mb-2">Fuel</div>
          {fuel.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {fuel.map((type) => (
                <span
                  key={type}
                  className="rounded-full bg-raised px-3 py-1 text-lg font-light leading-tight"
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
        {/* <InfoTile label="Style" value={orDash(tag.Style)} /> */}
        <InfoTile label="Licence plate" value={orDash(tag.LicencePlate)} className="col-span-2" />
        <InfoTile label="VIN" value={orDash(tag.VinNumber)} className="col-span-2" />
      </div>
    </Panel>
  );
}
