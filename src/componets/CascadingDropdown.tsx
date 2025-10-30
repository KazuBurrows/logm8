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
  onChange?: (selection: {
    category: ServiceOption | null;
    subcategory: ServiceOption | null;
    subitem: ServiceOption | null;
    serviceType: string | null;
  }) => void;
}

export default function CascadingDropdown({
  logServiceOptions,
  onChange,
}: CascadingDropdownProps) {
  const [serviceOptions] = useState<ServiceOption[]>(logServiceOptions);

  const [selectedServiceOption, setSelectedServiceOption] = useState({
    category: null as ServiceOption | null,
    subcategory: null as ServiceOption | null,
    subitem: null as ServiceOption | null,
    serviceType: null as string | null,
  });

  // Helper for updates
  const updateSelection = (updates: Partial<typeof selectedServiceOption>) => {
    const newSelection = { ...selectedServiceOption, ...updates };
    setSelectedServiceOption(newSelection);
    onChange?.(newSelection); // call parent if provided
  };

  const { category, subcategory, subitem, serviceType } = selectedServiceOption;
  const activeNode = subitem ?? subcategory ?? category;

  return (
    <div className="flex flex-col gap-3 max-w-md mx-auto">
      {/* LEVEL 1 */}
      <select
        className="p-2 border rounded-md"
        value={category?.Id ?? ""}
        onChange={(e) => {
          const selected =
            serviceOptions.find((x) => x.Id === Number(e.target.value)) || null;
          updateSelection({
            category: selected,
            subcategory: null,
            subitem: null,
            serviceType: null,
          });
        }}
      >
        <option value="">Select Category</option>
        {serviceOptions.map((opt) => (
          <option key={opt.Id} value={opt.Id}>
            {opt.Name}
          </option>
        ))}
      </select>

      {/* LEVEL 2 */}
      {category?.Children?.length ? (
        <select
          className="p-2 border rounded-md"
          value={subcategory?.Id ?? ""}
          onChange={(e) => {
            const selected =
              category.Children.find((x) => x.Id === Number(e.target.value)) ||
              null;
            updateSelection({
              subcategory: selected,
              subitem: null,
              serviceType: null,
            });
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
            const selected =
              subcategory.Children.find(
                (x) => x.Id === Number(e.target.value)
              ) || null;
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

      {/* SERVICE TYPE RADIO BUTTONS (single selection) */}
        {activeNode?.ServiceTypes?.length ? (
  <div>
    <label className="font-semibold block mb-3 text-lg">
      Select Service Type
    </label>
    {activeNode.ServiceTypes.map((type) => (
      <label key={type} className="flex items-center space-x-2 mb-1">
        <input
          type="radio"
          name="serviceType" // ensures only one can be selected
          value={type}
          checked={serviceType === type} // ✅ simple string comparison
          onChange={(e) => {
            if (e.target.checked) {
              updateSelection({ serviceType: e.target.value }); // ✅ just a string now
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
