import { serviceTypeStyle } from "../../../shared/theme/serviceTypes";
import { formatServicedDate } from "../utils/recordDisplay";

export interface RecordItemProps {
  record: ServiceRecord;
  openRecord: () => void;
}

export const RecordItem = ({ record, openRecord }: RecordItemProps) => {
  const typeStyle = serviceTypeStyle(record.ServiceType);
  const odometer = record.Odometer?.trim();

  return (
    <li className="mb-1 relative">
      <div
        className={`w-full rounded-card bg-surface border border-line border-l-4 shadow-lg funnel-display-font ${typeStyle.edge} relative`}
      >
        {/* Spans inside: a button may only contain phrasing content. */}
        <button
          type="button"
          className="w-full text-left rounded-card focus:outline-none focus-visible:ring-2 focus-visible:ring-accent flex items-center gap-3 py-3 px-4 sm:px-8"
          onClick={openRecord}
        >
          <span className="flex-1 min-w-0">
            <span className="line-clamp-2 break-words font-semibold capitalize text-xl leading-tight text-fg tracking-wide">
              {record.ServiceOption}
            </span>
            {/* Metadata: 14px in fg-muted (6.96:1 on surface) to meet WCAG AA. */}
            <span className="block mt-1 text-sm leading-snug text-fg-muted tabular-nums">
              <time dateTime={record.ServicedDate}>{formatServicedDate(record.ServicedDate)}</time>
              {odometer && (
                <>
                  <span aria-hidden="true" className="mx-1.5">
                    ·
                  </span>
                  <span className="capitalize">{odometer}</span>
                </>
              )}
            </span>
          </span>

          <span
            className={`shrink-0 text-sm font-medium capitalize px-3 py-1 rounded-full ${typeStyle.badge}`}
          >
            {record.ServiceType}
          </span>
        </button>
      </div>
    </li>
  );
};
