import React, { useCallback, useState } from "react";

import { Svg } from "../../../shared/components/Svg";
import { IconButton } from "../../../shared/components/IconButton";
import { BottomSheet } from "../../../shared/components/BottomSheet";
import { DEFAULT_SORT, SORT, SortKey } from "../hooks/useSortedFilteredRecords";
import { ServiceFilterGroup } from "../utils/groupRecords";

// What to sort by, then which way. Each pair maps onto one SortKey.
const SORT_FIELDS: { label: string; directions: { key: SortKey; label: string }[] }[] = [
  {
    label: "Date",
    directions: [
      { key: SORT.dateDesc, label: "Newest first" },
      { key: SORT.dateAsc, label: "Oldest first" },
    ],
  },
  {
    label: "Name",
    directions: [
      { key: SORT.nameAsc, label: "A to Z" },
      { key: SORT.nameDesc, label: "Z to A" },
    ],
  },
  {
    label: "Odometer",
    directions: [
      { key: SORT.odometerDesc, label: "Highest first" },
      { key: SORT.odometerAsc, label: "Lowest first" },
    ],
  },
];

const sectionHeading = "text-sm font-semibold text-fg-soft";

// Neutral on purpose: these are sort orders and services, not record types, so
// they don't borrow the type colours.
const segment = (active: boolean) =>
  `flex min-h-11 items-center justify-center rounded-full px-3 text-base transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent ${
    active ? "bg-accent text-accent-fg" : "text-fg-soft"
  }`;

const chip = (active: boolean) =>
  `inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-base transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent ${
    active ? "bg-accent border-accent text-accent-fg" : "bg-raised border-line text-fg"
  }`;

export interface SortFilterControlsProps {
  selectedSortType: SortKey;
  setSelectedSortType: (value: SortKey) => void;
  selectedServices: string[];
  setSelectedServices: React.Dispatch<React.SetStateAction<string[]>>;
  /** Service options to filter by, derived from the current records. */
  filterGroups: ServiceFilterGroup[];
  /** Records the list shows with the current search, chips, sort and filters. */
  resultCount: number;
}

/** The toolbar's sort & filter button and the bottom sheet it opens. */
export function SortFilterControls({
  selectedSortType,
  setSelectedSortType,
  selectedServices,
  setSelectedServices,
  filterGroups,
  resultCount,
}: SortFilterControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);

  const sortField =
    SORT_FIELDS.find((f) => f.directions.some((d) => d.key === selectedSortType)) ?? SORT_FIELDS[0];
  const isSortChanged = selectedSortType !== DEFAULT_SORT;
  const activeCount = selectedServices.length + (isSortChanged ? 1 : 0);

  const toggleService = (value: string, checked: boolean) =>
    setSelectedServices((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value)
    );

  const reset = () => {
    setSelectedSortType(DEFAULT_SORT);
    setSelectedServices([]);
  };

  return (
    <div className="relative shrink-0">
      <IconButton
        label={activeCount ? `Sort and filter, ${activeCount} active` : "Sort and filter"}
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <Svg type="sort-1" size="md" color="current" />
        {activeCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 rounded-full bg-accent text-accent-fg text-xs font-semibold flex items-center justify-center"
          >
            {activeCount}
          </span>
        )}
      </IconButton>

      <BottomSheet
        isOpen={isOpen}
        onClose={close}
        title="Sort & filter"
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reset}
              disabled={!activeCount}
              className="h-12 px-5 rounded-full bg-raised border border-line text-fg text-base disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={close}
              className="flex-1 h-12 rounded-full bg-accent text-accent-fg text-base font-medium"
            >
              {resultCount === 0
                ? "No matching records"
                : `Show ${resultCount} ${resultCount === 1 ? "record" : "records"}`}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-6 px-2 pt-1 pb-2">
          <fieldset className="flex flex-col gap-2">
            <legend className={`${sectionHeading} mb-2`}>Sort by</legend>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-full bg-raised">
              {SORT_FIELDS.map((field) => (
                <label key={field.label} className="cursor-pointer">
                  <input
                    type="radio"
                    name="sort-field"
                    className="peer sr-only"
                    checked={field === sortField}
                    // A new field starts in its first direction.
                    onChange={() => setSelectedSortType(field.directions[0].key)}
                  />
                  <span className={segment(field === sortField)}>{field.label}</span>
                </label>
              ))}
            </div>
            <div
              role="radiogroup"
              aria-label={`${sortField.label} order`}
              className="grid grid-cols-2 gap-1 p-1 rounded-full bg-raised"
            >
              {sortField.directions.map((direction) => (
                <label key={direction.key} className="cursor-pointer">
                  <input
                    type="radio"
                    name="sort-direction"
                    className="peer sr-only"
                    checked={selectedSortType === direction.key}
                    onChange={() => setSelectedSortType(direction.key)}
                  />
                  <span className={segment(selectedSortType === direction.key)}>
                    {direction.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <section aria-labelledby="filter-heading" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 id="filter-heading" className={sectionHeading}>
                Filter by service
              </h4>
              {selectedServices.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedServices([])}
                  className="min-h-11 px-2 text-sm text-fg-soft underline underline-offset-2"
                >
                  Clear {selectedServices.length}
                </button>
              )}
            </div>

            {filterGroups.length === 0 && (
              <p className="text-sm text-fg-muted">No services recorded yet.</p>
            )}

            {filterGroups.map((group) => (
              <fieldset key={group.label}>
                <legend className="text-sm text-fg-muted mb-2">{group.label}</legend>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((option) => {
                    const checked = selectedServices.includes(option.value);
                    return (
                      <label key={option.value} className="cursor-pointer">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={checked}
                          onChange={(e) => toggleService(option.value, e.target.checked)}
                        />
                        <span className={chip(checked)}>
                          {checked && <Svg type="check" size="sm" color="current" />}
                          {option.label}
                          <span
                            className={`text-sm tabular-nums ${
                              checked ? "text-accent-fg/70" : "text-fg-muted"
                            }`}
                          >
                            {option.count}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </section>
        </div>
      </BottomSheet>
    </div>
  );
}
