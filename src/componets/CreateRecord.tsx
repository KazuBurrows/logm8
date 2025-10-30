import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { LoadingScreen } from "./LoadingScreen";
// import { groupedOptions } from "../types/serviceOptions";
import CascadingDropdown from "./CascadingDropdown";

export interface CreateRecordProps {
  isOpen: boolean; // Controls if the modal is visible
  onClose: () => void; // Function to close the modal
  onInsert: (newRecord: ServiceRecord) => void;
  logServiceOptions: ServiceOption[];
}

/** Primary UI component for user interaction */
export const CreateRecord = ({
  isOpen,
  onClose,
  logServiceOptions
}: // onInsert,
CreateRecordProps) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token"); // Extract the 'token' value

  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const [Token] = useState<string>(token ?? "");
  const [TagId] = useState<string>("");
  const [ServicedDate, setServicedDate] = useState<string>("");
  const [MechanicName, setMechanicName] = useState<string>("");
  const [Odometer, setOdometer] = useState<string>("");
  const [OdometerMetric, setOdometerMetric] = useState<string>("km");
  // const [ServiceType, setServiceType] = useState<string>("");
  const [selection, setSelection] = useState<any>(null);
  const [Comment, setComment] = useState<string>("");
  const [Files, setFiles] = useState<File[]>([]);

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
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };
  const handleOdoChange = (event: any) => {
    setOdometerMetric(event.target.value);
  };

  // const cleanFields = () => {
  //   setTaskRows([0]);
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Helper function to check required fields
    const isValidForm = (): boolean => {
      if (!ServicedDate || ServicedDate.trim() === "") return false;
      if (!MechanicName || MechanicName.trim() === "") return false;
      if (!Odometer || Odometer.trim() === "") return false;
      if (!OdometerMetric || OdometerMetric.trim() === "") return false;
      if (!selection.subitem && !selection.subcategory && !selection.category) return false;
      if (!selection.serviceType) return false;
      return true;
    };

    if (!isValidForm()) {
      alert("Please fill all required fields before submitting.");
      return;
    }


    const currDate: Date = new Date(); // Current date and time

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
    // formData.append("ServiceType", ServiceType);

    const name = selection.subitem?.Name ?? selection.subcategory?.Name ?? selection.category?.Name ?? "None";
    formData.append("ServiceOption", name);
    formData.append("ServiceType", selection.serviceType);

    formData.append("Comment", Comment);
    Files.forEach((File) => {
      formData.append("Files", File);
    });

    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://logmate.azurewebsites.net/api/SubmitRecord", {
            method: "POST",
            body: formData,
          }
          // "http://localhost:7071/api/SubmitRecord", {
          //   method: "POST",
          //   body: formData,
          // }
        );

        const insertedRecord = await response.json();
        console.log("insertedRecord:", insertedRecord);

        // onInsert(serviceRecord); // Update LogHistory
        onClose(); // Close modal
        clearFields();
        setIsLoading(false);
      } catch (err: any) {
        console.log(err);
      }
    };

    fetchData();

    setIsLoading(true);
    // cleanFields();
  };
  if (!isOpen) return null; // Don't render the modal if not open

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto overflow-x-hidden">
      {isLoading ? (
        <div className="w-full h-full bg-slate-100 bg-opacity-70 absolute z-50">
          <LoadingScreen
            text={"Submitting completed maintenance..."}
          ></LoadingScreen>
        </div>
      ) : (
        <></>
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
            Maintenance
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
                className="w-full p-2 mr-24 border rounded"
                defaultValue={ServicedDate}
                onFocus={(e) => e.target.showPicker?.()}
                onChange={(e) => setServicedDate(e.target.value)}
                required
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
                className="w-full p-2 border rounded"
                placeholder="Bruce McLaren"
                value={MechanicName}
                onChange={(e) => setMechanicName(e.target.value)}
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
                  className="my-2 text-sm gap-2 inline-flex justify-center border border-slate-300 rounded-full"
                  onChange={handleOdoChange}
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
                className="w-full p-2 border rounded"
                placeholder="150000"
                value={Odometer}
                onChange={(e) => setOdometer(e.target.value)}
              />
            </div>
            <div className="w-full"></div>
          </div>

          
          <CascadingDropdown logServiceOptions={logServiceOptions} onChange={(selected) => setSelection(selected)} />

          <div>
            <textarea
              className="w-full h-24 bg-gray-200 mt-4 p-2 rounded"
              placeholder="Mobil - 10w-40 - 2qrts"
              value={Comment}
              onChange={handleTextAreaChange}
              maxLength={250} // <-- Maximum character limit
            />
            <p className="text-sm text-gray-500 text-right">
              {Comment.length}/250
            </p>
          </div>
          <div>
            <input
              type="file"
              id="Reciept"
              className="p-2 w-full bg-gray-100"
              multiple
              onChange={handleFilesChange}
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-1/2 p-2 bg-rose-500 text-white font-bold uppercase rounded mt-4 hover:bg-rose-600"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
