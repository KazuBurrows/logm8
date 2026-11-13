import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Svg } from "../../../shared/components/Svg";
import { IconButton } from "../../../shared/components/IconButton";
import { groupedOptions } from "../../../shared/types/serviceOptions";
import { sortedOptions } from "../../../shared/types/sortOptions";

// Neutral on purpose: these groups are categories and sort orders, not
// record types, so they don't borrow the type colours.
const optionClasses = {
  checked: "bg-accent text-accent-fg",
  unchecked: "bg-surface border border-line text-fg",
};

export interface SortFilterControlsProps {
  selectedSortType: string;
  setSelectedSortType: (value: string) => void;
  selectedServiceTypes: string[];
  setSelectedServiceTypes: React.Dispatch<React.SetStateAction<string[]>>;
}

export function SortFilterControls({
  selectedSortType,
  setSelectedSortType,
  selectedServiceTypes,
  setSelectedServiceTypes,
}: SortFilterControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape and stop the page behind from scrolling while open.
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const groups = [
    ...sortedOptions.map((group) => ({ ...group, kind: "sort" as const })),
    ...groupedOptions.map((group) => ({ ...group, kind: "filter" as const })),
  ];

  return (
    <div className="relative shrink-0">
      <IconButton label="Sort and filter" onClick={() => setIsOpen(true)}>
        <Svg type="sort-1" size="md" color="current" />
      </IconButton>

      {/* Sort & Filter Modal — portalled to <body> because the parent bar's
          backdrop-blur makes it the containing block for fixed children. */}
      {isOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Sort and filter"
            className="fixed inset-0 z-[90] bg-canvas text-fg overflow-y-auto"
          >
            <div className="min-h-full w-full flex flex-col gap-6 p-4">
              {/* Top bar with Reset & Done */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSortType("");
                    setSelectedServiceTypes([]);
                  }}
                  className="rounded-full px-5 py-3 bg-raised border border-line text-xl font-medium leading-none"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 rounded-full px-5 py-3 bg-accent text-accent-fg text-xl font-medium leading-none"
                >
                  <Svg type="check" color="current" size="md" />
                  Done
                </button>
              </div>

              {groups.map((group) => {
                return (
                  <fieldset key={group.label} className="flex flex-col gap-3">
                    <legend className="mb-3 text-6xl font-light leading-none tracking-tight capitalize">
                      {group.label}
                    </legend>

                    {group.options.map((opt) => {
                      const checked =
                        group.kind === "sort"
                          ? selectedSortType === opt.value
                          : selectedServiceTypes.includes(opt.value);

                      return (
                        <label
                          key={opt.value}
                          className={`rounded-card p-4 flex items-center justify-between cursor-pointer transition-colors duration-300 ${
                            checked ? optionClasses.checked : optionClasses.unchecked
                          }`}
                        >
                          <span className="text-xl font-medium leading-none capitalize">
                            {opt.label}
                          </span>
                          <input
                            type={group.kind === "sort" ? "radio" : "checkbox"}
                            name={group.label}
                            value={opt.value}
                            checked={checked}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (group.kind === "sort") {
                                setSelectedSortType(value);
                              } else {
                                setSelectedServiceTypes((prev) =>
                                  e.target.checked
                                    ? [...prev, value]
                                    : prev.filter((v) => v !== value)
                                );
                              }
                            }}
                            className={`appearance-none w-6 h-6 border-2 border-current opacity-60 checked:opacity-100 checked:bg-current transition-opacity ${
                              group.kind === "sort" ? "rounded-full" : "rounded-md"
                            }`}
                          />
                        </label>
                      );
                    })}
                  </fieldset>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
