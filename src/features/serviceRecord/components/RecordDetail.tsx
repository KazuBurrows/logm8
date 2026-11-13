import React from "react";
import { Panel } from "../../../shared/components/Panel";
import { Svg } from "../../../shared/components/Svg";
import { Tile } from "../../../shared/components/Tile";
import { serviceTypeStyle } from "../../../shared/theme/serviceTypes";
import {
  fileNameFromUrl,
  formatOdometer,
  formatServicedDate,
  recordTitle,
} from "../utils/recordDisplay";

export interface RecordDetailProps {
  isOpen: boolean;
  /** Should be stable (e.g. useCallback), it is an effect dependency. */
  onClose: () => void;
  record?: ServiceRecord;
  /** Category > subcategory > option names. */
  categoryPath: string[];
  /** Shows the Edit button. */
  canEdit: boolean;
  onEdit: () => void;
}

const label = "text-sm text-fg-muted leading-none mb-1.5";
const value = "text-lg leading-snug break-words";

const Field = ({ name, children }: { name: string; children: React.ReactNode }) => (
  <div className="py-3 first:pt-0 last:pb-0">
    <dt className={label}>{name}</dt>
    <dd className={value}>{children}</dd>
  </div>
);

/** Read-only view of one service record, with an Edit action for editable records. */
export function RecordDetail({
  isOpen,
  onClose,
  record,
  categoryPath,
  canEdit,
  onEdit,
}: RecordDetailProps) {
  const files = record?.FileUrls ?? [];
  const typeStyle = serviceTypeStyle(record?.ServiceType);

  return (
    <Panel
      isOpen={isOpen}
      onClose={onClose}
      title={record ? recordTitle(record) : "Service record"}
      closeLabel="Close record"
      footer={
        canEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="w-full h-14 rounded-full bg-accent text-accent-fg text-xl font-medium flex items-center justify-center gap-2"
          >
            <Svg type="pencil-1" size="md" color="current" />
            Edit
          </button>
        ) : undefined
      }
    >
      {record && (
        <div className="flex flex-col gap-3">
          <Tile className="p-4">
            <dl className="divide-y divide-line">
              <Field name="Date">{formatServicedDate(record.ServicedDate, "long")}</Field>
              <Field name="Serviced by">
                {record.MechanicName?.trim() || <span className="text-fg-muted">Not recorded</span>}
              </Field>
              <Field name="Odometer">
                {formatOdometer(record.Odometer) || <span className="text-fg-muted">Not recorded</span>}
              </Field>
              <Field name="Category">
                {categoryPath.length ? (
                  <span>
                    {categoryPath.map((name, i) => (
                      <React.Fragment key={name}>
                        {i > 0 && (
                          <span aria-hidden="true" className="mx-1.5 text-fg-muted">
                            ›
                          </span>
                        )}
                        {name}
                      </React.Fragment>
                    ))}
                  </span>
                ) : (
                  <span className="text-fg-muted">Not recorded</span>
                )}
              </Field>
              <Field name="Type">
                {record.ServiceType ? (
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-base ${typeStyle.badge}`}
                  >
                    {record.ServiceType}
                  </span>
                ) : (
                  <span className="text-fg-muted">Not recorded</span>
                )}
              </Field>
            </dl>
          </Tile>

          <Tile className="p-4">
            <div className={label}>Comment</div>
            <p className={`${value} whitespace-pre-wrap`}>
              {record.Comment?.trim() || <span className="text-fg-muted">No comment</span>}
            </p>
          </Tile>

          <Tile className="p-4">
            <div className={`${label} mb-2`}>Receipts</div>
            {files.length ? (
              <ul className="flex flex-col gap-2">
                {files.map((url, i) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="min-h-11 flex items-center gap-3 rounded-card bg-raised px-3 py-2 text-base"
                    >
                      <Svg type="file-download1" size="sm" color="current" />
                      <span className="min-w-0 flex-1 truncate underline underline-offset-2">
                        {fileNameFromUrl(url, `Receipt ${i + 1}`)}
                      </span>
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`${value} text-fg-muted`}>No receipts</p>
            )}
          </Tile>
        </div>
      )}
    </Panel>
  );
}
