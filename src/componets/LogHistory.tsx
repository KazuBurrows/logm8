import React, { useEffect, useRef, useState } from "react";

import { Section } from "./Section";
import { Button } from "./Button";
import { CreateRecord } from "./CreateRecord";
import { Svg } from "./Svg";
import { groupedOptions } from "../types/serviceOptions";

export interface LogHistoryProps {
  logServiceRecords: ServiceRecord[];
}

export default function LogHistory({ logServiceRecords }: LogHistoryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const toggleInfo = (id: string) => {
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

  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>(
    []
  );
  const filteredRecords = selectedServiceTypes.length
    ? serviceRecords.filter((record) =>
        selectedServiceTypes.includes(record.ServiceType)
      )
    : serviceRecords;

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isFilterOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  return (
    <Section
      id={""}
      className="h-full w-full mx-0 xl:px-80 lg:px-48 md:px-24 sm:px-16 sm:py-16 py-8 bg-slate-100 pb-24"
    >
      {/* Create Record Button START */}
      <Button
        type="button"
        size="small"
        onClick={() => openModal()}
        className="
          fixed bottom-8 right-8
          w-18 h-18 
          rounded-full
          border-4 border-blue-400
          bg-transparent
          text-white text-2xl font-bold
          flex items-center justify-center
          shadow-lg
          hover:scale-110 transition-transform duration-200
          shadow-[0_0_5px_5px_rgba(59,130,246,0.3)]
          z-10
        "
      >
        {/* <h1 className="text-lg font-bold my-3">New</h1> */}
        <Svg type="add1" size="base" color="blue-400" />
      </Button>
      {/* Create Record Button END */}

      <div className="relative" ref={dropdownRef}>
        <div className="flex">
          <button
            type="button"
            className="w-[130px] border border-gray-200 rounded-2xl px-4 py-1 bg-white text-center ml-auto mb-1"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            {selectedServiceTypes.length > 0
              ? `${selectedServiceTypes.length} selected`
              : "Filter"}
          </button>
        </div>

        <div className="relative">
          {isFilterOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40">
              {/* Modal container */}
              <div className="bg-white w-full h-full md:w-10/12 md:h-auto md:mt-10 rounded-none md:rounded-2xl shadow-lg overflow-y-auto p-4">
                {/* Top bar with Close & Clear */}
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => setSelectedServiceTypes([])}
                    className="text-2xl text-red-600 hover:underline"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="flex bg-green-200 px-2 rounded rounded-full"
                  >
                    <Svg type={"check"} color="green-500" size="md"></Svg> <span className="text-green-500 text-2xl font-semibold pl-1">Done</span>
                  </button>
                </div>

                {/* Options */}
                {groupedOptions.map((group) => (
                  <fieldset key={group.label} className="mb-4">
                    <legend className="font-semibold text-4xl text-gray-700 mb-1 capitalize">
                      {group.label}
                    </legend>
                    <div className="space-y-2 pl-2">
                      {group.options.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex items-center space-x-2 text-2xl"
                        >
                          <input
                            type="checkbox"
                            value={opt.value}
                            checked={selectedServiceTypes.includes(opt.value)}
                            onChange={(e) => {
                              const value = e.target.value;
                              setSelectedServiceTypes((prev) =>
                                e.target.checked
                                  ? [...prev, value]
                                  : prev.filter((v) => v !== value)
                              );
                            }}
                            className="
                              appearance-none w-5 h-5 
                              border-2 border-gray-400 
                              checked:bg-red-500 checked:border-red-500 
                              rounded 
                              transition-colors
                            "
                          />
                          <span className="capitalize">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* <div className="flex justify-end">
         <Button
             type={"button"}
             size={"default"}
             className={"bg-rose-500 text-white my-8 font-bold"}
             label="Download PDF"
         />
     </div> */}
      <ul className="w-full mx-auto px-1">
        {filteredRecords.map((record, recordIndex) => (
          <li key={recordIndex} className="mb-3">
            <div className="w-full bg-white rounded-2xl shadow shadow-slate-300/80">
              <div
                key={recordIndex.toString()}
                className="w-full cursor-pointer"
                onClick={() => toggleInfo(recordIndex.toString())}
              >
                {/* Row */}
                <div className="flex flex-wrap sm:flex-nowrap items-center py-2 px-2 sm:px-8">
                  {/* Button column */}
                  <div className="px-2">
                    <Button label="" className="" type="button" size="small">
                      <Svg type="marker3" size="md" color="rose-400" />
                    </Button>
                  </div>

                  {/* Task name */}
                  <div className="mr-auto w-5/12">
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap px-2 capitalize font-semibold">
                      {record.ServiceType}
                    </div>
                    <div className="px-2 text-gray-400 text-sm font-semibold">
                      {record.Odometer}
                    </div>
                  </div>

                  {/* Comment - visible on large screens */}
                  <div className="w-1/4 px-2 hidden md:block truncate">
                    {record.Comment}
                  </div>

                  <div className="px-4 text-right justify-end h-10 w-2/6">
                    <div className="font-semibold">
                      {formattedShortDate(record.ServicedDate)}
                    </div>
                    <div className="text-right text-gray-400 text-sm font-semibold truncate">
                      {record.MechanicName}
                    </div>
                  </div>
                </div>

                <div className="flex">
                  <Button
                    className="mx-auto flex p-0 m-[-25px] translate-y-[-13px]"
                    type="button"
                    size="small"
                    onClick={toggleInfo}
                    param={recordIndex.toString()}
                  >
                    <Svg type="angle-small-down2" size="md" color="slate-700" />
                  </Button>
                </div>
                {/* Expanded section */}
                {expandedItemId === recordIndex.toString() && (
                  <div className="bg-slate-200 text-gray-700 text-center py-2 px-2 sm:px-8 rounded-b-2xl">
                    <div>{record.Comment}</div>
                    <div className="px-4 py-2 flex flex-wrap gap-4">
                      {record.FileUrls?.map((fileUrl, fileIndex) => (
                        <li
                          key={fileIndex}
                          className="list-none inline-flex px-2"
                        >
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-center text-sky-600 text-lg roboto-flex-font"
                          >
                            <Svg
                              type="file-download1"
                              size="2xl"
                              color="sky-600"
                            />
                            File {fileIndex + 1}
                          </a>
                        </li>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
