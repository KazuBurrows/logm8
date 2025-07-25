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
      className="h-full w-full mx-0 xl:px-80 lg:px-48 md:px-24 sm:px-16 sm:py-16 py-8 bg-slate-100"
    >
      <Button
        // label={"＋"}
        type={"button"}
        size={"small"}
        onClick={() => openModal()}
        className="font-black bg-blue-500 text-white lexend-font fixed bottom-8 left-1/2 transform -translate-x-1/2 shadow-xl hover:scale-125"
      >
        <Svg type={"add3"} size="lg" color="white"></Svg>
      </Button>

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
          {/* parent container */}
          {isFilterOpen && (
            <div className="absolute right-0 z-10 md:w-5/12 w-9/12 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-64 overflow-y-auto p-4">
              {/* Clear All Button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setSelectedServiceTypes([])}
                  className="text-sm text-red-600 hover:underline"
                >
                  Clear All
                </button>
              </div>

              {groupedOptions.map((group) => (
                <fieldset key={group.label} className="mb-4">
                  <legend className="font-semibold text-sm text-gray-700 mb-1 capitalize">
                    {group.label}
                  </legend>
                  <div className="space-y-2 pl-2">
                    {group.options.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center space-x-2 text-sm"
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
                          className="accent-red-500"
                        />
                        <span className="capitalize">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
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
                    <Button
                      label=""
                      className=""
                      type="button"
                      size="small"
                    >
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
