import React, { useEffect, useRef, useState } from "react";

import { Section } from "./Section";
import { Button } from "./Button";
import { CreateRecord } from "./CreateRecord";
import { Svg } from "./Svg";
import { groupedOptions } from "../types/serviceOptions";
import { sortedOptions } from "../types/sortOptions";
import { UserMode } from "../views/Log";
// import CascadingDropdown from "./CascadingDropdown";

export interface LogHistoryProps {
  logServiceRecords: ServiceRecord[];
  logServiceOptions: ServiceOption[];
  viewMode: string;
}

function toKm(value: string): number {
  const [valueStr, metric] = value.split(" ");
  switch (metric) {
    case "km":
      return parseInt(valueStr);
    case "miles":
      return parseInt(valueStr) * 1.60934; // miles → km
    case "hours":
      // hours → km depends on your assumption of avg speed
      // let's assume 40 km/h as a baseline
      return parseInt(valueStr) * 60;
    default:
      return parseInt(valueStr);
  }
}

// Neon/futuristic color scheme for each service type
const serviceTypeClasses: Record<string, string> = {
  Maintenance: "text-white bg-blue-900/50",
  Replacement: "text-white bg-red-900/50",
  Inspection: "text-white bg-green-900/50",
  Adjustment: "text-white bg-yellow-900/50",
  Tune: "text-white bg-purple-900/50",
};

const serviceStatClasses: Record<string, string> = {
  Maintenance: "text-white bg-blue-700/60",
  Replacement: "text-white bg-red-700/60",
  Inspection: "text-white bg-green-700/60",
  Adjustment: "text-white bg-yellow-700/60",
  Tune: "text-white bg-purple-700/60",
};

const glowClasses: Record<string, string> = {
  Maintenance: "drop-shadow-[0_0_2px_rgba(59,130,246,0.7)]",
  Replacement: "drop-shadow-[0_0_2px_rgba(248,113,113,0.7)]",
  Inspection: "drop-shadow-[0_0_2px_rgba(34,197,94,0.7)]",
  Adjustment: "drop-shadow-[0_0_2px_rgba(253,224,71,0.7)]",
  Tune: "drop-shadow-[0_0_2px_rgba(139,92,246,0.7)]",
};

