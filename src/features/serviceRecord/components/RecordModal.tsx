import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useServiceRecord } from "../api/useServiceRecord";
import { LoadingScreen } from "../../../shared/components/LoadingScreen";
import CascadingDropdown from "../../serviceOption/components/CascadingDropdown";
import { ApiError } from "../../../api/client";
import { dispatchToast } from "../../../shared/components/Toast/toastService";
import { IconButton } from "../../../shared/components/IconButton";
import { Panel } from "../../../shared/components/Panel";
import { Svg } from "../../../shared/components/Svg";
import { Tile } from "../../../shared/components/Tile";
import { findServiceSelection } from "../utils/serviceSelection";
import { cleanOdometerInput, fileNameFromUrl, groupOdometerInput } from "../utils/recordDisplay";
import { shrinkImageToFit } from "../utils/shrinkImage";

const MAX_FILES = 10;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

export interface RecordModalProps {
  isOpen: boolean; // Controls if the modal is visible
  onClose: () => void; // Function to close the modal

  mode: "create" | "edit" | "view";
  recordToEdit?: ServiceRecord;

  onInsert?: (newRecord: ServiceRecord) => void;
  onUpdate?: (updatedRecord: ServiceRecord) => void;

  logServiceOptions: ServiceOption[];
  logOwnershipOptions: ServiceOption[];
}

