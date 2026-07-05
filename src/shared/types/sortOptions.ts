import { SortOption, TaskOption } from "./global";


export const sortOptions: readonly TaskOption[] = [
  { value: "Service Name A-Z", label: "Service Name A-Z" },
  { value: "Service Name Z-A", label: "Service Name Z-A" },
  { value: "Odometer High-Low", label: "Odometer High-Low" },
  { value: "Odometer Low-High", label: "Odometer Low-High" },
  { value: "Serviced Date New-Old", label: "Serviced Date New-Old" },
  { value: "Serviced Date Old-New", label: "Serviced Date Old-New" },
];

export const sortedOptions: readonly SortOption[] = [
  {
    label: "sort by",
    options: sortOptions,
  },
];