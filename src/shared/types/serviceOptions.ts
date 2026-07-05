import { GroupedOption, TaskOption } from "./global";



export const groupedOptions: GroupedOption[] = [
  // {
  //   label: "maintenance",
  //   options: maintenanceOptions,
  // },
  // {
  //   label: "inspection",
  //   options: inspectionOptions,
  // },
  // {
  //   label: "modification",
  //   options: modificationOptions,
  // },
  // {
  //   label: "diagnostic",
  //   options: diagnosticOptions,
  // },
];



export const petrolOptions: readonly TaskOption[] = [
  { value: "91 Octane", label: "91 Octane" },
  { value: "95 Octane", label: "95 Octane" },
  { value: "98 Octane", label: "98 Octane" },
  { value: "100 Octane", label: "100 Octane" },
];

export const ratioOptions: readonly TaskOption[] = [
  { value: "Ratio 100:1", label: "Ratio 100:1" },
  { value: "Ratio 90:1", label: "Ratio 90:1" },
  { value: "Ratio 80:1", label: "Ratio 80:1" },
  { value: "Ratio 75:1", label: "Ratio 75:1" },
  { value: "Ratio 60:1", label: "Ratio 60:1" },
  { value: "Ratio 55:1", label: "Ratio 55:1" },
  { value: "Ratio 50:1", label: "Ratio 50:1" },
  { value: "Ratio 45:1", label: "Ratio 45:1" },
  { value: "Ratio 40:1", label: "Ratio 40:1" },
  { value: "Ratio 35:1", label: "Ratio 35:1" },
  { value: "Ratio 32:1", label: "Ratio 32:1" },
  { value: "Ratio 30:1", label: "Ratio 30:1" },
  { value: "Ratio 25:1", label: "Ratio 25:1" },
  { value: "Ratio 20:1", label: "Ratio 20:1" },
  { value: "Ratio 16:1", label: "Ratio 16:1" },
];


export const dieselOptions: readonly TaskOption[] = [
  { value: "Standard Diesel", label: "Standard Diesel" },
];

export const electricOptions: readonly TaskOption[] = [
  { value: "Battery Electric (BEV)", label: "Battery Electric (BEV)" },
  { value: "Plug-in Hybrid Electric (PHEV)", label: "Plug-in Hybrid Electric (PHEV)" },
  { value: "Hybrid Electric (HEV)", label: "Hybrid Electric (HEV)" },
];

export const groupedFuelOptions: readonly GroupedOption[] = [
  {
    label: "Petrol (Gasoline)",
    options: petrolOptions,
  },
  {
    label: "2 Stoke Ratios",
    options: ratioOptions,
  },
  {
    label: "Diesel",
    options: dieselOptions,
  },
  {
    label: "Electric",
    options: electricOptions,
  },
];
