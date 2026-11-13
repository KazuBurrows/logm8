import { serviceTypeStyle } from "../../../shared/theme/serviceTypes";

export interface RecordItemProps {
  record: ServiceRecord;
  openRecord: () => void;
}

export const RecordItem = ({ record, openRecord }: RecordItemProps) => {
  const typeStyle = serviceTypeStyle(record.ServiceType);

  return (
    <li key={record.id} className="mb-1 relative">
      <div
        className={`w-full rounded-card bg-surface border border-line border-l-4 shadow-lg funnel-display-font leading-none ${typeStyle.edge} relative`}
      >
        <button
          type="button"
          className="w-full text-left rounded-card focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onClick={openRecord}
        >
          {/* Record content (spans: a button may only contain phrasing content) */}
          <span className="flex flex-col py-3 px-4 sm:px-8">
            {/* Line 1: Service Option */}
            <span className="block font-semibold capitalize text-xl text-fg tracking-wide mb-1">
              {record.ServiceOption}
            </span>

            {/* Line 2: Month + Year + Odometer */}
            <span className="flex justify-between items-center">
              <span className="flex flex-col text-left text-white/80">
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
                      <span className="block text-sm uppercase tracking-wider text-white/25">
                        {months[date.getMonth()]}{" "}
                        <span className="text-white/50">
                          {date.getFullYear()}
                        </span>
                      </span>
                      <span className="block text-sm capitalize tracking-wider text-white/25">
                        {record.Odometer}
                      </span>
                    </>
                  );
                })()}
              </span>

              <span
                className={`text-sm font-thin capitalize px-3 py-1 rounded-full ${typeStyle.badge}`}
              >
                {record.ServiceType}
              </span>
            </span>
          </span>
        </button>
      </div>
    </li>
  );
};
