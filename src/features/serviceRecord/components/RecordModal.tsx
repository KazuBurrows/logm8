import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useServiceRecord } from "../api/useServiceRecord";
import { LoadingScreen } from "../../../shared/components/LoadingScreen";
import CascadingDropdown from "../../serviceOption/components/CascadingDropdown";
import { ApiError } from "../../../api/client";
import { dispatchToast } from "../../../shared/components/Toast/toastService";
import { useSlideInPanel } from "../../../shared/hooks/useSlideInPanel";
import { Svg } from "../../../shared/components/Svg";
import { Tile } from "../../../shared/components/Tile";

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
  const { mounted, slideClass, slideStyle } = useSlideInPanel(isOpen);

  // Form values
  const [Token] = useState(token ?? "");
  const [Id] = useState(recordToEdit?.id ?? "");
  const [TagId, setTagId] = useState("");
  const [ServicedDate, setServicedDate] = useState("");
  const [MechanicName, setMechanicName] = useState("");
  const [Odometer, setOdometer] = useState("");
  const [OdometerMetric, setOdometerMetric] = useState("km");
  const [selection, setSelection] = useState<any>(null);
  const [Comment, setComment] = useState("");
  const [Files, setFiles] = useState<File[]>([]);

  const initialDropdownSelection = useMemo(() => {
    if (mode === "create" || !recordToEdit) return null;
    const { ServiceCategory: catName, ServiceOption: optName, ServiceType: svcType } = recordToEdit;
    for (const dir of [logServiceOptions, logOwnershipOptions]) {
      for (const cat of dir) {
        if (cat.Name !== catName) continue;
        for (const sub of cat.Children ?? []) {
          if (sub.Name === optName) return { category: cat, subcategory: sub, option: null, type: svcType };
          for (const opt of sub.Children ?? []) {
            if (opt.Name === optName) return { category: cat, subcategory: sub, option: opt, type: svcType };
          }
        }
        return { category: cat, subcategory: null, option: null, type: svcType };
      }
    }
    return null;
  }, [mode, recordToEdit, logServiceOptions, logOwnershipOptions]);

  /** -------------- PREFILL ON EDIT/VIEW MODE ----------------- */
  useEffect(() => {
    if (mode !== "create" && recordToEdit) {
      setTagId(recordToEdit.TagId ?? "");
      setServicedDate(recordToEdit.ServicedDate ?? "");
      setMechanicName(recordToEdit.MechanicName ?? "");

      // Split odometer number + metric
      const [odoNum, odoMetric] = recordToEdit.Odometer?.split(" ") ?? [];
      setOdometer(odoNum ?? "");
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
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);

    if (selected.length > MAX_FILES) {
      alert(`You can attach up to ${MAX_FILES} files.`);
      e.target.value = "";
      return;
    }

    const invalid = selected.filter(
      (f) => !ALLOWED_FILE_TYPES.includes(f.type) || f.size > MAX_FILE_SIZE_BYTES
    );
    if (invalid.length > 0) {
      alert(
        "The following files are invalid (must be JPEG/PNG/WEBP/HEIC/PDF under 10MB):\n" +
          invalid.map((f) => f.name).join("\n")
      );
      e.target.value = "";
      return;
    }

    setFiles(selected);
  };
  const handleOdoChange = (event: any) => {
    setOdometerMetric(event.target.value);
  };

  /** -------------- EVENTS ----------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    const currDate = new Date();

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
    formData.append("EnteredDate", currDate.toString());
    formData.append("ServicedDate", ServicedDate);
    formData.append("MechanicName", MechanicName);
    formData.append(
      "Odometer",
      (Odometer?.toString() ?? "0") + " " + OdometerMetric
    );

    formData.append("Comment", Comment);

    Files.forEach((f) => {
      formData.append("Files", f);
    });

    try {
      if (mode === "edit" && recordToEdit) {
        // include the id so server knows which record to update
        formData.append("Id", recordToEdit.id);

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
  if (!mounted) return null; // Stay rendered through the slide-out, then unmount

  const isView = mode === "view";
  const title = mode === "edit" ? "Update Record" : isView ? "Service Record" : "Create Maintenance";
  // const buttonLabel = mode === "edit" ? "Update" : "Submit";

  const fieldLabel = "block text-sm text-white/50 leading-none mb-2";
  const fieldInput =
    "w-full bg-transparent text-xl font-light text-white placeholder-white/30 outline-none [color-scheme:dark] disabled:text-white/60 disabled:cursor-not-allowed";

  const odometerUnits = [
    { id: "huey", value: "km", label: "KM" },
    { id: "dewey", value: "miles", label: "Miles" },
    { id: "louie", value: "hours", label: "Hours" },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto overflow-x-hidden text-white funnel-display-font bg-gradient-to-b from-zinc-800 via-zinc-900 to-black ${slideClass}`}
      style={slideStyle}
    >
      {/* Portaled: the sliding panel is transformed and scrollable, so an overlay inside it would scroll away with the content. */}
      {loading &&
        createPortal(
          <div className="fixed inset-0 z-[60] bg-black">
            <LoadingScreen text={"Submitting ..."} variant="dark" />
          </div>,
          document.body
        )}

      <div className="max-w-md mx-auto px-4 pt-6 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-11 h-11 shrink-0 rounded-full bg-white/10 flex items-center justify-center"
          >
            <span className="rotate-90 flex">
              <Svg type="angle-small-down1" size="lg" color="white" />
            </span>
          </button>
          <h2 className="text-3xl font-light tracking-tight">{title}</h2>
        </div>

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
                className="text-sm text-white/50 leading-none"
                htmlFor="Odometer"
              >
                Odometer
              </label>
              <fieldset
                className="inline-flex rounded-full bg-white/10 p-1 text-sm"
                disabled={isView}
              >
                {odometerUnits.map((unit) => (
                  <label
                    key={unit.id}
                    htmlFor={unit.id}
                    className={`px-3 py-1 rounded-full transition-colors ${
                      isView ? "cursor-not-allowed" : "cursor-pointer"
                    } ${
                      OdometerMetric === unit.value
                        ? "bg-[#4a5fc9] text-white"
                        : "text-white/60"
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
            <input
              type="number"
              id="Odometer"
              className={`${fieldInput} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              placeholder="150000"
              value={Odometer}
              onChange={(e) => setOdometer(e.target.value)}
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
              className="w-full h-24 bg-transparent resize-none text-lg font-light text-white placeholder-white/30 outline-none disabled:text-white/60 disabled:cursor-not-allowed"
              placeholder={isView ? "" : "Mobil - 10w-40 - 2qrts"}
              value={Comment}
              onChange={handleTextAreaChange}
              maxLength={250}
              disabled={isView}
            />
            <p className="text-sm text-white/40 text-right">
              {Comment.length}/250
            </p>
          </Tile>

          {mode !== "create" && recordToEdit?.FileUrls?.length ? (
            <Tile className="p-4">
              <div className={fieldLabel}>Files</div>
              <div className="flex flex-col gap-1">
                {recordToEdit.FileUrls.map((url: string, i: number) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline text-sm truncate"
                  >
                    {url.split("/").pop() || `File ${i + 1}`}
                  </a>
                ))}
              </div>
            </Tile>
          ) : null}

          {!isView && (
            <Tile className="p-4">
              <label className={fieldLabel} htmlFor="Reciept">
                Receipts
              </label>
              <input
                type="file"
                id="Reciept"
                className="w-full text-sm text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white file:cursor-pointer"
                multiple
                onChange={handleFilesChange}
              />
            </Tile>
          )}

          {!isView && (
            <button
              type="submit"
              className="w-full h-14 mt-2 rounded-full bg-[#4a5fc9] text-white text-xl font-medium"
            >
              Submit
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
