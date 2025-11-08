import React, { useState } from "react";

interface ServiceOption {
  Id: number;
  Name: string;
  Description: string;
  Children: ServiceOption[];
  ServiceTypes: string[];
}

export interface CascadingDropdownProps {
  logServiceOptions: ServiceOption[];
  logOwnershipOptions: ServiceOption[];
  onChange?: (selection: {
    category: ServiceOption | null;
    subcategory: ServiceOption | null;
    subitem: ServiceOption | null;
    serviceType: string | null;
    topLevel: "service" | "ownership" | null;
  }) => void;
}

export default function CascadingDropdown({
  logServiceOptions,
  logOwnershipOptions,
  onChange,
}: CascadingDropdownProps) {
  const [topLevel, setTopLevel] = useState<"service" | "ownership" | null>(null);
  const [selectedServiceOption, setSelectedServiceOption] = useState({
    category: null as ServiceOption | null,
    subcategory: null as ServiceOption | null,
    subitem: null as ServiceOption | null,
    serviceType: null as string | null,
  });

  const updateSelection = (updates: Partial<typeof selectedServiceOption>) => {
    const newSelection = { ...selectedServiceOption, ...updates };
    setSelectedServiceOption(newSelection);
    onChange?.({ ...newSelection, topLevel });
  };

  const { category, subcategory, subitem, serviceType } = selectedServiceOption;
  const activeNode = subitem ?? subcategory ?? category;

  const options = topLevel === "service" ? logServiceOptions : logOwnershipOptions;

  return (
    <div className="flex flex-col gap-3 max-w-md mx-auto">
      {/* LEVEL 0: Top-level selection */}
      <select
        className="p-2 border rounded-md"
        value={topLevel ?? ""}
        onChange={(e) => {
          const selectedTop = e.target.value as "service" | "ownership";
          setTopLevel(selectedTop);
          updateSelection({ category: null, subcategory: null, subitem: null, serviceType: null });
        }}
      >
        <option value="">Select Type</option>
        <option value="service">Service</option>
        <option value="ownership">Ownership</option>
      </select>

      {/* LEVEL 1 */}
      {topLevel && (
        <select
          className="p-2 border rounded-md"
          value={category?.Id ?? ""}
          onChange={(e) => {
            const selected = options.find((x) => x.Id === Number(e.target.value)) || null;
            updateSelection({ category: selected, subcategory: null, subitem: null, serviceType: null });
          }}
        >
          <option value="">Select Category</option>
          {options.map((opt) => (
            <option key={opt.Id} value={opt.Id}>
              {opt.Name}
            </option>
          ))}
        </select>
      )}

      {/* LEVEL 2 */}
      {category?.Children?.length ? (
        <select
          className="p-2 border rounded-md"
          value={subcategory?.Id ?? ""}
          onChange={(e) => {
            const selected = category.Children.find((x) => x.Id === Number(e.target.value)) || null;
            updateSelection({ subcategory: selected, subitem: null, serviceType: null });
          }}
        >
          <option value="">Select Subcategory</option>
          {category.Children.map((opt) => (
            <option key={opt.Id} value={opt.Id}>
              {opt.Name}
            </option>
          ))}
        </select>
      ) : null}

      {/* LEVEL 3 */}
      {subcategory?.Children?.length ? (
        <select
          className="p-2 border rounded-md"
          value={subitem?.Id ?? ""}
          onChange={(e) => {
            const selected = subcategory.Children.find((x) => x.Id === Number(e.target.value)) || null;
            updateSelection({ subitem: selected, serviceType: null });
          }}
        >
          <option value="">Select Sub-item</option>
          {subcategory.Children.map((opt) => (
            <option key={opt.Id} value={opt.Id}>
              {opt.Name}
            </option>
          ))}
        </select>
      ) : null}

      {/* SERVICE TYPE RADIO BUTTONS */}
      {activeNode?.ServiceTypes?.length ? (
        <div>
          <label className="font-semibold block mb-3 text-lg">Select Service Type</label>
          {activeNode.ServiceTypes.map((type) => (
            <label key={type} className="flex items-center space-x-2 mb-1">
              <input
                type="radio"
                name="serviceType"
                value={type}
                checked={serviceType === type}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateSelection({ serviceType: e.target.value });
                  }
                }}
                className="w-5 h-5 border-2 border-gray-400 rounded-full checked:bg-blue-500 checked:border-blue-500"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
