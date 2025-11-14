import React, { useState } from "react";

interface ServiceOption {
  Id: number;
  Name: string;
  Description?: string;
  Children?: ServiceOption[];
  ServiceTypes?: string[];
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

type customServiceOption = {
  topLevel: string;
  category: string;
  subcategory: string | null;
  subitem: string;
  serviceType: string[];
};

export default function CascadingDropdown({
  logServiceOptions,
  logOwnershipOptions,
  onChange,
}: CascadingDropdownProps) {
  const [topLevel, setTopLevel] = useState<"service" | "ownership" | null>(
    null
  );
  const [selectedServiceOption, setSelectedServiceOption] = useState({
    category: null as ServiceOption | null,
    subcategory: null as ServiceOption | null,
    subitem: null as ServiceOption | null,
    serviceType: null as string | null,
  });

  const { category, subcategory, subitem, serviceType } = selectedServiceOption;
  const activeNode = subitem ?? subcategory ?? category;

  const updateSelection = (updates: Partial<typeof selectedServiceOption>) => {
    const newSelection = { ...selectedServiceOption, ...updates };
    setSelectedServiceOption(newSelection);
    onChange?.({ ...newSelection, topLevel });
  };

  // Recursive function to get leaf nodes as customServiceOption
  function getLeafCustomOptions(
    topLevel: string,
    node: ServiceOption,
    categoryName: string | null = null,
    subcategoryName: string | null = null
  ): customServiceOption[] {
    if (!node.Children || node.Children.length === 0) {
      return [
        {
          topLevel,
          category: categoryName ?? node.Name,
          subcategory: subcategoryName,
          subitem: node.Name,
          serviceType: node.ServiceTypes ?? [],
        },
      ];
    }

    let currentCategory = categoryName ?? node.Name;
    let currentSubcategory =
      subcategoryName ?? (categoryName ? node.Name : null);

    return node.Children.flatMap((child) =>
      getLeafCustomOptions(topLevel, child, currentCategory, currentSubcategory)
    );
  }

  function soundex(str: string): string {
  if (!str) return "";

  const s = str.toUpperCase().replace(/[^A-Z]/g, "");
  if (!s) return "";

  const first = s[0];
  const mappings: Record<string, string> = {
    B: "1", F: "1", P: "1", V: "1",
    C: "2", G: "2", J: "2", K: "2", Q: "2", S: "2", X: "2", Z: "2",
    D: "3", T: "3",
    L: "4",
    M: "5", N: "5",
    R: "6",
  };

  let result = first;
  let prev = mappings[first] ?? "";

  for (let i = 1; i < s.length; i++) {
    const code = mappings[s[i]] ?? "";
    if (code !== prev && code !== "") {
      result += code;
    }
    prev = code;
  }

  return (result + "000").slice(0, 4);
}



  // Generate all leaf options
  const allOptions = [
    ...logServiceOptions.flatMap((node) =>
      getLeafCustomOptions("service", node)
    ),
    ...logOwnershipOptions.flatMap((node) =>
      getLeafCustomOptions("ownership", node)
    ),
  ];
  const [expanded, setExpanded] = useState<"search" | "dropdown" | null>("dropdown");

  // state
const [searchText, setSearchText] = useState("");
const search = searchText.trim().toLowerCase();
const searchSx = soundex(searchText.trim());

// filtering logic
const filteredOptions = allOptions.filter((x) => {
  if (!search) return true;

  const fields = [
    x.category,
    x.subcategory ?? "",
    x.subitem
  ];

  // normal lower-case substring match
  const simpleMatch = fields.some((f) =>
    f.toLowerCase().includes(search)
  );
  if (simpleMatch) return true;

  // soundex fuzzy match
  const soundexMatch = fields.some((f) =>
    soundex(f) === searchSx
  );
  return soundexMatch;
});

  return (
    <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
      {/* SEARCHABLE LEAF NODE LIST */}
<input
  placeholder="Search..."
  className="w-full px-2 py-1 border border-gray-300 rounded outline-none"
  onClick={() => setExpanded("search")}
  value={searchText}
  onChange={(e) => setSearchText(e.target.value)}   // <— ACTIVE FILTERING
/>

<div
  className={
    `mt-2 border-t pt-2 max-h-60 overflow-y-auto ` +
    (expanded === "dropdown" ? "hidden" : "")
  }
>
  {filteredOptions.map((x) => (
    <div
      key={`${x.category}-${x.subitem}`}
      className="cursor-pointer hover:bg-gray-100 px-2 py-1"
      onClick={() => {
        // Update topLevel
        setTopLevel(x.topLevel as "service" | "ownership");

        // Determine options source
        const options =
          x.topLevel === "service"
            ? logServiceOptions
            : logOwnershipOptions;

        // Resolve depths
        const categoryObj =
          options.find((opt) => opt.Name === x.category) || null;

        const subcategoryObj =
          categoryObj?.Children?.find(
            (opt) => opt.Name === x.subcategory
          ) || null;

        const subitemObj =
          subcategoryObj?.Children?.find(
            (opt) => opt.Name === x.subitem
          ) ||
          (!subcategoryObj &&
            categoryObj?.Children?.find(
              (opt) => opt.Name === x.subitem
            )) ||
          null;

        // Build new selection
        const newSelection = {
          category: categoryObj,
          subcategory: subcategoryObj ?? subitemObj, // <-- fallback if subcategoryObj is null
          subitem: subitemObj,
          serviceType: x.serviceType[0] ?? null,
        };

        setSelectedServiceOption(newSelection);

        onChange?.({
          ...newSelection,
          topLevel: x.topLevel as "service" | "ownership",
        });

        setExpanded("dropdown");
      }}
    >
      {x.subitem}
    </div>
  ))}
</div>



      {/* TOP LEVEL SELECTION */}
      <select
        className="p-2 border rounded-md"
        value={topLevel ?? ""}
        onChange={(e) => {
          const selectedTop = e.target.value as "service" | "ownership";
          setTopLevel(selectedTop);
          updateSelection({
            category: null,
            subcategory: null,
            subitem: null,
            serviceType: null,
          });
        }}
        onClick={() => setExpanded("dropdown")}
      >
        <option value="">Select Type</option>
        <option value="service">Service</option>
        <option value="ownership">Ownership</option>
      </select>

      {/* CATEGORY */}
      {topLevel && (
        <select
          className="p-2 border rounded-md"
          value={category?.Id ?? ""}
          onChange={(e) => {
            const options =
              topLevel === "service" ? logServiceOptions : logOwnershipOptions;
            const selected =
              options.find((x) => x.Id === Number(e.target.value)) || null;
            updateSelection({
              category: selected,
              subcategory: null,
              subitem: null,
              serviceType: null,
            });
          }}
        >
          <option value="">Select Category</option>
          {(topLevel === "service"
            ? logServiceOptions
            : logOwnershipOptions
          ).map((opt) => (
            <option key={opt.Id} value={opt.Id}>
              {opt.Name}
            </option>
          ))}
        </select>
      )}

      {/* SUBCATEGORY */}
      {category?.Children?.length ? (
        <select
          className="p-2 border rounded-md"
          value={subcategory?.Id ?? ""}
          onChange={(e) => {
            const selected =
              category.Children?.find((x) => x.Id === Number(e.target.value)) ||
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

      {/* SUBITEM */}
      {subcategory?.Children?.length ? (
        <select
          className="p-2 border rounded-md"
          value={subitem?.Id ?? ""}
          onChange={(e) => {
            const selected =
              subcategory.Children?.find(
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

      {/* SERVICE TYPE RADIO BUTTONS */}
      {activeNode?.ServiceTypes?.length ? (
        <div>
          <label className="font-semibold block mb-3 text-lg">
            Select Service Type
          </label>
          {activeNode.ServiceTypes.map((type) => (
            <label key={type} className="flex items-center space-x-2 mb-1">
              <input
                type="radio"
                name="serviceType"
                value={type}
                checked={serviceType === type}
                onChange={(e) => {
                  if (e.target.checked)
                    updateSelection({ serviceType: e.target.value });
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