export default function LogHistory({
  logServiceRecords,
  viewMode,
  logServiceOptions,
}: LogHistoryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [serviceRecordStats, setServiceRecordStats] = useState<
    [number, number, number, number, number]
  >([0, 0, 0, 0, 0]);

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

  // const formattedShortDate = (strDate: string) => {
  //   const rawDate = new Date(strDate);

  //   const shortDate = rawDate.toLocaleDateString("en-NZ", {
  //     day: "2-digit",
  //     month: "2-digit",
  //     year: "numeric",
  //   }); // "04/03/2025"

  //   return shortDate;
  // };

  const [selectedSortType, setSelectedSortType] = useState<string>("");
  const sortedRecords = React.useMemo(() => {
    let records = [...serviceRecords]; // copy so we don’t mutate state

    switch (selectedSortType) {
      case "Service Name A-Z":
        records.sort((a, b) => a.ServiceOption.localeCompare(b.ServiceOption));
        break;
      case "Service Name Z-A":
        records.sort((a, b) => b.ServiceOption.localeCompare(a.ServiceOption));
        break;
      case "Odometer High-Low":
        records.sort((a, b) => toKm(b.Odometer) - toKm(a.Odometer));
        break;

      case "Odometer Low-High":
        records.sort((a, b) => toKm(a.Odometer) - toKm(b.Odometer));
        break;
      case "Serviced Date New-Old":
        records.sort(
          (a, b) =>
            new Date(b.ServicedDate).getTime() -
            new Date(a.ServicedDate).getTime()
        );
        break;
      case "Serviced Date Old-New":
        records.sort(
          (a, b) =>
            new Date(a.ServicedDate).getTime() -
            new Date(b.ServicedDate).getTime()
        );
        break;
      default:
        // no sort applied
        break;
    }

    return records;
  }, [serviceRecords, selectedSortType]);

  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>(
    []
  );
  const filteredRecords = selectedServiceTypes.length
    ? sortedRecords.filter((record) =>
        selectedServiceTypes.includes(record.ServiceOption)
      )
    : sortedRecords;

  const [isSortOpen, setIsSortOpen] = useState(false);
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

  useEffect(() => {
    // Copy the current stats
    const tempServiceRecordStats: [number, number, number, number, number] = [
      ...serviceRecordStats,
    ];

    // Count service types
    serviceRecords.forEach((service) => {
      switch (service.ServiceType) {
        case "Maintenance":
          tempServiceRecordStats[0] += 1;
          break;
        case "Replacement":
          tempServiceRecordStats[1] += 1;
          break;
        case "Inspection":
          tempServiceRecordStats[2] += 1;
          break;
        case "Adjustment":
          tempServiceRecordStats[3] += 1;
          break;
        case "Tune":
          tempServiceRecordStats[4] += 1;
          break;
        default:
          console.warn("Unknown service type:", service.ServiceType);
          break;
      }
    });

    // Update state once
    setServiceRecordStats(tempServiceRecordStats);
  }, [serviceRecords]);

  return (
    <Section
      id={""}
      className="h-full w-full mx-0 xl:px-80 lg:px-48 md:px-24 sm:px-16 sm:py-16 py-2 bg-slate-950 pb-24 relative overflow-hidden z-20"
    >
      {/* Create Record Button START */}
      {viewMode === UserMode[0] && (
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
      )}
      {/* Create Record Button END */}

      <div className="w-full mx-auto pb-8">
        <div className="flex flex-col w-full bg-white/10 rounded-xl p-4 text-white space-y-1">
          {/* Bar 1 */}
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Maintenance</span>
              <span>{serviceRecordStats[0]}</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1">
              <div
                className={`${serviceStatClasses["Maintenance"] || ""} ${
                  glowClasses["Maintenance"] || ""
                } h-1 rounded-full`}
                style={{
                  width: `${
                    (serviceRecordStats[0] / Math.max(...serviceRecordStats)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Bar 2 */}
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Replacement</span>
              <span>{serviceRecordStats[1]}</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1">
              <div
                className={`${serviceStatClasses["Replacement"] || ""} ${
                  glowClasses["Replacement"] || ""
                } h-1 rounded-full`}
                style={{
                  width: `${
                    (serviceRecordStats[1] / Math.max(...serviceRecordStats)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Bar 3 */}
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Inspection</span>
              <span>{serviceRecordStats[2]}</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1">
              <div
                className={`${serviceStatClasses["Inspection"] || ""} ${
                  glowClasses["Inspection"] || ""
                } h-1 rounded-full`}
                style={{
                  width: `${
                    (serviceRecordStats[2] / Math.max(...serviceRecordStats)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Bar 4 */}
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Adjustment</span>
              <span>{serviceRecordStats[3]}</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1">
              <div
                className={`${serviceStatClasses["Adjustment"] || ""} ${
                  glowClasses["Adjustment"] || ""
                } h-1 rounded-full`}
                style={{
                  width: `${
                    (serviceRecordStats[3] / Math.max(...serviceRecordStats)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Bar 5 */}
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Tune</span>
              <span>{serviceRecordStats[4]}</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1">
              <div
                className={`${serviceStatClasses["Tune"] || ""} ${
                  glowClasses["Tune"] || ""
                } h-1 rounded-full`}
                style={{
                  width: `${
                    (serviceRecordStats[4] / Math.max(...serviceRecordStats)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <div className="flex px-2">
          <button
            type="button"
            className="w-[40px] rounded-2xl px-1 py-1 bg-white/10 text-center ml-auto mb-1 mr-1"
            onClick={() => setIsSortOpen(!isSortOpen)}
          >
            <Svg type="sort-1" size="2xl" color="white" />
          </button>
          <button
            type="button"
            className="w-[130px] rounded-2xl px-4 py-1 bg-white/10 text-center mb-1 text-white"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            {selectedServiceTypes.length > 0
              ? `${selectedServiceTypes.length} selected`
              : "Filter"}
          </button>
        </div>

        {/* Sort Modal */}
        <div className="relative">
          {isSortOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40">
              {/* Modal container */}
              <div className="bg-white w-full h-full md:w-10/12 md:h-auto md:mt-10 rounded-none md:rounded-2xl shadow-lg overflow-y-auto p-4">
                {/* Top bar with Close & Clear */}
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => setSelectedSortType("")}
                    className="text-2xl text-red-600 hover:underline"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setIsSortOpen(false)}
                    className="flex bg-green-200 px-2 rounded rounded-full"
                  >
                    <Svg type={"check"} color="green-500" size="md"></Svg>{" "}
                    <span className="text-green-500 text-2xl font-semibold pl-1">
                      Done
                    </span>
                  </button>
                </div>

                {/* Options */}
                {sortedOptions.map((group) => (
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
                            type="radio"
                            name={group.label} // ensures only one option in this group
                            value={opt.value}
                            checked={selectedSortType.includes(opt.value)}
                            onChange={(e) => {
                              const value = e.target.value;
                              setSelectedSortType(value); // overwrite with just one
                            }}
                            className="
                            appearance-none w-5 h-5 
                            border-2 border-gray-400 
                            checked:bg-red-500 checked:border-red-500 
                            rounded-full
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

        {/* Filter Modal */}
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
                    <Svg type={"check"} color="green-500" size="md"></Svg>{" "}
                    <span className="text-green-500 text-2xl font-semibold pl-1">
                      Done
                    </span>
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
      <ul className="w-full mx-auto px-2">
        {!filteredRecords.length && (
          <h2 className="mx-4 text-2xl funnel-display-font font-semibold text-center">
            Oh no! There are no service records for this vehicle yet!
          </h2>
        )}
        {filteredRecords.map((record, recordIndex) => {
          return (
            <li key={recordIndex} className="mb-1">
              <div
                className={`w-full rounded-xl shadow-lg bg-black/60 backdrop-blur-md funnel-display-font leading-none ${
                  serviceTypeClasses[record.ServiceType] || ""
                }`}
              >
                <div
                  className="w-full cursor-pointer"
                  onClick={() => toggleInfo(recordIndex.toString())}
                >
                  {/* Record content */}
                  <div className="flex flex-col py-3 px-4 sm:px-8">
                    {/* Line 1: Service Option */}
                    <div className="font-semibold capitalize text-xl text-white tracking-wide mb-1">
                      {record.ServiceOption}
                    </div>

                    {/* Line 2: Month + Year (left) and Service Type (right) */}
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col text-left text-white/80">
                        {(() => {
                          const date = new Date(record.ServicedDate);
                          const months = [
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Jul",
                            "Aug",
                            "Sep",
                            "Oct",
                            "Nov",
                            "Dec",
                          ];
                          const month = months[date.getMonth()];
                          const year = date.getFullYear();

                          return (
                            <>
                              <div className="text-sm uppercase tracking-wider text-white/25">
                                {month}{" "}
                                <span className="text-white/50">{year}</span>
                              </div>
                              <div className="text-sm capitalize tracking-wider text-white/25">
                                {record.Odometer}
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      <div
                        className={`text-sm font-thin capitalize px-3 py-1 rounded-full ${
                          serviceTypeClasses[record.ServiceType] ||
                          "text-gray-400 bg-gray-800/20"
                        } ${glowClasses[record.ServiceType] || ""}`}
                      >
                        {record.ServiceType}
                      </div>
                    </div>
                  </div>

                  {/* Expand Button */}
                  <div className="flex justify-center">
                    <Button
                      className="mx-auto flex p-0 m-[-25px] translate-y-[-13px]"
                      type="button"
                      size="small"
                      onClick={toggleInfo}
                      param={recordIndex.toString()}
                    >
                      <Svg type="angle-small-down2" size="md" color="white" />
                    </Button>
                  </div>

                  {/* Expanded section */}
                  {expandedItemId === recordIndex.toString() && (
                    <div className="bg-black/30 text-white/80 text-left py-2 px-4 sm:px-8 rounded-b-2xl border-t border-gray-700">
                      <div className="text-sm text-white/90 font-thin">
                        {record.Comment}
                      </div>
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
                              className="text-center text-cyan-400 hover:text-cyan-300 text-lg roboto-flex-font flex items-center gap-1"
                            >
                              <Svg
                                type="file-download1"
                                size="2xl"
                                color="sky-300"
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
          );
        })}
      </ul>

      <CreateRecord
        isOpen={isModalOpen}
        onClose={closeModal}
        onInsert={updateRecords}
        logServiceOptions={logServiceOptions}
      ></CreateRecord>
    </Section>
  );
}
