import React, { useEffect, useMemo, useRef, useState } from "react";

import { RecordItem } from "../../serviceRecord/components/RecordItem";
import { SortFilterControls } from "./SortFilterControls";
import { useSortedFilteredRecords } from "../hooks/useSortedFilteredRecords";
import { serviceTypeStyle } from "../../../shared/theme/serviceTypes";
import { Svg } from "../../../shared/components/Svg";
import { groupByMonth, matchesSearch } from "../utils/groupRecords";
import { recordTitle } from "../../serviceRecord/utils/recordDisplay";

type TabKey =
  | "all"
  | "maintenance"
  | "replacement"
  | "inspection"
  | "tune"
  | "ownership";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "maintenance", label: "Maintenance" },
  { key: "replacement", label: "Replacement" },
  { key: "inspection", label: "Inspection" },
  { key: "tune", label: "Tune" },
  { key: "ownership", label: "Ownership" },
];

const SERVICE_TYPE_BY_TAB: Partial<Record<TabKey, string>> = {
  maintenance: "Maintenance",
  replacement: "Replacement",
  inspection: "Inspection",
  tune: "Tune",
};

// Sorts that keep records in date order, so month headers make sense.
const DATE_SORTS = new Set(["", "Serviced Date New-Old", "Serviced Date Old-New"]);

// Height of LogInfo's fixed header (py-2 around the 48px logo) plus any notch inset.
const HEADER_OFFSET = "calc(4rem + env(safe-area-inset-top))";

export interface RecordHistoryListProps {
  serviceRecords: ServiceRecord[];
  isCheckingForUpdates?: boolean;
  openRecord: (record: ServiceRecord) => void;
}

export function RecordHistoryList({
  serviceRecords,
  isCheckingForUpdates = false,
  openRecord,
}: RecordHistoryListProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");

  const {
    filteredRecords,
    selectedSortType,
    setSelectedSortType,
    selectedServiceTypes,
    setSelectedServiceTypes,
  } = useSortedFilteredRecords(serviceRecords);

  // Sort/filter sheet, then the type chips, then the title search.
  const records = useMemo(() => {
    const serviceType = SERVICE_TYPE_BY_TAB[activeTab];
    return filteredRecords.filter((r) => {
      if (activeTab === "ownership" && r.ServiceCategory !== "Ownership") return false;
      if (serviceType && r.ServiceType !== serviceType) return false;
      return matchesSearch(recordTitle(r), query);
    });
  }, [filteredRecords, activeTab, query]);

  const groups = useMemo(
    () =>
      DATE_SORTS.has(selectedSortType)
        ? groupByMonth(records)
        : [{ key: "all", label: "", records }],
    [records, selectedSortType]
  );

  // Month headers stick just below the sticky toolbar, whose height changes with
  // font loading and wrapping, so track it in a CSS variable.
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarHeight, setToolbarHeight] = useState(0);
  useEffect(() => {
    const el = toolbarRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => setToolbarHeight(el.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const searchRef = useRef<HTMLInputElement>(null);
  const clearSearch = () => {
    setQuery("");
    searchRef.current?.focus();
  };

  return (
    <div
      className="w-full mx-auto px-2"
      style={{ "--toolbar-h": `${toolbarHeight}px` } as React.CSSProperties}
    >
      {/* Sticky toolbar: search + sort/filter, then type chips. Ancestors must not
          set overflow (hidden/auto) or position: sticky stops working. */}
      <div
        ref={toolbarRef}
        className="sticky z-30 -mx-2 px-2 pt-2 pb-2 bg-canvas/90 backdrop-blur-md flex flex-col gap-2"
        style={{ top: HEADER_OFFSET }}
      >
        <div className="flex items-center gap-2">
          <div role="search" className="relative flex-1 min-w-0">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 flex text-fg-muted">
              <Svg type="search1" size="sm" color="current" />
            </span>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                // Enter dismisses the on-screen keyboard; results are already live.
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              placeholder="Search records"
              aria-label="Search records by title"
              autoComplete="off"
              enterKeyHint="search"
              className="w-full h-11 rounded-full bg-raised border border-line pl-10 pr-11 text-base text-fg placeholder-fg-muted outline-none focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={clearSearch}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-fg-muted"
              >
                <Svg type="cross" size="sm" color="current" />
              </button>
            )}
          </div>
          <SortFilterControls
            selectedSortType={selectedSortType}
            setSelectedSortType={setSelectedSortType}
            selectedServiceTypes={selectedServiceTypes}
            setSelectedServiceTypes={setSelectedServiceTypes}
          />
        </div>

        <div className="-mx-2 px-2 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              aria-pressed={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 h-11 px-4 gap-2 whitespace-nowrap flex items-center justify-center rounded-full text-sm transition-colors ${
                activeTab === tab.key ? "bg-accent text-accent-fg" : "bg-raised text-fg-soft"
              }`}
            >
              {SERVICE_TYPE_BY_TAB[tab.key] && (
                <span
                  aria-hidden="true"
                  className={`w-2 h-2 rounded-full ${serviceTypeStyle(SERVICE_TYPE_BY_TAB[tab.key]).dot}`}
                />
              )}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isCheckingForUpdates && (
        <div
          role="status"
          className="flex items-center justify-center gap-2 py-3 text-sm text-fg-muted funnel-display-font"
        >
          <span className="h-4 w-4 shrink-0 rounded-full border-2 border-line border-t-accent animate-spin" />
          Checking for the latest updates…
        </div>
      )}

      {/* Announces the result count as search or filters change. */}
      <p className="sr-only" aria-live="polite">
        {records.length === 1 ? "1 record" : `${records.length} records`}
      </p>

      {!records.length && !isCheckingForUpdates && (
        <div className="mx-4 my-10 text-center funnel-display-font">
          <h2 className="text-2xl font-semibold">
            {!serviceRecords.length
              ? "Oh no! There are no service records for this vehicle yet!"
              : query.trim()
              ? `No records match “${query.trim()}”.`
              : "No service records match this filter."}
          </h2>
          {query.trim() && serviceRecords.length > 0 && (
            <button
              type="button"
              onClick={clearSearch}
              className="mt-4 h-11 px-5 rounded-full bg-raised border border-line text-fg"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {groups.map((group) =>
        group.label ? (
          <section key={group.key} aria-labelledby={`month-${group.key}`}>
            <h3
              id={`month-${group.key}`}
              className="sticky z-20 -mx-2 px-3 py-2 bg-canvas/95 backdrop-blur-md flex items-baseline justify-between text-sm font-semibold text-fg-soft funnel-display-font"
              style={{ top: `calc(${HEADER_OFFSET} + var(--toolbar-h, 0px))` }}
            >
              {group.label}
              <span className="text-fg-muted font-normal">
                {group.records.length === 1 ? "1 record" : `${group.records.length} records`}
              </span>
            </h3>
            <ul className="w-full">
              {group.records.map((record) => (
                <RecordItem key={record.id} record={record} openRecord={() => openRecord(record)} />
              ))}
            </ul>
          </section>
        ) : (
          <ul key={group.key} className="w-full mt-1">
            {group.records.map((record) => (
              <RecordItem key={record.id} record={record} openRecord={() => openRecord(record)} />
            ))}
          </ul>
        )
      )}
    </div>
  );
}
