import React, { useEffect, useRef, useState } from "react";

import { Section } from "../../../shared/components/Section";
import { Button } from "../../../shared/components/Button";
import { RecordModal } from "../../serviceRecord/components/RecordModal";
import { Svg } from "../../../shared/components/Svg";
import { groupedOptions } from "../../../shared/types/serviceOptions";
import { sortedOptions } from "../../../shared/types/sortOptions";
import { UserMode } from "../pages/Log";
import { TaskOption } from "../../../shared/types/global";
import { RecordItem } from "../../serviceRecord/components/RecordItem";


export interface LogHistoryProps {
  logServiceRecords: ServiceRecord[];
  logServiceOptions: ServiceOption[];
  logOwnershipOptions: ServiceOption[];
  viewMode: string;
}

function populateRecordFilter(records: ServiceRecord[]) {
  function groupBy<T, K extends keyof any>(
    array: T[],
    getKey: (item: T) => K
  ): Record<K, T[]> {
    return array.reduce((acc, item) => {
      const key = getKey(item);
      (acc[key] ??= []).push(item);
      return acc;
    }, {} as Record<K, T[]>);
  }

  const groupedByCategory = groupBy(records, (r) => r.ServiceCategory);
  console.log(groupedByCategory);


  Object.entries(groupedByCategory).forEach(([category, serviceRecords]) => {
    const records = Array.from(
      new Map(
        serviceRecords.map((r): [string, TaskOption] => [
          r.ServiceOption,
          { value: r.ServiceOption, label: r.ServiceOption },
        ])
      ).values()
    );

    groupedOptions.push({
      label: category,
      options: records,
    });
  });
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


export default function LogHistory({
  logServiceRecords,
  viewMode,
  logServiceOptions,
  logOwnershipOptions,
}: LogHistoryProps) {


const glowClasses: Record<string, string> = {
  Maintenance: "drop-shadow-[0_0_2px_rgba(59,130,246,0.7)]",
  Replacement: "drop-shadow-[0_0_2px_rgba(248,113,113,0.7)]",
  Inspection: "drop-shadow-[0_0_2px_rgba(34,197,94,0.7)]",
  Adjustment: "drop-shadow-[0_0_2px_rgba(253,224,71,0.7)]",
  Tune: "drop-shadow-[0_0_2px_rgba(139,92,246,0.7)]",
};

const serviceStatClasses: Record<string, string> = {
  Maintenance: "text-white bg-blue-700/60",
  Replacement: "text-white bg-red-700/60",
  Inspection: "text-white bg-green-700/60",
  Adjustment: "text-white bg-yellow-700/60",
  Tune: "text-white bg-purple-700/60",
};



  const [isCreateOpen, setIsCreateOpen] = useState(false);
const [isEditOpen, setIsEditOpen] = useState(false);

  const openCreate = () => setIsCreateOpen(true);
const closeCreate = () => setIsCreateOpen(false);

const openEdit = (record: ServiceRecord) => {
  setEditingRecord(record);
  setIsEditOpen(true);
};
const closeEdit = () => setIsEditOpen(false);

  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [serviceRecordStats, setServiceRecordStats] = useState<
    [number, number, number, number, number]
  >([0, 0, 0, 0, 0]);

  const toggleInfo = (id: string) => {
    setExpandedItemId(expandedItemId === id ? null : id); // Toggle logic
  };

  const [editingRecord, setEditingRecord] = useState<ServiceRecord|null>(null);


  // State to hold the service logs
  const [serviceRecords, setServiceRecords] =
    useState<ServiceRecord[]>(logServiceRecords);

  const updateRecords = (newRecord: ServiceRecord) => {
    setServiceRecords((prevRecords) => [newRecord, ...prevRecords]);
  };

  const replaceRecord = (updatedRecord: ServiceRecord) => {
    setServiceRecords((prevRecords) =>
      prevRecords.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
    );
  };


  const [selectedSortType, setSelectedSortType] = useState<string>("");
  const sortedRecords = React.useMemo(() => {
    let records = [...serviceRecords]; // copy so we don't mutate state

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
    const tempServiceRecordStats: [number, number, number, number, number] = [
      0, 0, 0, 0, 0,
    ];

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
        case "WOF":
        case "Registration":
        case "Certification":
        case "":
        case null:
        case undefined:
          break;
        default:
          console.warn("Unknown service type:", service.ServiceType);
          break;
      }
    });

    setServiceRecordStats(tempServiceRecordStats);
    populateRecordFilter(serviceRecords);
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
          onClick={() => openCreate()}
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
            <RecordItem
              key={recordIndex}
              record={record}
              toggleInfo={toggleInfo}
              expandedItemId={expandedItemId}
              editingRecord={editingRecord}
              setEditingRecord={setEditingRecord}
              openEditModal={() => openEdit(record)}
            />
          );
        })}
      </ul>

      <RecordModal
        mode="create"
        isOpen={isCreateOpen}
        onClose={closeCreate}
        onInsert={updateRecords}
        logServiceOptions={logServiceOptions}
        logOwnershipOptions={logOwnershipOptions}
      />

      <RecordModal
        mode="edit"
        recordToEdit={filteredRecords.find(r => r.id === editingRecord?.id)}
        isOpen={isEditOpen}
        onUpdate={replaceRecord}
        onClose={closeEdit}
        logServiceOptions={logServiceOptions}
        logOwnershipOptions={logOwnershipOptions}
      />
    </Section>
  );
}
