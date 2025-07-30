import { GroupedOption, TaskOption } from "./global";

export const maintenanceOptions: readonly TaskOption[] = [
  { value: "oil change", label: "oil change" },
  { value: "air filter replacement", label: "air filter replacement" },
  { value: "chain lubrication", label: "chain lubrication" },
  { value: "coolant replacement", label: "coolant replacement" },
  { value: "tyre pressure check", label: "tyre pressure check" },
  { value: "battery check & charging", label: "battery check & charging" },
  { value: "clutch adjustment", label: "clutch adjustment" },
];

export const inspectionOptions: readonly TaskOption[] = [
  { value: "brake inspection", label: "brake inspection" },
  {
    value: "tyre tread depth inspection",
    label: "tyre tread depth inspection",
  },
  {
    value: "lights and indicators inspection",
    label: "lights and indicators inspection",
  },
  { value: "suspension inspection", label: "suspension inspection" },
  { value: "steering inspection", label: "steering inspection" },
  { value: "exhaust system inspection", label: "exhaust system inspection" },
  { value: "fluid leak inspection", label: "fluid leak inspection" },
  {
    value: "cables and controls inspection",
    label: "cables and controls inspection",
  },
];

export const modificationOptions: readonly TaskOption[] = [
  { value: "exhaust upgrade", label: "exhaust upgrade" },
  { value: "handlebar replacement", label: "handlebar replacement" },
  { value: "LED lighting installation", label: "LED lighting installation" },
  { value: "custom paint job", label: "custom paint job" },
  { value: "seat replacement", label: "seat replacement" },
  {
    value: "performance air filter installation",
    label: "performance air filter installation",
  },
  { value: "suspension tuning", label: "suspension tuning" },
  { value: "engine tuning/remapping", label: "engine tuning/remapping" },
];

export const diagnosticOptions: readonly TaskOption[] = [
  { value: "ECU scan", label: "ECU scan" },
  { value: "engine noise analysis", label: "engine noise analysis" },
  { value: "fuel system diagnostic", label: "fuel system diagnostic" },
  {
    value: "electrical system troubleshooting diagnostic",
    label: "electrical system troubleshooting diagnostic",
  },
  {
    value: "sensor calibration diagnostic",
    label: "sensor calibration diagnostic",
  },
  { value: "ignition system diagnostic", label: "ignition system diagnostic" },
  { value: "compression diagnostic", label: "compression diagnostic" },
  { value: "charging system diagnostic", label: "charging system diagnostic" },
];


export const groupedOptions: readonly GroupedOption[] = [
  {
    label: "maintenance",
    options: maintenanceOptions,
  },
  {
    label: "inspection",
    options: inspectionOptions,
  },
  {
    label: "modification",
    options: modificationOptions,
  },
  {
    label: "diagnostic",
    options: diagnosticOptions,
  },
];



export const petrolOptions: readonly TaskOption[] = [
  { value: "91 Octane", label: "91 Octane" },
  { value: "95 Octane", label: "95 Octane" },
  { value: "98 Octane", label: "98 Octane" },
  { value: "100 Octane", label: "100 Octane" },
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
    label: "Diesel",
    options: dieselOptions,
  },
  {
    label: "Electric",
    options: electricOptions,
  },
];
