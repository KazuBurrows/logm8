import { useMemo, useState } from "react";
import { recordTitle } from "../../serviceRecord/utils/recordDisplay";

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

export const SORT = {
  nameAsc: "Service Name A-Z",
  nameDesc: "Service Name Z-A",
  odometerDesc: "Odometer High-Low",
  odometerAsc: "Odometer Low-High",
  dateDesc: "Serviced Date New-Old",
  dateAsc: "Serviced Date Old-New",
} as const;

export type SortKey = (typeof SORT)[keyof typeof SORT];

/** Newest first, the order the server returns. */
export const DEFAULT_SORT: SortKey = SORT.dateDesc;

export function useSortedFilteredRecords(serviceRecords: ServiceRecord[]) {
  const [selectedSortType, setSelectedSortType] = useState<SortKey>(DEFAULT_SORT);
  const sortedRecords = useMemo(() => {
    let records = [...serviceRecords]; // copy so we don't mutate state

    switch (selectedSortType) {
      case SORT.nameAsc:
        records.sort((a, b) => recordTitle(a).localeCompare(recordTitle(b)));
        break;
      case SORT.nameDesc:
        records.sort((a, b) => recordTitle(b).localeCompare(recordTitle(a)));
        break;
      case SORT.odometerDesc:
        records.sort((a, b) => toKm(b.Odometer) - toKm(a.Odometer));
        break;
      case SORT.odometerAsc:
        records.sort((a, b) => toKm(a.Odometer) - toKm(b.Odometer));
        break;
      case SORT.dateAsc:
        records.sort(
          (a, b) =>
            new Date(a.ServicedDate).getTime() -
            new Date(b.ServicedDate).getTime()
        );
        break;
      default:
        // SORT.dateDesc. The server already returns this order, but records added
        // on this device are prepended whatever their date, so sort anyway.
        records.sort(
          (a, b) =>
            new Date(b.ServicedDate).getTime() -
            new Date(a.ServicedDate).getTime()
        );
        break;
    }

    return records;
  }, [serviceRecords, selectedSortType]);

  // Record titles picked in the sort/filter sheet.
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const filteredRecords = selectedServices.length
    ? sortedRecords.filter((record) => selectedServices.includes(recordTitle(record)))
    : sortedRecords;

  return {
    filteredRecords,
    selectedSortType,
    setSelectedSortType,
    selectedServices,
    setSelectedServices,
  };
}
