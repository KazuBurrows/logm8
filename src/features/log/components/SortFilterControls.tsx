import React, { useEffect, useRef, useState } from "react";

import { Svg } from "../../../shared/components/Svg";
import { groupedOptions } from "../../../shared/types/serviceOptions";
import { sortedOptions } from "../../../shared/types/sortOptions";

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex px-2">
        <button
          type="button"
          className="w-[40px] rounded-full px-1 py-1 bg-white/10 text-center ml-auto mb-1 mr-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Svg type="sort-1" size="2xl" color="white" />
        </button>
      </div>

      {/* Sort & Filter Modal */}
      <div className="relative">
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60">
            {/* Modal container */}
            <div className="bg-slate-900 text-white w-full h-full md:w-10/12 md:h-auto md:mt-10 rounded-none md:rounded-3xl shadow-lg overflow-y-auto p-4">
              {/* Top bar with Close & Clear */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => {
                    setSelectedSortType("");
                    setSelectedServiceTypes([]);
                  }}
                  className="text-2xl text-red-400 hover:underline"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex items-center bg-orange-500 px-4 py-1 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                >
                  <Svg type={"check"} color="white" size="md"></Svg>{" "}
                  <span className="text-white text-2xl font-semibold pl-1">
                    Done
                  </span>
                </button>
              </div>

              {/* Sort Options */}
              {sortedOptions.map((group) => (
                <fieldset key={group.label} className="mb-4">
                  <legend className="font-semibold text-4xl text-white/80 mb-1 capitalize">
                    {group.label}
                  </legend>
                  <div className="space-y-2 pl-2">
                    {group.options.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center space-x-2 text-2xl text-white/70"
                      >
                        <input
                          type="radio"
                          name={group.label} // ensures only one option in this group
                          value={opt.value}
                          checked={selectedSortType.includes(opt.value)}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSelectedSortType(value); // overwrite with just one
                          }}
                          className="
                            appearance-none w-5 h-5
                            border-2 border-white/30
                            checked:bg-orange-500 checked:border-orange-500
                            rounded-full
                            transition-colors
                          "
                        />
                        <span className="capitalize">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}

              {/* Filter Options */}
              {groupedOptions.map((group) => (
                <fieldset key={group.label} className="mb-4">
                  <legend className="font-semibold text-4xl text-white/80 mb-1 capitalize">
                    {group.label}
                  </legend>
                  <div className="space-y-2 pl-2">
                    {group.options.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center space-x-2 text-2xl text-white/70"
                      >
                        <input
                          type="checkbox"
                          value={opt.value}
                          checked={selectedServiceTypes.includes(opt.value)}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSelectedServiceTypes((prev) =>
                              e.target.checked
                                ? [...prev, value]
                                : prev.filter((v) => v !== value)
                            );
                          }}
                          className="
                            appearance-none w-5 h-5
                            border-2 border-white/30
                            checked:bg-orange-500 checked:border-orange-500
                            rounded
                            transition-colors
                          "
                        />
                        <span className="capitalize">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
