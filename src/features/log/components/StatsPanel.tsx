import React, { useMemo } from "react";
import { Svg } from "../../../shared/components/Svg";
import { ServiceRecordStatsBars } from "./ServiceRecordStatsBars";
import { useSlideInPanel } from "../../../shared/hooks/useSlideInPanel";
import { useEscapeAndScrollLock } from "../../../shared/hooks/useEscapeAndScrollLock";

export interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  serviceRecords: ServiceRecord[];
}

export function StatsPanel({ isOpen, onClose, serviceRecords }: StatsPanelProps) {
  const { mounted, slideClass, slideStyle } = useSlideInPanel(isOpen);

  useEscapeAndScrollLock(mounted, onClose);

  // Most recent record by serviced date; source for the current odometer/hours.
  const latestRecord = useMemo(() => {
    let latest: ServiceRecord | null = null;
    let latestTime = -Infinity;
    serviceRecords.forEach((record) => {
      const time = new Date(record.ServicedDate).getTime();
      if (!Number.isNaN(time) && time > latestTime) {
        latest = record;
        latestTime = time;
      }
    });
    return latest as ServiceRecord | null;
  }, [serviceRecords]);

  if (!mounted) return null;

  const lastDate = latestRecord ? new Date(latestRecord.ServicedDate) : null;

  // Odometer is stored as "<number> <unit>", e.g. "1200 km" or "350 hours".
  const [odoValue, odoUnit] = (latestRecord?.Odometer ?? "").trim().split(/\s+/);
  const odoNumber = Number(odoValue);
  const hasOdometer = odoValue !== "" && !Number.isNaN(odoNumber);

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
            aria-label="Close statistics"
            className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"
          >
            <span className="rotate-90 flex">
              <Svg type="angle-small-down1" size="lg" color="white" />
            </span>
          </button>
          <h2 className="text-4xl font-light tracking-tight">Statistics</h2>
        </div>

        {/* Current reading from the most recent record */}
        <div className="rounded-3xl bg-[#e0522f] text-white p-5 mb-3 flex items-end justify-between">
          <span className="text-xl font-medium leading-none">Current reading</span>
          <span className="flex items-baseline gap-2">
            <span className="text-7xl font-light leading-none tracking-tight">
              {hasOdometer ? odoNumber.toLocaleString() : "—"}
            </span>
            {hasOdometer && odoUnit && (
              <span className="text-xl font-medium">{odoUnit}</span>
            )}
          </span>
        </div>

        {/* Summary pill: total records + last updated */}
        <div className="flex rounded-3xl bg-white text-slate-900 mb-8">
          <div className="flex-1 flex items-center gap-3 p-5 pr-10">
            <span className="text-7xl font-light leading-none tracking-tight">
              {serviceRecords.length}
            </span>
            <span className="text-lg font-medium leading-tight">
              Service
              <br />
              Records
            </span>
          </div>
          <div className="-ml-6 rounded-3xl bg-[#4a5fc9] text-white p-5 flex flex-col justify-center">
            <span className="text-sm font-medium leading-none mb-1">
              Last updated
            </span>
            <span className="text-3xl font-light leading-none tracking-tight whitespace-nowrap">
              {lastDate
                ? lastDate.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })
                : "—"}
            </span>
            {lastDate && (
              <span className="text-sm text-white/70 leading-none mt-1">
                {lastDate.getFullYear()}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-2xl font-light mb-4">Record types</h3>
        <ServiceRecordStatsBars serviceRecords={serviceRecords} />
      </div>
    </div>
  );
}
