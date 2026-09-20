import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Svg } from "../../../shared/components/Svg";
import { BottomSheet, sheetRowClass } from "../../../shared/components/BottomSheet";

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

interface SelectOption {
  value: number | string;
  label: string;
}

interface SelectProps {
  value: number | string;
  onChange: (value: string) => void;
  placeholder: string;
  options: SelectOption[];
}

/**
 * A select that opens a bottom sheet of large tap targets instead of the
 * native picker, which is small and inconsistent on phones. Choosing the
 * placeholder row clears the selection.
 */
function NeonSelect({ value, onChange, placeholder, options }: SelectProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  const selected = options.find((o) => String(o.value) === String(value));

  const choose = (next: string) => {
    onChange(next);
    close();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full min-h-12 flex items-center justify-between gap-2 rounded-2xl bg-white/10 px-4 py-3 text-left text-base font-light"
      >
        <span className={selected ? "text-white" : "text-white/50"}>
          {selected?.label ?? placeholder}
        </span>
        <Svg type="angle-small-down1" size="md" color="white" />
      </button>

      <BottomSheet isOpen={open} onClose={close} title={placeholder}>
        <button
          type="button"
          onClick={() => choose("")}
          data-selected={!selected}
          className={sheetRowClass(!selected)}
        >
          <span className={selected ? "text-white/40" : ""}>{placeholder}</span>
          {!selected && <Svg type="check" size="md" color="white" />}
        </button>
        {options.map((option) => {
          const active = String(option.value) === String(value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => choose(String(option.value))}
              data-selected={active}
              className={sheetRowClass(active)}
            >
              <span>{option.label}</span>
              {active && <Svg type="check" size="md" color="white" />}
            </button>
          );
        })}
      </BottomSheet>
    </>
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
      <p className="block text-sm text-white/50 leading-none mb-1">Service Type</p>
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`px-4 py-2 rounded-full text-base font-light transition-colors ${
              selected === type
                ? "bg-[#4a5fc9] text-white"
                : "bg-white/10 text-white/70"
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
    <div className="inline-flex self-start rounded-full bg-white/10 p-1">
      {(["service", "ownership"] as OptionMode[]).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`px-4 py-1 rounded-full text-sm capitalize transition-colors ${
            mode === m ? "bg-[#4a5fc9] text-white" : "text-white/60"
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
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Default to the first available service type whenever the list changes
  // (e.g. a new category/subcategory/option is selected) unless the current
  // selection is still valid for the new list.
  useEffect(() => {
    if (!serviceTypesToShow || serviceTypesToShow.length === 0) return;
    setSelectedType((prev) =>
      prev && serviceTypesToShow.includes(prev) ? prev : serviceTypesToShow[0]
    );
  }, [serviceTypesToShow]);

  // ── Notify parent on selection change ────────────────────────────────────

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    onChangeRef.current?.({
      category: selectedCategory,
      subcategory: selectedSubcategory,
      option: selectedOption,
      type: selectedType,
    });
  }, [selectedCategory, selectedSubcategory, selectedOption, selectedType]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleModeChange = (newMode: OptionMode) => {
    setMode(newMode);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedOption(null);
    setSelectedType(null);
    setSearchText("");
  };

  const handleCategoryChange = (value: string) => {
    const found = optionDirectory.find((x) => x.Id === Number(value)) ?? null;
    setSelectedCategory(found);
    setSelectedSubcategory(null);
    setSelectedOption(null);
    setSelectedType(null);
  };

  const handleSubcategoryChange = (value: string) => {
    const found = selectedCategory?.Children?.find((x) => x.Id === Number(value)) ?? null;
    setSelectedSubcategory(found);
    setSelectedOption(null);
    setSelectedType(null);
  };

  const handleOptionChange = (value: string) => {
    const found = selectedSubcategory?.Children?.find((x) => x.Id === Number(value)) ?? null;
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
    searchInputRef.current?.blur(); // dismiss the on-screen keyboard

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
            ref={searchInputRef}
            type="text"
            placeholder="Search all options..."
            autoComplete="off"
            enterKeyHint="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => {
              setSearchFocused(true);
              // Once the keyboard is up, bring the field (and its results) into view.
              setTimeout(
                () =>
                  searchInputRef.current?.scrollIntoView({
                    block: "center",
                    behavior: "smooth",
                  }),
                300
              );
            }}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            onKeyDown={(e) => {
              // The keyboard's Enter/Go key would otherwise submit the whole form.
              if (e.key === "Enter") {
                e.preventDefault();
                if (searchResults[0]) handleSearchSelect(searchResults[0]);
              }
            }}
            className="w-full rounded-2xl bg-white/10 px-3 py-3 pr-9 text-base font-light text-white placeholder-white/30 outline-none"
          />
          {searchText && (
            <button
              type="button"
              onClick={() => { setSearchText(""); setSearchFocused(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {showSearchResults && (
          <div className="absolute z-20 top-full mt-1 w-full max-h-64 overflow-y-auto overscroll-contain bg-zinc-800 border border-white/10 rounded-2xl shadow-lg">
            {searchResults.map((result) => (
              <button
                key={result.Id}
                type="button"
                onMouseDown={() => handleSearchSelect(result)}
                className="w-full text-left px-4 py-3 text-base font-light text-white hover:bg-white/10 border-b border-white/10 last:border-0"
              >
                {result.Name}
              </button>
            ))}
          </div>
        )}

        {searchText && searchFocused && searchResults.length === 0 && (
          <div className="absolute z-20 top-full mt-1 w-full bg-zinc-800 border border-white/10 rounded-2xl px-4 py-3 text-base font-light text-white/50">
            No results found
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-white/40">or browse</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Cascading selects */}
      <div className="flex flex-col gap-2">
        <NeonSelect
          value={selectedCategory?.Id ?? ""}
          onChange={handleCategoryChange}
          placeholder="Select Category"
          options={optionDirectory.map((cat) => ({ value: cat.Id, label: cat.Name }))}
        />

        {showSubcategory && (
          <NeonSelect
            value={selectedSubcategory?.Id ?? ""}
            onChange={handleSubcategoryChange}
            placeholder="Select Subcategory"
            options={selectedCategory!.Children!.map((sub) => ({ value: sub.Id, label: sub.Name }))}
          />
        )}

        {showOption && (
          <NeonSelect
            value={selectedOption?.Id ?? ""}
            onChange={handleOptionChange}
            placeholder="Select Option"
            options={selectedSubcategory!.Children!.map((opt) => ({ value: opt.Id, label: opt.Name }))}
          />
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
        <div className="mt-1 px-4 py-3 rounded-2xl bg-white/10 text-sm text-white/50">
          <span className="text-white">{selectedCategory?.Name}</span>
          {selectedSubcategory && <><span className="mx-1 text-white/40">›</span><span className="text-white">{selectedSubcategory.Name}</span></>}
          {selectedOption && <><span className="mx-1 text-white/40">›</span><span className="text-white">{selectedOption.Name}</span></>}
          {selectedType && <><span className="mx-1 text-white/40">·</span><span className="text-blue-400">{selectedType}</span></>}
        </div>
      )}
    </div>
  );
}
