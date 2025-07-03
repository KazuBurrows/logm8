import React, { useState } from "react";

import { Section } from "./Section";
import { Button } from "./Button";
import { CreateRecord } from "./CreateRecord";
import { Svg } from "./Svg";

export interface LogHistoryProps {
  logServiceRecords: ServiceRecord[];
  checkExpiration: () => void;
}

export default function LogHistory({
  logServiceRecords,
  checkExpiration,
}: LogHistoryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
    checkExpiration();
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


  const openServiceDetails = () => {
    console.log("test")
  }

  return (
    <Section
      id={""}
      className="h-full w-full mx-0 xl:px-80 lg:px-48 md:px-24 sm:px-16 sm:py-16 py-8 bg-gray-50"
    >
      
      <div className="flex justify-end">
        <Button
          type={"button"}
          size={"default"}
          className={"bg-rose-500 text-white my-8 font-bold"}
          label="Download PDF"
        />
      </div>
      <div className="overflow-x-auto">
        <div className="w-full">
          {/* Table Header */}
          <div className="w-full rounded-2xl flex items-center h-12 bg-gray-100 text-gray-400 font-medium">
            <p className="flex-1 text-center py-1">Serviced Date</p>
            <p className="flex-1 text-center py-1">Odometer</p>
            <p className="flex-1 text-center py-1">Mechanic Name</p>
          </div>

          {/* Table Body */}
          <div>
            {serviceRecords.map((record, index) => (
              <div 
                key={index} 
                className="transition-transform duration-300 hover:scale-102 hover:bg-white hover:shadow-md flex items-center h-12 rounded-2xl"
                onClick={openServiceDetails}
              >
                <p className="flex-1 text-center py-1">{record.ServicedDate}</p>
                <p className="flex-1 text-center py-1">{record.Odometer} km</p>
                <p className="flex-1 text-center py-1">{record.MechanicName}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ul className="w-full mx-auto">
        {serviceRecords.map((record, recordIndex) => (
          <li key={recordIndex} className="mb-12">
            {/* Large screen */}
            <div className="px-4 py-2 sm:flex md:gap-16 sm:gap-8 gap-4 text-lg font-normal leading-tight lexend-font justify-between sm:block hidden rounded-t-md bg-slate-200">
              <h3>{record.ServicedDate}</h3>
              <h3 className="text-center capitalize">{record.Odometer}</h3>
              <h3 className="ml-auto">{record.MechanicName}</h3>
            </div>
            {/* Small screen */}
            <div className="text-lg font-normal leading-tight lexend-font w-full sm:hidden">
              <h3 className="px-4">{record.ServicedDate}</h3>
              <div className="flex bg-white px-4 py-2 mt-4">
                <h3>{record.Odometer}km</h3>
                <h3 className="ml-auto">{record.MechanicName}</h3>
              </div>
            </div>

            <table className="sm:rounded-b-md bg-white shadow-[2px_4px_23px_-19px_rgba(0,_0,_0,_0.1)] w-full">
              <tbody>
                {record.CompletedTasks.map((task, taskIndex) => (
                  <>
                    <tr
                      key={taskIndex}
                      className="border-t border-slate-100 w-full"
                    >
                      {/* Large screen */}
                      <td className="w-1/4 px-2 py-4 sm:pl-8 pl-2">
                        <Button
                          label={""}
                          className="mx-2"
                          type={"button"}
                          size={"small"}
                          children={
                            <Svg type="download2" size="md" color="rose-400" />
                          }
                        />
                      </td>

                      <td className="w-1/4 px-2 capitalize">{task.Task}</td>
                      <td className="w-1/4 px-2 sm:table-cell hidden">
                        {task.Comment}
                      </td>

                      <td className="w-2/12 px-2 sm:pr-8 pr-2">
                        <div className="flex justify-end">
                          <Button
                            className="mx-2"
                            type={"button"}
                            size={"small"}
                            onClick={toggleInfo}
                            param={
                              recordIndex.toString() + taskIndex.toString()
                            }
                            children={
                              <Svg
                                type="angle-small-down2"
                                size="xl"
                                color="slate-700"
                              />
                            }
                          />
                        </div>
                      </td>
                    </tr>
                    {expandedItemId ===
                    recordIndex.toString() + taskIndex.toString() ? (
                      <>
                        <tr className="bg-slate-200 text-gray-700">
                          <td className="text-center py-2" colSpan={4}>
                            {task.Comment}
                          </td>
                        </tr>
                        <tr className="bg-slate-200 text-gray-700">
                          <td className="gap-8 px-4" colSpan={4}>
                            {task.Receipts.map((receipt, receiptIndex) => (
                              <li
                                key={receiptIndex}
                                className="inline-flex px-2"
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
                          </td>
                        </tr>
                      </>
                    ) : (
                      <></>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </li>
        ))}
      </ul>

      <div className="fixed inset-0 z-50 flex items-center justify-center mx-auto my-auto bg-white w-8/12 h-1/3">
        <div className="w-full">
          {/* Table Header */}
          <div className="w-full rounded-2xl flex items-center h-12 bg-gray-100 text-gray-400 font-medium">
            <p className="flex-1 text-center py-1">Serviced Date</p>
            <p className="flex-1 text-center py-1">Odometer</p>
            <p className="flex-1 text-center py-1">Mechanic Name</p>
          </div>

          {/* Table Body */}
          <div>
              <div 
                key={100} 
                className="transition-transform duration-300 hover:scale-102 hover:bg-white hover:shadow-md flex items-center h-12 rounded-2xl"
                onClick={openServiceDetails}
              >
                <p className="flex-1 text-center py-1">{serviceRecords[4].ServicedDate}</p>
                <p className="flex-1 text-center py-1">{serviceRecords[4].Odometer} km</p>
                <p className="flex-1 text-center py-1">{serviceRecords[4].MechanicName}</p>
              </div>
          </div>
          <div>
            {serviceRecords[4].CompletedTasks.map((task, taskIndex) => (
              <div>
                <p>{task.Task}</p>
                <p>{task.Comment}</p>
                <div>
                {task.Receipts.map((receipt, receiptIndex) => (
                    <li
                      key={receiptIndex}
                      className="inline-flex px-2"
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
              </div>
            ))}
          </div>
        </div>
      </div>


      <Button
        label={"＋"}
        type={"button"}
        size={"default"}
        onClick={() => openModal()}
        className="font-black bg-blue-500 text-white lexend-font fixed bottom-8 left-1/2 transform -translate-x-1/2"
      />
      <CreateRecord
        isOpen={isModalOpen}
        onClose={closeModal}
        onInsert={updateRecords}
      ></CreateRecord>
    </Section>
  );
}
