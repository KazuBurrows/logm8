import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Svg } from "../../../shared/components/Svg";
import { groupedOptions } from "../../../shared/types/serviceOptions";
import { sortedOptions } from "../../../shared/types/sortOptions";

// Same palette as ServiceRecordStatsBars; groups cycle through it.
const groupClasses = [
  { fill: "bg-[#4a5fc9] text-white", track: "bg-[#4a5fc9]/25" },
  { fill: "bg-[#e0522f] text-white", track: "bg-[#e0522f]/25" },
  { fill: "bg-[#2fa866] text-white", track: "bg-[#2fa866]/25" },
  { fill: "bg-[#f2c230] text-slate-900", track: "bg-[#f2c230]/25" },
  { fill: "bg-[#8b5cf6] text-white", track: "bg-[#8b5cf6]/25" },
];

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
    <div className="relative">
      <div className="flex px-2">
        <button
          type="button"
          className="w-[40px] rounded-full px-1 py-1 bg-white/10 text-center ml-auto mb-1 mr-1"
          onClick={() => setIsOpen(true)}
        >
          <Svg type="sort-1" size="2xl" color="white" />
        </button>
      </div>

      {/* Sort & Filter Modal — portalled to <body> because the parent bar's
          backdrop-blur makes it the containing block for fixed children. */}
      {isOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Sort and filter"
            className="fixed inset-0 z-[90] bg-slate-900 text-white overflow-y-auto"
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
                  className="rounded-3xl px-5 py-3 bg-[#e0522f]/25 text-xl font-medium leading-none"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 rounded-3xl px-5 py-3 bg-[#2fa866] text-white text-xl font-medium leading-none"
                >
                  <Svg type="check" color="white" size="md" />
                  Done
                </button>
              </div>

              {groups.map((group, groupIndex) => {
                const colors = groupClasses[groupIndex % groupClasses.length];

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
                          className={`rounded-3xl p-4 flex items-center justify-between cursor-pointer transition-colors duration-300 ${
                            checked ? colors.fill : colors.track
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
