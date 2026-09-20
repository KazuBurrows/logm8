export interface RecordItemProps {
  record: ServiceRecord;
  openRecord: () => void;
}

export const RecordItem = ({ record, openRecord }: RecordItemProps) => {
  // Neon/futuristic color scheme for each service type
  const serviceTypeClasses: Record<string, string> = {
    Maintenance: "text-white bg-blue-900/50",
    Replacement: "text-white bg-red-900/50",
    Inspection: "text-white bg-green-900/50",
    Adjustment: "text-white bg-yellow-900/50",
    Tune: "text-white bg-purple-900/50",
  };

  const serviceAccentClasses: Record<string, string> = {
    Maintenance: "border-blue-500",
    Replacement: "border-red-500",
    Inspection: "border-green-500",
    Adjustment: "border-yellow-500",
    Tune: "border-purple-500",
  };

  const glowClasses: Record<string, string> = {
    Maintenance: "drop-shadow-[0_0_2px_rgba(59,130,246,0.7)]",
    Replacement: "drop-shadow-[0_0_2px_rgba(248,113,113,0.7)]",
    Inspection: "drop-shadow-[0_0_2px_rgba(34,197,94,0.7)]",
    Adjustment: "drop-shadow-[0_0_2px_rgba(253,224,71,0.7)]",
    Tune: "drop-shadow-[0_0_2px_rgba(139,92,246,0.7)]",
  };

  // const serviceStatClasses: Record<string, string> = {
  //   Maintenance: "text-white bg-blue-700/60",
  //   Replacement: "text-white bg-red-700/60",
  //   Inspection: "text-white bg-green-700/60",
  //   Adjustment: "text-white bg-yellow-700/60",
  //   Tune: "text-white bg-purple-700/60",
  // };

  return (
    <li key={record.id} className="mb-1 relative">
      <div
        className={`w-full rounded-2xl border-l-4 shadow-lg backdrop-blur-md funnel-display-font leading-none ${
          serviceAccentClasses[record.ServiceType] || "border-white/20"
        } relative`}
        style={{
          backgroundImage:
            "linear-gradient(to top left, rgba(148,163,184,0.09), rgba(2,6,23,0.5) 55%, rgba(2,6,23,0.5) 100%)",
        }}
      >
        <div
          className="w-full cursor-pointer"
          onClick={openRecord}
        >
          {/* Record content */}
          <div className="flex flex-col py-3 px-4 sm:px-8">
            {/* Line 1: Service Option */}
            <div className="font-semibold capitalize text-xl text-white tracking-wide mb-1">
              {record.ServiceOption}
            </div>

            {/* Line 2: Month + Year + Odometer */}
            <div className="flex justify-between items-center">
              <div className="flex flex-col text-left text-white/80">
                {(() => {
                  const date = new Date(record.ServicedDate);
                  const months = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ];
                  return (
                    <>
                      <div className="text-sm uppercase tracking-wider text-white/25">
                        {months[date.getMonth()]}{" "}
                        <span className="text-white/50">
                          {date.getFullYear()}
                        </span>
                      </div>
                      <div className="text-sm capitalize tracking-wider text-white/25">
                        {record.Odometer}
                      </div>
                    </>
                  );
                })()}
              </div>

              <div
                className={`text-sm font-thin capitalize px-3 py-1 rounded-full ${
                  serviceTypeClasses[record.ServiceType] ||
                  "text-gray-400 bg-gray-800/20"
                } ${glowClasses[record.ServiceType] || ""}`}
              >
                {record.ServiceType}
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
