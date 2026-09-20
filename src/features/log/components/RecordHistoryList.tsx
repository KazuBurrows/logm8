import { useEffect, useMemo, useRef, useState } from "react";

import { RecordItem } from "../../serviceRecord/components/RecordItem";
import { SortFilterControls } from "./SortFilterControls";
import { useSortedFilteredRecords } from "../hooks/useSortedFilteredRecords";

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

// Height of LogInfo's fixed logo/button bar (h-16) that this bar must dock under.
const LOG_INFO_HEADER_HEIGHT = 64;

export interface RecordHistoryListProps {
  serviceRecords: ServiceRecord[];
  openRecord: (record: ServiceRecord) => void;
}

export function RecordHistoryList({
  serviceRecords,
  openRecord,
}: RecordHistoryListProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const {
    filteredRecords,
    selectedSortType,
    setSelectedSortType,
    selectedServiceTypes,
    setSelectedServiceTypes,
  } = useSortedFilteredRecords(serviceRecords);

  const records = useMemo(() => {
    if (activeTab === "all") return filteredRecords;
    if (activeTab === "ownership") {
      return filteredRecords.filter((r) => r.ServiceCategory === "Ownership");
    }
    const serviceType = SERVICE_TYPE_BY_TAB[activeTab];
    return filteredRecords.filter((r) => r.ServiceType === serviceType);
  }, [filteredRecords, activeTab]);

  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<Partial<Record<TabKey, HTMLButtonElement | null>>>({});

  const [isPinned, setIsPinned] = useState(false);
  const [barBox, setBarBox] = useState<{ left: number; width: number; height: number } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number; above: boolean } | null>(null);

  // CSS `sticky` doesn't work here: LogHistoryPanel's Section and the page
  // wrapper above it both set overflow-hidden, which breaks native sticky.
  // Simulate it with a fixed bar toggled by a sentinel's visibility instead.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsPinned(!entry.isIntersecting),
      { rootMargin: `-${LOG_INFO_HEADER_HEIGHT + 1}px 0px 0px 0px`, threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Measured once-on-mount would go stale (e.g. after webfont load reflow or
  // the tab scrollbar appearing) and leave the pinned bar's height reservation
  // too short, letting the fixed bar overlap the first record item. A
  // ResizeObserver keeps it accurate whenever the bar's actual size changes.
  useEffect(() => {
    const barEl = barRef.current;
    const containerEl = containerRef.current;
    if (!barEl || !containerEl) return;

    const updateBarBox = () => {
      const rect = containerEl.getBoundingClientRect();
      setBarBox({ left: rect.left, width: rect.width, height: barEl.offsetHeight });
    };

    updateBarBox();
    const resizeObserver = new ResizeObserver(updateBarBox);
    resizeObserver.observe(barEl);
    resizeObserver.observe(containerEl);
    window.addEventListener("resize", updateBarBox);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateBarBox);
    };
  }, []);

  // The tab bar scrolls horizontally (overflow-x-auto), which forces
  // overflow-y to auto too, so a tooltip positioned inside it gets clipped.
  // Render the tooltip outside the bar instead, fixed to viewport coordinates
  // measured from the active tab button.
  useEffect(() => {
    const updateTooltipPos = () => {
      const btn = tabButtonRefs.current[activeTab];
      const bar = barRef.current;
      if (!btn || !bar) return;
      const btnRect = btn.getBoundingClientRect();
      const barRect = bar.getBoundingClientRect();
      const above = barRect.top >= 32;
      setTooltipPos({
        left: btnRect.left + btnRect.width / 2,
        top: above ? barRect.top - 8 : barRect.bottom + 8,
        above,
      });
    };

    updateTooltipPos();
    const bar = barRef.current;
    window.addEventListener("resize", updateTooltipPos);
    window.addEventListener("scroll", updateTooltipPos, true);
    bar?.addEventListener("scroll", updateTooltipPos);
    return () => {
      window.removeEventListener("resize", updateTooltipPos);
      window.removeEventListener("scroll", updateTooltipPos, true);
      bar?.removeEventListener("scroll", updateTooltipPos);
    };
  }, [activeTab, isPinned, barBox]);

  return (
    <div className="w-full mx-auto px-2" ref={containerRef}>
      <div ref={sentinelRef} />
      {isPinned && barBox && <div style={{ height: barBox.height }} />}

      <div
        ref={barRef}
        className={`flex items-center gap-2 backdrop-blur-md pt-2 pb-2 ${
          isPinned ? "fixed z-30" : ""
        }`}
        style={
          isPinned && barBox
            ? { top: LOG_INFO_HEADER_HEIGHT, left: barBox.left, width: barBox.width }
            : undefined
        }
      >
        <SortFilterControls
          selectedSortType={selectedSortType}
          setSelectedSortType={setSelectedSortType}
          selectedServiceTypes={selectedServiceTypes}
          setSelectedServiceTypes={setSelectedServiceTypes}
        />
        <div
          className="flex gap-2 flex-1 min-w-0 overflow-x-scroll ml-12 pr-8 pb-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.35)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/35 [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          {TABS.map((tab) => (
          <button
            key={tab.key}
            ref={(el) => {
              tabButtonRefs.current[tab.key] = el;
            }}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-sm transition-colors ${
              activeTab === tab.key
                ? "bg-orange-500 text-white shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                : "bg-white/10 text-white/70"
            }`}
          >
            {tab.label[0]}
          </button>
        ))}
        </div>
      </div>

      {tooltipPos && (
        <span
          className="pointer-events-none fixed whitespace-nowrap rounded-full bg-black/80 px-3 py-1 text-xs text-white shadow-lg z-40"
          style={{
            left: tooltipPos.left,
            top: tooltipPos.top,
            transform: `translate(-50%, ${tooltipPos.above ? "-100%" : "0"})`,
          }}
        >
          {TABS.find((tab) => tab.key === activeTab)?.label} records
        </span>
      )}

      <ul className={`w-full mx-auto ${isPinned ? "mt-14" : ""}`}>
        {!records.length && (
          <h2 className="mx-4 text-2xl funnel-display-font font-semibold text-center">
            {serviceRecords.length
              ? "No service records match this filter."
              : "Oh no! There are no service records for this vehicle yet!"}
          </h2>
        )}
        {records.map((record, recordIndex) => (
          <RecordItem
            key={recordIndex}
            record={record}
            openRecord={() => openRecord(record)}
          />
        ))}
      </ul>
    </div>
  );
}
