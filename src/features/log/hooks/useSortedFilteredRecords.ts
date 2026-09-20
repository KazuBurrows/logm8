import { useMemo, useState } from "react";

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

export function useSortedFilteredRecords(serviceRecords: ServiceRecord[]) {
  const [selectedSortType, setSelectedSortType] = useState<string>("");
  const sortedRecords = useMemo(() => {
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

  return {
    filteredRecords,
    selectedSortType,
    setSelectedSortType,
    selectedServiceTypes,
    setSelectedServiceTypes,
  };
}
