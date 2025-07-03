import React, { useState } from "react";

import { Section } from "./Section";
import { Button } from "./Button";
import { CreateRecord } from "./CreateRecord";
import { Svg } from "./Svg";

export interface LogHistoryProps {
  logServiceRecords: ServiceRecord[];
}

export default function LogHistory({
  logServiceRecords,
}: LogHistoryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

const toggleInfo = (id: string) => {
    // console.log(id);
    setExpandedItemId(expandedItemId === id ? null : id); // Toggle logic
};

  // State to hold the service logs
  const [serviceRecords, setServiceRecords] =
    useState<ServiceRecord[]>(logServiceRecords);

  const updateRecords = (newRecord: ServiceRecord) => {
    setServiceRecords((prevRecords) => [newRecord, ...prevRecords]);
  };


//   const formattedLongDate = (strDate: string) => {
//     const rawDate = new Date(strDate);

//     const longDate = rawDate.toLocaleDateString("en-NZ", {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });

//     return longDate;
//   };

  const formattedShortDate = (strDate: string) => {
    const rawDate = new Date(strDate);

    const shortDate = rawDate.toLocaleDateString("en-NZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }); // "04/03/2025"

    return shortDate;
  };

  return (
     <Section
     id={""}
     className="h-full w-full mx-0 xl:px-80 lg:px-48 md:px-24 sm:px-16 sm:py-16 py-8 bg-slate-100"
 >
     <Button
         label={"＋"}
         type={"button"}
         size={"default"}
         onClick={() => openModal()}
         className="font-black bg-blue-500 text-white lexend-font fixed bottom-8 left-1/2 transform -translate-x-1/2"
     />

     <div className="flex justify-end">
         <Button
             type={"button"}
             size={"default"}
             className={"bg-rose-500 text-white my-8 font-bold"}
             label="Download PDF"
         />
     </div>
     <ul className="w-full mx-auto px-1">
         {serviceRecords.map((record, recordIndex) => (
             <li key={recordIndex} className="mb-3">
                 {/* Large screen */}
                 <div className="px-4 py-2 sm:flex md:gap-16 sm:gap-8 gap-4 text-lg font-normal leading-tight lexend-font justify-between sm:block hidden rounded-t-md bg-slate-200">
                     <h3>{record.ServicedDate}</h3>
                     <h3 className="text-center">{record.Odometer}km</h3>
                     <h3 className="ml-auto">{record.MechanicName}</h3>
                 </div>
                 {/* Small screen */}
                 {/* <div className="text-lg font-normal leading-tight lexend-font w-full sm:hidden">
                     <h3 className="px-4">{record.ServicedDate}</h3>
                     <div className="flex bg-white px-4 py-2 mt-4">
                         <h3>{record.Odometer}km</h3>
                         <h3 className="ml-auto">{record.MechanicName}</h3>
                     </div>
                 </div> */}

                 <div className="w-full bg-white rounded-full">
                    {record.CompletedTasks.map((task, taskIndex) => (
                        <div key={taskIndex} className="w-full">
                            {/* Row */}
                            <div className="flex flex-wrap sm:flex-nowrap items-center py-2 px-2 sm:px-8">
                                {/* Button column */}
                                <div className="px-2">
                                    <Button
                                        label=""
                                        className="mx-2"
                                        type="button"
                                        size="small"
                                    >
                                        <Svg type="marker1" size="md" color="rose-400" />
                                    </Button>
                                </div>

                                {/* Task name */}
                                <div className="mr-auto w-5/12">
                                    <div className="overflow-hidden text-ellipsis whitespace-nowrap px-2 capitalize font-semibold">
                                        {task.Task}
                                    </div>
                                    <div className="px-2 text-gray-400 text-sm font-semibold">
                                        {record.Odometer} km
                                    </div>
                                </div>
                                

                                {/* Comment - visible on large screens */}
                                <div className="w-1/4 px-2 hidden sm:block">
                                    {task.Comment}
                                </div>

                                {/* Toggle button */}
                                <div className="px-4 ml-auto justify-end h-10">
                                    <div className="font-semibold">
                                        {formattedShortDate(record.ServicedDate)}
                                    </div>
                                    <Button
                                        className="ml-auto justify-end ml-[62%] p-0 m-[-15px]"
                                        type="button"
                                        size="small"
                                        onClick={toggleInfo}
                                        param={recordIndex.toString() + taskIndex.toString()}
                                    >
                                        <Svg
                                            type="angle-small-down2"
                                            size="md"
                                            color="slate-700"
                                        />
                                    </Button>
                                </div>
                            </div>

                            {/* Expanded section */}
                            {expandedItemId === recordIndex.toString() + taskIndex.toString() && (
                                <>
                                    <div className="bg-slate-200 text-gray-700 text-center py-2 px-2 sm:px-8">
                                        {task.Comment}
                                    </div>
                                    <div className="bg-slate-200 text-gray-700 px-4 py-2 flex flex-wrap gap-4">
                                        {task.Receipts.map((receipt, receiptIndex) => (
                                            <li
                                                key={receiptIndex}
                                                className="list-none inline-flex px-2"
                                            >
                                                <a
                                                    href={receipt}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-center text-sky-600 text-lg roboto-flex-font"
                                                >
                                                    <Svg
                                                        type="file-download1"
                                                        size="5xl"
                                                        color="sky-600"
                                                    />
                                                    File {receiptIndex + 1}
                                                </a>
                                            </li>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                 </div>
             </li>
         ))}
     </ul>

     <CreateRecord
         isOpen={isModalOpen}
         onClose={closeModal}
         onInsert={updateRecords}
     ></CreateRecord>
 </Section>
  );
}