/** Primary UI component for user interaction */
export const RecordModal = ({
  isOpen,
  onClose,
  mode,
  recordToEdit,
  onInsert,
  onUpdate,
  logServiceOptions,
  logOwnershipOptions,
}: RecordModalProps) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token"); // Extract the 'token' value

  const { loading, submitRecord, updateServiceRecord } = useServiceRecord();

  // Form values
  const [Token] = useState(token ?? "");
  const [Id] = useState(recordToEdit?.id ?? "");
  const [TagId, setTagId] = useState("");
  const [ServicedDate, setServicedDate] = useState("");
  const [MechanicName, setMechanicName] = useState("");
  const [Odometer, setOdometer] = useState(""); // plain number, no commas
  const [OdometerMetric, setOdometerMetric] = useState("km");
  const odometerInput = useRef<HTMLInputElement>(null);
  const odometerCaret = useRef<number | null>(null);
  const [selection, setSelection] = useState<any>(null);
  const [Comment, setComment] = useState("");
  const [Files, setFiles] = useState<File[]>([]);
  // Large photos are shrunk before they're attached; saving waits until that's done.
  const [preparingFiles, setPreparingFiles] = useState(false);
  const latestFilePick = useRef(0);
  // Saved receipts marked for removal; nothing is deleted until the form is saved.
  const [removedFileUrls, setRemovedFileUrls] = useState<string[]>([]);
  useEffect(() => {
    if (isOpen) setRemovedFileUrls([]);
  }, [isOpen, recordToEdit]);
  const toggleRemovedFile = (url: string) =>
    setRemovedFileUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );

  const initialDropdownSelection = useMemo(() => {
    if (mode === "create" || !recordToEdit) return null;
    const found = findServiceSelection(recordToEdit, logServiceOptions, logOwnershipOptions);
    return found && { ...found, type: recordToEdit.ServiceType };
  }, [mode, recordToEdit, logServiceOptions, logOwnershipOptions]);

  /** -------------- PREFILL ON EDIT/VIEW MODE ----------------- */
  useEffect(() => {
    if (mode !== "create" && recordToEdit) {
      setTagId(recordToEdit.TagId ?? "");
      setServicedDate(recordToEdit.ServicedDate ?? "");
      setMechanicName(recordToEdit.MechanicName ?? "");

      // Split odometer number + metric
      const [odoNum, odoMetric] = recordToEdit.Odometer?.split(" ") ?? [];
      setOdometer(cleanOdometerInput(odoNum ?? ""));
      setOdometerMetric(odoMetric ?? "km");

      // Preselect dropdown (service options)
      // dropdown initialValue seeds its own state; onChange will update selection

      setComment(recordToEdit.Comment ?? "");
    }
  }, [mode, recordToEdit]);

  const clearFields = () => {
    // setServicedDate("");
    // setOdometer("");
    setOdometerMetric("km"); // reset to default
    // setServiceType("");
    setComment("");
    setFiles([]);
  };

  // const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setServiceType(e.target.value);
  // };
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };
  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const selected = Array.from(input.files ?? []);
    // Shrinking takes a moment; if another pick comes in meanwhile, this one is dropped.
    const pick = ++latestFilePick.current;

    if (selected.length > MAX_FILES) {
      setPreparingFiles(false);
      alert(`You can attach up to ${MAX_FILES} files.`);
      input.value = "";
      return;
    }

    setPreparingFiles(true);
    // One at a time: decoding several large photos at once can run a phone out of memory.
    const prepared: File[] = [];
    for (const file of selected) {
      prepared.push(await shrinkImageToFit(file, MAX_FILE_SIZE_BYTES));
    }
    if (pick !== latestFilePick.current) return;
    setPreparingFiles(false);

    const invalid = prepared.filter(
      (f) => !ALLOWED_FILE_TYPES.includes(f.type) || f.size > MAX_FILE_SIZE_BYTES
    );
    if (invalid.length > 0) {
      alert(
        "The following files are invalid (must be JPEG/PNG/WEBP/HEIC/PDF under 10MB):\n" +
          invalid.map((f) => f.name).join("\n")
      );
      input.value = "";
      return;
    }

    setFiles(prepared);
  };
  const handleOdoChange = (event: any) => {
    setOdometerMetric(event.target.value);
  };
  const handleOdometerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, selectionStart } = e.target;
    // Count the digits before the caret so it can be put back after the commas move.
    odometerCaret.current = value.slice(0, selectionStart ?? value.length).replace(/[^\d.]/g, "").length;
    setOdometer(cleanOdometerInput(value));
  };

  // Re-inserting commas replaces the field's text, which would throw the caret to the end.
  useLayoutEffect(() => {
    const input = odometerInput.current;
    const digitsBefore = odometerCaret.current;
    odometerCaret.current = null;
    if (!input || digitsBefore === null || document.activeElement !== input) return;
    let pos = 0;
    for (let seen = 0; pos < input.value.length && seen < digitsBefore; pos++) {
      if (input.value[pos] !== ",") seen++;
    }
    input.setSelectionRange(pos, pos);
  });

  /** -------------- EVENTS ----------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Helper function to check required fields
    const getValidationErrors = (): string[] => {
      const errors: string[] = [];

      if (!ServicedDate || ServicedDate.trim() === "") {
        errors.push("Serviced Date is required");
      }

      if (!MechanicName || MechanicName.trim() === "") {
        errors.push("Mechanic Name is required");
      }

      if (!Odometer || Odometer.trim() === "") {
        errors.push("Odometer is required");
      } else if (!Number.isFinite(Number(Odometer))) {
        errors.push("Odometer must be a number");
      }

      if (!OdometerMetric || OdometerMetric.trim() === "") {
        errors.push("Odometer Metric is required");
      }

      if (!selection?.option && !selection?.subcategory && !selection?.category) {
        errors.push("At least one of Category / Subcategory / Subitem must be selected");
      }

      if (!selection?.type) {
        errors.push("Service Type is required");
      }

      return errors;
    };

    const errors = getValidationErrors();

    if (errors.length > 0) {
      alert(
        "Please fix the following:\n\n" +
        errors.map((e, i) => `${i + 1}. ${e}`).join("\n")
      );
      return;
    }

    const formData = new FormData();
    formData.append("Token", Token);
    formData.append("TagId", TagId);
    formData.append("ServicedDate", ServicedDate);
    formData.append("MechanicName", MechanicName);
    formData.append(
      "Odometer",
      // Number() tidies partial entries like "1500." before saving
      String(Number(Odometer)) + " " + OdometerMetric
    );

    formData.append("Comment", Comment);

    Files.forEach((f) => {
      formData.append("Files", f);
    });

    try {
      if (mode === "edit" && recordToEdit) {
        // include the id so server knows which record to update
        formData.append("Id", recordToEdit.id);
        // Taken off the record, and their files deleted, once the save succeeds.
        removedFileUrls.forEach((url) => formData.append("RemoveFileUrls", url));

        const serviceOp =
          selection?.option ??
          selection?.subcategory ??
          selection?.category ??
          "None";

        formData.append("ServiceCategory", selection.category?.Name ?? "");
        formData.append("ServiceOption", serviceOp?.Name ?? "");
        formData.append("ServiceType", selection.type ?? "");


        const updatedRecord = await updateServiceRecord(formData);
        // notify parent with the server-updated record
        onUpdate?.(updatedRecord);
        onClose();
        clearFields();
        return;
      }

      formData.append("Id", Id);
      const serviceOp =
        selection?.option?.Name ??
        selection?.subcategory?.Name ??
        selection?.category?.Name ??
        "None";

      formData.append("ServiceCategory", selection.category?.Name ?? "");
      formData.append("ServiceOption", serviceOp);
      formData.append("ServiceType", selection.type ?? "");

      // CREATE mode (existing flow)
      const newRecord = await submitRecord(formData);
      onInsert?.(newRecord);
      onClose();
    } catch (err: any) {
      console.error(err);
      if (!(err instanceof ApiError) || err.status === 404) {
        dispatchToast("Something went wrong while saving the record. Please try again.", "error");
      }
    } finally {
      clearFields();
    }
  };
  const isView = mode === "view";
  const title = mode === "edit" ? "Update Record" : isView ? "Service Record" : "Create Maintenance";
  const submitLabel = mode === "edit" ? "Save changes" : "Add record";

  const fieldLabel = "block text-sm text-fg-muted leading-none mb-2";
  // Raised box marks where to type; in view mode it drops back to plain text.
  const fieldInput =
    "w-full min-h-11 rounded-card bg-raised px-3 py-2 text-xl font-light text-fg placeholder-fg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-accent [color-scheme:dark] disabled:bg-transparent disabled:px-0 disabled:text-fg-soft disabled:cursor-not-allowed";

  const odometerUnits = [
    { id: "huey", value: "km", label: "KM" },
    { id: "dewey", value: "miles", label: "Miles" },
    { id: "louie", value: "hours", label: "Hours" },
  ];

  return (
    <Panel isOpen={isOpen} onClose={onClose} title={title}>
      {/* Portaled: the sliding panel is transformed and scrollable, so an overlay inside it would scroll away with the content. */}
      {loading &&
        createPortal(
          <div className="fixed inset-0 z-[60] bg-canvas text-fg">
            <LoadingScreen text={"Submitting ..."} variant="dark" />
          </div>,
          document.body
        )}

      {/* Body */}
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <Tile className="p-4">
          <label className={fieldLabel} htmlFor="ServicedDate">
            Serviced Date
          </label>
          <input
            type="date"
            id="ServicedDate"
            className={fieldInput}
            defaultValue={ServicedDate}
            onFocus={(e) => !isView && e.target.showPicker?.()}
            onChange={(e) => setServicedDate(e.target.value)}
            required={!isView}
            disabled={isView}
          />
        </Tile>

        <Tile className="p-4">
          <label className={fieldLabel} htmlFor="MechanicName">
            Serviced By
          </label>
          <input
            type="text"
            id="MechanicName"
            className={fieldInput}
            placeholder="Bruce McLaren"
            value={MechanicName}
            onChange={(e) => setMechanicName(e.target.value)}
            disabled={isView}
          />
        </Tile>

        <Tile className="p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <label
              className="text-sm text-fg-muted leading-none"
              htmlFor="Odometer"
            >
              Odometer
            </label>
            <fieldset
              className="inline-flex rounded-full bg-raised p-1 text-sm"
              disabled={isView}
            >
              {odometerUnits.map((unit) => (
                <label
                  key={unit.id}
                  htmlFor={unit.id}
                  className={`min-h-11 px-3 inline-flex items-center rounded-full transition-colors ${
                    isView ? "cursor-not-allowed" : "cursor-pointer"
                  } ${
                    OdometerMetric === unit.value
                      ? "bg-accent text-accent-fg"
                      : "text-fg-soft"
                  }`}
                >
                  <input
                    type="radio"
                    id={unit.id}
                    name="drone"
                    value={unit.value}
                    checked={OdometerMetric === unit.value}
                    onChange={handleOdoChange}
                    className="sr-only"
                  />
                  {unit.label}
                </label>
              ))}
            </fieldset>
          </div>
          {/* Text, not number: a number input can't show thousands commas. */}
          <input
            ref={odometerInput}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            id="Odometer"
            className={fieldInput}
            placeholder="1,500"
            value={groupOdometerInput(Odometer)}
            onChange={handleOdometerInput}
            disabled={isView}
          />
        </Tile>

        <Tile
          className={`p-4 transition-all${
            isView ? " pointer-events-none opacity-60" : ""
          }`}
        >
          <CascadingDropdown
            key={recordToEdit?.id ?? "new"}
            logServiceOptions={logServiceOptions}
            logOwnershipOptions={logOwnershipOptions}
            initialValue={initialDropdownSelection}
            onChange={(selected) => {
              setSelection(selected);
            }}
          />
        </Tile>

        <Tile className="p-4">
          <label className={fieldLabel} htmlFor="Comment">
            Comment
          </label>
          <textarea
            id="Comment"
            className="w-full h-24 rounded-card bg-raised px-3 py-2 resize-none text-lg font-light text-fg placeholder-fg-muted/70 outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:bg-transparent disabled:px-0 disabled:text-fg-soft disabled:cursor-not-allowed"
            placeholder={isView ? "" : "Mobil - 10w-40 - 2qrts"}
            value={Comment}
            onChange={handleTextAreaChange}
            maxLength={250}
            disabled={isView}
          />
          <p className="mt-2 text-sm text-fg-muted text-right">
            {Comment.length}/250
          </p>
        </Tile>

        {mode !== "create" && recordToEdit?.FileUrls?.length ? (
          <Tile className="p-4">
            <div className={fieldLabel}>Receipts</div>
            <ul className="flex flex-col gap-1">
              {recordToEdit.FileUrls.map((url: string, i: number) => {
                const name = fileNameFromUrl(url, `Receipt ${i + 1}`);
                const removed = removedFileUrls.includes(url);
                return (
                  <li key={url} className="flex items-center gap-2">
                    {removed ? (
                      <span className="min-w-0 flex-1 truncate text-sm text-fg-muted line-through">
                        {name}
                      </span>
                    ) : (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="min-h-11 min-w-0 flex-1 flex items-center text-fg underline underline-offset-2 text-sm"
                      >
                        <span className="truncate">{name}</span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    )}
                    {!isView &&
                      (removed ? (
                        <button
                          type="button"
                          aria-label={`Keep ${name}`}
                          onClick={() => toggleRemovedFile(url)}
                          className="min-h-11 px-3 shrink-0 text-sm text-fg-soft underline underline-offset-2"
                        >
                          Undo
                        </button>
                      ) : (
                        <IconButton label={`Remove ${name}`} onClick={() => toggleRemovedFile(url)}>
                          <Svg type="cross" size="sm" color="current" />
                        </IconButton>
                      ))}
                  </li>
                );
              })}
            </ul>
            {removedFileUrls.length > 0 && (
              <p className="mt-2 text-sm text-fg-muted">
                Removed receipts are deleted when you save.
              </p>
            )}
          </Tile>
        ) : null}

        {!isView && (
          <Tile className="p-4">
            <label className={fieldLabel} htmlFor="Reciept">
              {mode === "edit" ? "Add receipts" : "Receipts"}
            </label>
            <input
              type="file"
              id="Reciept"
              className="w-full text-sm text-fg-soft file:mr-3 file:rounded-full file:border-0 file:bg-raised file:px-4 file:py-3 file:text-fg file:cursor-pointer"
              multiple
              onChange={handleFilesChange}
            />
          </Tile>
        )}

        {!isView && (
          <button
            type="submit"
            disabled={preparingFiles}
            className="w-full h-14 mt-2 rounded-full bg-accent text-accent-fg text-xl font-medium disabled:opacity-60"
          >
            {preparingFiles ? "Preparing photos…" : submitLabel}
          </button>
        )}
      </form>
    </Panel>
  );
};
