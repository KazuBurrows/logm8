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
        <div
          className="w-full cursor-pointer"
          onClick={openRecord}
        >
          {/* Record content */}
          <div className="flex flex-col py-3 px-4 sm:px-8">
            {/* Line 1: Service Option */}
            <div className="font-semibold capitalize text-xl text-fg tracking-wide mb-1">
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
                className={`text-sm font-thin capitalize px-3 py-1 rounded-full ${typeStyle.badge}`}
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
