import React, { useEffect, useMemo, useState } from "react";

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

const barClasses: Record<ServiceType, { fill: string; track: string }> = {
  Maintenance: { fill: "bg-[#4a5fc9] text-white", track: "bg-[#4a5fc9]/25" },
  Replacement: { fill: "bg-[#e0522f] text-white", track: "bg-[#e0522f]/25" },
  Inspection: { fill: "bg-[#2fa866] text-white", track: "bg-[#2fa866]/25" },
  Adjustment: { fill: "bg-[#f2c230] text-slate-900", track: "bg-[#f2c230]/25" },
  Tune: { fill: "bg-[#8b5cf6] text-white", track: "bg-[#8b5cf6]/25" },
};

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
    <div className="w-full flex flex-col gap-3">
      {SERVICE_TYPES.map((type) => {
        const value = counts[type];
        const pct = grown && max > 0 ? (value / max) * 100 : 0;

        return (
          <div
            key={type}
            className={`rounded-3xl overflow-hidden ${barClasses[type].track}`}
          >
            <div
              className={`h-28 rounded-3xl p-4 flex flex-col justify-between transition-[width] duration-700 ease-out ${barClasses[type].fill}`}
              style={{ width: `max(${pct}%, 9rem)` }}
            >
              <span className="text-xl font-medium leading-none">{type}</span>
              <span className="self-end text-6xl font-light leading-none tracking-tight">
                {value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
