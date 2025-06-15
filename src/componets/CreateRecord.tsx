import React, { useState } from "react";
import { useLocation } from "react-router-dom";
// import Select, { SingleValue } from "react-select";

import { Button } from "./Button";
import { LoadingScreen } from "./LoadingScreen";
import { Svg } from "./Svg";

export interface CreateRecordProps {
  isOpen: boolean; // Controls if the modal is visible
  onClose: () => void; // Function to close the modal
  onInsert: (newRecord: ServiceRecord) => void;
}

export interface TaskOption {
  readonly value: string;
  readonly label: string;
}

export const flavourOptions: readonly TaskOption[] = [
  { value: "vanilla", label: "Vanilla" },
  { value: "chocolate", label: "Chocolate" },
  { value: "strawberry", label: "Strawberry" },
  { value: "salted-caramel", label: "Salted Caramel" },
];

export const maintenanceOptions: readonly TaskOption[] = [
  { value: "oil change", label: "oil change" },
  { value: "air filter replacement", label: "air filter replacement" },
  { value: "chain lubrication", label: "chain lubrication" },
  { value: "coolant replacement", label: "coolant replacement" },
  { value: "tyre pressure check", label: "tyre pressure check" },
  { value: "battery check & charging", label: "battery check & charging" },
  { value: "clutch adjustment", label: "clutch adjustment" },
];

export const inspectionOptions: readonly TaskOption[] = [
  { value: "brake inspection", label: "brake inspection" },
  {
    value: "tyre tread depth inspection",
    label: "tyre tread depth inspection",
  },
  {
    value: "lights and indicators inspection",
    label: "lights and indicators inspection",
  },
  { value: "suspension inspection", label: "suspension inspection" },
  { value: "steering inspection", label: "steering inspection" },
  { value: "exhaust system inspection", label: "exhaust system inspection" },
  { value: "fluid leak inspection", label: "fluid leak inspection" },
  {
    value: "cables and controls inspection",
    label: "cables and controls inspection",
  },
];

export const modificationOptions: readonly TaskOption[] = [
  { value: "exhaust upgrade", label: "exhaust upgrade" },
  { value: "handlebar replacement", label: "handlebar replacement" },
  { value: "LED lighting installation", label: "LED lighting installation" },
  { value: "custom paint job", label: "custom paint job" },
  { value: "seat replacement", label: "seat replacement" },
  {
    value: "performance air filter installation",
    label: "performance air filter installation",
  },
  { value: "suspension tuning", label: "suspension tuning" },
  { value: "engine tuning/remapping", label: "engine tuning/remapping" },
];

export const diagnosticOptions: readonly TaskOption[] = [
  { value: "ECU scan", label: "ECU scan" },
  { value: "engine noise analysis", label: "engine noise analysis" },
  { value: "fuel system diagnostic", label: "fuel system diagnostic" },
  {
    value: "electrical system troubleshooting diagnostic",
    label: "electrical system troubleshooting diagnostic",
  },
  {
    value: "sensor calibration diagnostic",
    label: "sensor calibration diagnostic",
  },
  { value: "ignition system diagnostic", label: "ignition system diagnostic" },
  { value: "compression diagnostic", label: "compression diagnostic" },
  { value: "charging system diagnostic", label: "charging system diagnostic" },
];

export interface StateOption {
  readonly value: string;
  readonly label: string;
}

export interface GroupedOption {
  readonly label: string;
  readonly options: readonly TaskOption[];
}

export const groupedOptions: readonly GroupedOption[] = [
  {
    label: "maintenance",
    options: maintenanceOptions,
  },
  {
    label: "inspection",
    options: inspectionOptions,
  },
  {
    label: "modification",
    options: modificationOptions,
  },
  {
    label: "diagnostic",
    options: diagnosticOptions,
  },
];

// const groupStyles = {
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "space-between",
// };
// const groupBadgeStyles: CSSProperties = {
//   backgroundColor: "#EBECF0",
//   borderRadius: "2em",
//   color: "#172B4D",
//   display: "inline-block",
//   fontSize: 12,
//   fontWeight: "normal",
//   lineHeight: "1",
//   minWidth: 1,
//   padding: "0.16666666666667em 0.5em",
//   textAlign: "center",
// };

// const formatGroupLabel = (data: GroupedOption) => (
//   <div style={groupStyles}>
//     <span>{data.label}</span>
//     <span style={groupBadgeStyles}>{data.options.length}</span>
//   </div>
// );

