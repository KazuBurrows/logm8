import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useServiceRecord } from "../api/useServiceRecord";
import { LoadingScreen } from "../../../shared/components/LoadingScreen";
import CascadingDropdown from "../../serviceOption/components/CascadingDropdown";
import { ApiError } from "../../../api/client";
import { dispatchToast } from "../../../shared/components/Toast/toastService";

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
  if (!isOpen) return null; // Don't render the modal if not open

  const isView = mode === "view";
  const title = mode === "edit" ? "Update Record" : isView ? "Service Record" : "Create Maintenance";
  // const buttonLabel = mode === "edit" ? "Update" : "Submit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto overflow-x-hidden">
      {loading && (
        <div className="w-full h-full bg-slate-100 bg-opacity-70 absolute z-50">
          <LoadingScreen text={"Submitting ..."}></LoadingScreen>
        </div>
      )}

      {/* Modal Content */}
      <div className="bg-white py-2 sm:rounded-lg shadow-lg sm:w-fit w-full sm:h-fit h-full">
        {/* Header */}
        <div className="flex px-4 py-2 border-b">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none ml-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form className="p-6 bg-white w-full" onSubmit={handleSubmit}>
          <h2 className="text-4xl font-bold mb-4 uppercase text-center">
            {title}
          </h2>

          <div className="md:flex gap-4">
            <div className="w-full mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="ServicedDate"
              >
                Serviced Date
              </label>
              <input
                type="date"
                id="ServicedDate"
                className="w-full p-2 mr-24 border rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                defaultValue={ServicedDate}
                onFocus={(e) => !isView && e.target.showPicker?.()}
                onChange={(e) => setServicedDate(e.target.value)}
                required={!isView}
                disabled={isView}
              />
            </div>
            <div className="mb-4 w-full">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="MechanicName"
              >
                Serviced By
              </label>
              <input
                type="text"
                id="MechanicName"
                className="w-full p-2 border rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                placeholder="Bruce McLaren"
                value={MechanicName}
                onChange={(e) => setMechanicName(e.target.value)}
                disabled={isView}
              />
            </div>
          </div>

          <div className="md:flex gap-4">
            <div className="w-full mb-4">
              <div className="flex gap-2">
                <label
                  className="block text-sm font-medium my-auto"
                  htmlFor="Odometer"
                >
                  Odometer
                </label>
                <fieldset
                  className="my-2 text-sm gap-2 inline-flex justify-center border border-slate-300 rounded-full disabled:opacity-50"
                  onChange={handleOdoChange}
                  disabled={isView}
                >
                  <div className="p-2 flex gap-1">
                    <input
                      type="radio"
                      id="huey"
                      name="drone"
                      value="km"
                      checked={OdometerMetric === "km"}
                    />
                    <label htmlFor="huey">KM</label>
                  </div>

                  <div className="p-2 flex gap-1">
                    <input
                      type="radio"
                      id="dewey"
                      name="drone"
                      value="miles"
                      checked={OdometerMetric === "miles"}
                    />
                    <label htmlFor="dewey">Miles</label>
                  </div>

                  <div className="p-2 flex gap-1">
                    <input
                      type="radio"
                      id="louie"
                      name="drone"
                      value="hours"
                      checked={OdometerMetric === "hours"}
                    />
                    <label htmlFor="louie">Hours</label>
                  </div>
                </fieldset>
              </div>

              <input
                type="number"
                id="Odometer"
                className="w-full p-2 border rounded disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                placeholder="150000"
                value={Odometer}
                onChange={(e) => setOdometer(e.target.value)}
                disabled={isView}
              />
            </div>
            <div className="w-full"></div>
          </div>

          <div className={`flex w-full items-start gap-1 transition-all${isView ? " pointer-events-none opacity-60" : ""}`}>
            {/* Cascading Dropdown */}
            <CascadingDropdown
              key={recordToEdit?.id ?? "new"}
              logServiceOptions={logServiceOptions}
              logOwnershipOptions={logOwnershipOptions}
              initialValue={initialDropdownSelection}
              onChange={(selected) => {
                setSelection(selected);
              }}
            />
          </div>

          <div>
            <textarea
              className="w-full h-24 bg-gray-200 mt-4 p-2 rounded disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder={isView ? "" : "Mobil - 10w-40 - 2qrts"}
              value={Comment}
              onChange={handleTextAreaChange}
              maxLength={250}
              disabled={isView}
            />
            <p className="text-sm text-gray-500 text-right">
              {Comment.length}/250
            </p>
          </div>
          <div>
            {isView ? (
              recordToEdit?.FileUrls?.length ? (
                <div className="mt-2 flex flex-col gap-1">
                  {recordToEdit.FileUrls.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="text-rose-500 hover:underline text-sm truncate">
                      {url.split("/").pop() || `File ${i + 1}`}
                    </a>
                  ))}
                </div>
              ) : null
            ) : (
              <input
                type="file"
                id="Reciept"
                className="p-2 w-full bg-gray-100"
                multiple
                onChange={handleFilesChange}
              />
            )}
          </div>

          {!isView && (
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-1/2 p-2 bg-rose-500 text-white font-bold uppercase rounded mt-4 hover:bg-rose-600"
              >
                Submit
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
