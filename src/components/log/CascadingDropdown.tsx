import React, { useCallback, useEffect, useMemo, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServiceOption {
  Id: number;
  Name: string;
  Description?: string;
  ServiceTypes?: string[];
  Children?: ServiceOption[];
}

interface ServiceSelection {
  category: ServiceOption | null;
  subcategory: ServiceOption | null;
  option: ServiceOption | null;
  type: string | null;
}

type OptionMode = "service" | "ownership";

export interface CascadingDropdownProps {
  logServiceOptions: ServiceOption[];
  logOwnershipOptions: ServiceOption[];
  onChange?: (selection: ServiceSelection) => void;
  initialValue?: ServiceSelection | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Recursively collect all leaf nodes from the option tree for search */
function collectLeaves(nodes: ServiceOption[]): ServiceOption[] {
  return nodes.flatMap((node) => {
    if (!node.Children || node.Children.length === 0) return [node];
    return collectLeaves(node.Children);
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SelectProps {
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder: string;
  children: React.ReactNode;
}

function NeonSelect({ value, onChange, placeholder, children }: SelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded text-sm"
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  );
}

interface ServiceTypeInputProps {
  types: string[];
  selected: string | null;
  onChange: (type: string) => void;
}


function ServiceTypeSelector({ types, selected, onChange }: ServiceTypeInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="block text-sm font-medium mb-1">Service Type</p>
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`px-3 py-1 rounded border text-sm transition-colors ${
              selected === type
                ? "bg-rose-500 text-white border-rose-500"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ModeToggleProps {
  mode: OptionMode;
  onChange: (mode: OptionMode) => void;
}

function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="inline-flex border border-slate-300 rounded-full p-1">
      {(["service", "ownership"] as OptionMode[]).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`px-4 py-1 rounded-full text-sm font-medium capitalize transition-colors ${
            mode === m ? "bg-rose-500 text-white" : "text-gray-600 hover:text-gray-800"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CascadingDropdown({
  logServiceOptions,
  logOwnershipOptions,
  onChange,
  initialValue,
}: CascadingDropdownProps) {
  const [mode, setMode] = useState<OptionMode>("service");
  const [selectedCategory, setSelectedCategory] = useState<ServiceOption | null>(initialValue?.category ?? null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceOption | null>(initialValue?.subcategory ?? null);
  const [selectedOption, setSelectedOption] = useState<ServiceOption | null>(initialValue?.option ?? null);
  const [selectedType, setSelectedType] = useState<string | null>(initialValue?.type ?? null);
  const [searchText, setSearchText] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const optionDirectory = mode === "service" ? logServiceOptions : logOwnershipOptions;

  // ── Derived data ─────────────────────────────────────────────────────────

  const allLeaves = useMemo(() => collectLeaves(optionDirectory), [optionDirectory]);

  const searchResults = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return [];
    return allLeaves.filter((node) => node.Name.toLowerCase().includes(query)).slice(0, 8);
  }, [searchText, allLeaves]);

  // Deepest-level-wins logic for service types
  const serviceTypesToShow = useMemo<string[] | null>(() => {
    if (selectedOption?.ServiceTypes?.length) return selectedOption.ServiceTypes;
    if (selectedSubcategory?.ServiceTypes?.length) return selectedSubcategory.ServiceTypes;
    if (!selectedSubcategory && selectedCategory?.ServiceTypes?.length) return selectedCategory.ServiceTypes;
    return null;
  }, [selectedCategory, selectedSubcategory, selectedOption]);

  // ── Notify parent on selection change ────────────────────────────────────

  const stableOnChange = useCallback(
    (sel: ServiceSelection) => onChange?.(sel),
    [onChange]
  );

  useEffect(() => {
    stableOnChange({
      category: selectedCategory,
      subcategory: selectedSubcategory,
      option: selectedOption,
      type: selectedType,
    });
  }, [selectedCategory, selectedSubcategory, selectedOption, selectedType, stableOnChange]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleModeChange = (newMode: OptionMode) => {
    setMode(newMode);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedOption(null);
    setSelectedType(null);
    setSearchText("");
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = optionDirectory.find((x) => x.Id === Number(e.target.value)) ?? null;
    setSelectedCategory(found);
    setSelectedSubcategory(null);
    setSelectedOption(null);
    setSelectedType(null);
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = selectedCategory?.Children?.find((x) => x.Id === Number(e.target.value)) ?? null;
    setSelectedSubcategory(found);
    setSelectedOption(null);
    setSelectedType(null);
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = selectedSubcategory?.Children?.find((x) => x.Id === Number(e.target.value)) ?? null;
    setSelectedOption(found);
    setSelectedType(null);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
  };

  /** When a search result is clicked, walk the tree to set category/subcategory/option */
  const handleSearchSelect = (leaf: ServiceOption) => {
    setSearchText(leaf.Name);
    setSearchFocused(false);

    // Walk tree to find parent chain
    for (const cat of optionDirectory) {
      if (cat.Id === leaf.Id) { setSelectedCategory(cat); setSelectedSubcategory(null); setSelectedOption(null); return; }
      for (const sub of cat.Children ?? []) {
        if (sub.Id === leaf.Id) { setSelectedCategory(cat); setSelectedSubcategory(sub); setSelectedOption(null); return; }
        for (const opt of sub.Children ?? []) {
          if (opt.Id === leaf.Id) { setSelectedCategory(cat); setSelectedSubcategory(sub); setSelectedOption(opt); return; }
        }
      }
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  const showSubcategory = selectedCategory && (selectedCategory.Children?.length ?? 0) > 0;
  const showOption = selectedSubcategory && (selectedSubcategory.Children?.length ?? 0) > 0;
  const showSearchResults = searchFocused && searchResults.length > 0;

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* Mode toggle */}
      <ModeToggle mode={mode} onChange={handleModeChange} />

      {/* Search */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Search all options..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            className="w-full p-2 border rounded text-sm pr-8"
          />
          {searchText && (
            <button
              type="button"
              onClick={() => { setSearchText(""); setSearchFocused(false); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {showSearchResults && (
          <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded shadow-md overflow-hidden">
            {searchResults.map((result) => (
              <button
                key={result.Id}
                type="button"
                onMouseDown={() => handleSearchSelect(result)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100 last:border-0"
              >
                {result.Name}
              </button>
            ))}
          </div>
        )}

        {searchText && searchFocused && searchResults.length === 0 && (
          <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-gray-400">
            No results found
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or browse</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Cascading selects */}
      <div className="flex flex-col gap-2">
        <NeonSelect
          value={selectedCategory?.Id ?? ""}
          onChange={handleCategoryChange}
          placeholder="Select Category"
        >
          {optionDirectory.map((cat) => (
            <option key={cat.Id} value={cat.Id}>{cat.Name}</option>
          ))}
        </NeonSelect>

        {showSubcategory && (
          <NeonSelect
            value={selectedSubcategory?.Id ?? ""}
            onChange={handleSubcategoryChange}
            placeholder="Select Subcategory"
          >
            {selectedCategory!.Children!.map((sub) => (
              <option key={sub.Id} value={sub.Id}>{sub.Name}</option>
            ))}
          </NeonSelect>
        )}

        {showOption && (
          <NeonSelect
            value={selectedOption?.Id ?? ""}
            onChange={handleOptionChange}
            placeholder="Select Option"
          >
            {selectedSubcategory!.Children!.map((opt) => (
              <option key={opt.Id} value={opt.Id}>{opt.Name}</option>
            ))}
          </NeonSelect>
        )}

        {serviceTypesToShow && (
          <ServiceTypeSelector
            types={serviceTypesToShow}
            selected={selectedType}
            onChange={handleTypeChange}
          />
        )}
      </div>

      {/* Current selection summary */}
      {(selectedCategory || selectedType) && (
        <div className="mt-1 px-3 py-2 rounded bg-gray-100 text-sm text-gray-500">
          <span className="text-gray-700">{selectedCategory?.Name}</span>
          {selectedSubcategory && <><span className="mx-1 text-gray-400">›</span><span className="text-gray-700">{selectedSubcategory.Name}</span></>}
          {selectedOption && <><span className="mx-1 text-gray-400">›</span><span className="text-gray-700">{selectedOption.Name}</span></>}
          {selectedType && <><span className="mx-1 text-gray-400">·</span><span className="text-rose-500">{selectedType}</span></>}
        </div>
      )}
    </div>
  );
}