/** Primary UI component for user interaction */
export const CreateRecord = ({
  isOpen,
  onClose,
  onInsert,
}: CreateRecordProps) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token"); // Extract the 'token' value

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [Token] = useState<string>(token ?? "");
  const [TagId] = useState<string>("");
  const [ServicedDate, setServicedDate] = useState<string>("");
  const [MechanicName, setMechanicName] = useState<string>("");
  const [Odometer, setOdometer] = useState<number>();
  const [OdometerMetric, setOdometerMetric] = useState<string>("km");
  // const [PendingCompletedTasks, setPendingCompletedTasks] = useState<PendingTaskCompleted[]>([]);

  const [taskRows, setTaskRows] = useState<number[]>([0]);

  // State to hold the selected values for each row, using the index as the key
  const [selectedValues, setSelectedValues] = useState<{
    [key: number]: { task: string; comment: string; receipts: File[] };
  }>({});

  
  // Handle change for both select and input fields
  const handleChange = (
    index: number,
    field: "task" | "comment" | "receipts",
    value: string | File[] // Allow File[] for "receipts"
  ) => {
    setSelectedValues((prevState) => ({
      ...prevState,
      [index]: {
        ...prevState[index],
        [field]: field === "receipts" ? (value as File[]) : value, // Type cast value to File[] when receipts
      },
    }));
  };

  const handleFileChange = (index: number, files: FileList | null) => {
    if (files) {
      handleChange(index, "receipts", Array.from(files)); // Pass File[] correctly
    }
  };


  const handleOdoChange = (event :any) => {
    setOdometerMetric(event.target.value);
  };

  const [expandedTaskIndex, setExpandedTaskIndex] = useState<string | null>("0");

  const toggleExpandedTask = (index: string) => {
    // console.log(id);
    setExpandedTaskIndex(expandedTaskIndex === index ? null : index); // Toggle logic
  };

  const cleanFields = () => {
    setSelectedValues({});
    setTaskRows([0]);
    setExpandedTaskIndex("0");
  };

  const handleAddSupply = () => {
    setTaskRows([...taskRows, taskRows[taskRows.length - 1] + 1]);
    toggleExpandedTask(`${parseInt(expandedTaskIndex ?? "0") + 1}`);
  };

  const handleDeleteSupply = (index: number) => {
    var tempTaskRows: number[] = [];

    taskRows.map((task) => {
      if (task !== index) {
        tempTaskRows.push(task);
      }
      return <></>
    })

    setSelectedValues((prev) => {
      const updatedValues = { ...prev }; // Create a new copy
      delete updatedValues[index]; // Remove the key
      return updatedValues;
    });
    
    setTaskRows(tempTaskRows);

  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const pendingTasksArray: PendingTaskCompleted[] = Object.entries(
      selectedValues
    ).map(([_key, value]) => ({
      Task: value.task, // Ensure uppercase property names match PendingTaskCompleted
      Comment: value.comment,
      Receipts: value.receipts ?? [], // Keep as File[]. ?? if value.receipts is undefined
    }));

    // setPendingCompletedTasks(pendingTasksArray);

    const currDate: Date = new Date(); // Current date and time

    const formData = new FormData();
    formData.append("Token", Token);
    formData.append("TagId", TagId);
    formData.append("EnteredDate", currDate.toString());
    formData.append("ServicedDate", ServicedDate);
    formData.append("MechanicName", MechanicName);
    formData.append("Odometer", (Odometer?.toString() ?? "0") + " " + OdometerMetric);

    // Append PendingCompletedTasks array
    pendingTasksArray.forEach((task, index) => {
      formData.append(`tasks[${index}][Task]`, task.Task);
      formData.append(`tasks[${index}][Comment]`, task.Comment);

      // Append each file in Receipts
      task.Receipts.forEach((file) => {
        formData.append(`tasks[${index}][Receipts]`, file);
      });
    });

    const fetchData = async () => {
      try {
        const response = await fetch(
          // "https://logmate.azurewebsites.net/api/SubmitRecord?record=" +
          //   jsonData +
          //   ""
          "https://logmate.azurewebsites.net/api/SubmitRecord",
          {
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

        var completedTasks: TaskCompleted[] = insertedRecord.completedTasks.map(
          (t: any) => {
            var completedTask: TaskCompleted = {
              Task: t.task,
              Comment: t.comment,
              Receipts: t.receipts,
            };
            return completedTask;
          }
        );
        // Map response to ServiceRecord interface
        const serviceRecord: ServiceRecord = {
          id: insertedRecord.id,
          TagID: insertedRecord.tagId, // Map TagId from backend to TagID in frontend
          EnteredDate: insertedRecord.enteredDate,
          ServicedDate: insertedRecord.servicedDate,
          MechanicName: insertedRecord.mechanicName,
          Odometer: insertedRecord.odometer,
          CompletedTasks: completedTasks || [],
          PendingCompletedTasks: [],
          Certified: insertedRecord.certified ?? false, // Default to false if not present
        };

        console.log("Mapped ServiceRecord:", serviceRecord);

        onInsert(serviceRecord); // Update LogHistory
        onClose(); // Close modal
        setIsLoading(false);
      } catch (err: any) {
        console.log(err);
      }
    };

    fetchData();

    setIsLoading(true);
    cleanFields();
  };
  if (!isOpen) return null; // Don't render the modal if not open

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
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
              className="w-5 h-5"
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
                value={ServicedDate}
                onChange={(e) => setServicedDate(e.target.value)}
              />
            </div>
            <div className="mb-4 w-full">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="MechanicName"
              >
                Full Name
              </label>
              <input
                type="text"
                id="MechanicName"
                className="w-full p-2 border rounded"
                placeholder="Mr. Worldwide"
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
                <fieldset className="my-2 text-sm gap-2 inline-flex justify-center border border-slate-300 rounded-full" onChange={handleOdoChange}>
                  <div className="p-2 flex gap-1">
                    <input type="radio" id="huey" name="drone" value="km" />
                    <label>KM</label>
                  </div>

                  <div className="p-2 flex gap-1">
                    <input type="radio" id="dewey" name="drone" value="miles" />
                    <label>Miles</label>
                  </div>

                  <div className="p-2 flex gap-1">
                    <input type="radio" id="louie" name="drone" value="hours" />
                    <label>Hours</label>
                  </div>
                </fieldset>
              </div>
              
              <input
                type="number"
                id="Odometer"
                className="w-full p-2 border rounded"
                placeholder="150000"
                value={Odometer}
                onChange={(e) => setOdometer(Number(e.target.value) || 0)}
              />
            </div>
            <div className="w-full"></div>
          </div>

          <div>
            <div className="bg-gray-100 w-full text-center py-2">
              <h2 className="text-xl font-semibold uppercase funnel-display-font">
                Services
              </h2>
            </div>
            {taskRows.map((index) => (
              <div key={index} className="">
                {expandedTaskIndex === index.toString() ? (
                  <>
                    <div className="">
                      {/* <Select<TaskOption, false, GroupedOption>
                        defaultValue={maintenanceOptions[0]}
                        options={groupedOptions}
                        formatGroupLabel={formatGroupLabel}
                        onChange={(selected: SingleValue<TaskOption>) =>
                          handleChange(
                            index,
                            "task",
                            selected?.valueOf()["value"] ?? ""
                          )
                        }
                        className="w-full capitalize"
                      /> */}
                    </div>
                    <div>
                      <textarea
                        id="Comment"
                        className="p-2 w-full border focus:outline-none"
                        rows={3}
                        value={selectedValues[index]?.comment || ""}
                        onChange={(e) =>
                          handleChange(index, "comment", e.target.value)
                        }
                        placeholder="mobil - 10w-40 - 4qurts"
                      />
                    </div>
                    <div>
                      <input
                        type="file"
                        id="Reciept"
                        className="p-2 w-full bg-gray-100"
                        multiple
                        onChange={(e) =>
                          handleFileChange(index, e.target.files)
                        }
                      />
                    </div>
                  </>
                ) : (
                  <>
                  <div className="flex w-full bg-sky-50 border">
                    <Button
                      className="mx-2 mx-auto py-1"
                      type={"button"}
                      size={"xs"}
                      onClick={toggleExpandedTask}
                      param={index.toString()}
                      children={
                        <>
                          <h2 className="capitalize">{selectedValues[index]?.task ?? "oil change"}</h2>
                          <div className="flex justify-center h-[20px] mt-[-12px]">
                            <Svg
                              type="angle-small-down2"
                              size="md"
                              color="slate-700"
                            />
                          </div>
                        </>
                      }
                    />
                    <Button
                      className="mr-2 ml-auto"
                      type={"button"}
                      size={"xs"}
                      onClick={handleDeleteSupply}
                      param={index}
                      children={
                        <>
                          <div className="flex justify-end">
                            <Svg
                              type="cross-circle"
                              size="md"
                              color="rose-500"
                            />
                          </div>
                        </>
                      }
                    />
                  </div>
                    
                  </>
                )}
              </div>
            ))}
            <div className="py-4">
              <div className="flex justify-center">
                <Button
                  label="＋"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-black"
                  onClick={handleAddSupply}
                  size={"default"}
                  type={"button"}
                ></Button>
              </div>
            </div>
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
