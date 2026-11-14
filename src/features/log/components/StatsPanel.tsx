import React, { useMemo } from "react";
import { Panel } from "../../../shared/components/Panel";
import { Tile } from "../../../shared/components/Tile";
import { ServiceRecordStatsBars } from "./ServiceRecordStatsBars";
import { parseOdometer, parseServicedDate } from "../../serviceRecord/utils/recordDisplay";

export interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  serviceRecords: ServiceRecord[];
}

const statLabel = "text-sm text-fg-muted leading-none mb-2";

export function StatsPanel({ isOpen, onClose, serviceRecords }: StatsPanelProps) {
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

  const lastDate = parseServicedDate(latestRecord?.ServicedDate);

  // Shown in the latest record's own unit; mixed units aren't converted.
  const odometer = parseOdometer(latestRecord?.Odometer);

  return (
    <Panel isOpen={isOpen} onClose={onClose} title="Statistics" closeLabel="Close statistics">
      <div className="grid grid-cols-2 gap-3 mb-8">
        {/* Current reading from the most recent record */}
        <Tile className="col-span-2 p-5">
          <div className={statLabel}>Current reading</div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-light leading-none tracking-tight tabular-nums">
              {odometer.value !== null
                ? odometer.value.toLocaleString("en-GB", { maximumFractionDigits: 1 })
                : "—"}
            </span>
            {odometer.value !== null && odometer.unit && (
              <span className="text-lg text-fg-soft">{odometer.unit}</span>
            )}
          </div>
        </Tile>

        <Tile className="p-5">
          <div className={statLabel}>Service records</div>
          <div className="text-4xl font-light leading-none tracking-tight tabular-nums">
            {serviceRecords.length}
          </div>
        </Tile>

        <Tile className="p-5">
          <div className={statLabel}>Last updated</div>
          <div className="text-2xl font-light leading-none tracking-tight whitespace-nowrap">
            {lastDate
              ? lastDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
              : "—"}
          </div>
          {lastDate && (
            <div className="text-sm text-fg-muted leading-none mt-2">
              {lastDate.getFullYear()}
            </div>
          )}
        </Tile>
      </div>

      <h3 className="text-xl font-light mb-3">Record types</h3>
      <ServiceRecordStatsBars serviceRecords={serviceRecords} />
    </Panel>
  );
}
