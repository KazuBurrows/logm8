import React, { useEffect, useMemo, useState } from "react";
import { Tile } from "../../../shared/components/Tile";
import { serviceTypeStyle } from "../../../shared/theme/serviceTypes";

const SERVICE_TYPES = [
  "Maintenance",
  "Replacement",
  "Inspection",
  "Adjustment",
  "Tune",
] as const;

type ServiceType = (typeof SERVICE_TYPES)[number];

// Types that are valid records but not shown as a bar.
const IGNORED_TYPES = new Set(["WOF", "Registration", "Certification", ""]);

export interface ServiceRecordStatsBarsProps {
  serviceRecords: ServiceRecord[];
}

export function ServiceRecordStatsBars({
  serviceRecords,
}: ServiceRecordStatsBarsProps) {
  const counts = useMemo(() => {
    const result = Object.fromEntries(
      SERVICE_TYPES.map((type) => [type, 0])
    ) as Record<ServiceType, number>;

    serviceRecords.forEach((record) => {
      const type = record.ServiceType as ServiceType;
      if (type in result) {
        result[type] += 1;
      } else if (!IGNORED_TYPES.has(record.ServiceType ?? "")) {
        console.warn("Unknown service type:", record.ServiceType);
      }
    });

    return result;
  }, [serviceRecords]);

  const max = Math.max(...Object.values(counts));

  // Start the fills at their minimum width, then grow them once mounted.
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setGrown(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Tile className="p-5 flex flex-col gap-5">
      {SERVICE_TYPES.map((type) => {
        const value = counts[type];
        const pct = grown && max > 0 ? (value / max) * 100 : 0;

        return (
          <div key={type}>
            <div className="flex items-baseline justify-between mb-2">
              <span className="flex items-center gap-2 text-base">
                <span aria-hidden="true" className={`w-2.5 h-2.5 rounded-full ${serviceTypeStyle(type).dot}`} />
                {type}
              </span>
              <span className="text-2xl font-light leading-none tabular-nums">{value}</span>
            </div>
            <div aria-hidden="true" className="h-2 rounded-full bg-raised overflow-hidden">
              <div
                className={`h-full rounded-full transition-[width] duration-700 ease-out ${serviceTypeStyle(type).bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </Tile>
  );
}
