import { AmbientGlow } from "../../../shared/components/AmbientGlow";

const bar = "rounded-full bg-raised";

/**
 * Placeholder for the log page while its code or data loads. Mirrors the real
 * layout (header, vehicle title, filter bar, record rows) on the app's dark
 * background so nothing flashes white or jumps when the records arrive.
 */
export function LogSkeleton() {
  return (
    <div role="status" className="relative min-h-screen bg-canvas text-fg funnel-display-font">
      <span className="sr-only">Loading service records…</span>
      <AmbientGlow />

      <div aria-hidden="true" className="relative motion-safe:animate-pulse">
        {/* Header: logo + menu */}
        <div className="flex items-center justify-between pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2 pl-[calc(0.5rem+env(safe-area-inset-left))] pr-[calc(0.5rem+env(safe-area-inset-right))]">
          <div className="w-12 h-12 rounded-full bg-raised" />
          <div className="w-11 h-11 rounded-full bg-raised" />
        </div>

        {/* Vehicle title */}
        <div className="px-2 pt-10 pb-8 my-4 rounded-b-sheet bg-gradient-to-b from-surface via-surface/60 to-transparent">
          <div className={`${bar} h-6 w-28`} />
          <div className={`${bar} h-10 w-64 mt-3`} />
          <div className="mt-3 flex items-center justify-between">
            <div className={`${bar} h-7 w-20`} />
            <div className="flex gap-2">
              <div className="w-11 h-11 rounded-full bg-raised" />
              <div className="w-11 h-11 rounded-full bg-raised" />
            </div>
          </div>
        </div>

        {/* Search + filter, then type chips */}
        <div className="px-2 py-2 flex flex-col gap-2 overflow-hidden">
          <div className="flex items-center gap-2">
            <div className={`${bar} h-11 flex-1`} />
            <div className="w-11 h-11 shrink-0 rounded-full bg-raised" />
          </div>
          <div className="flex gap-1.5">
            <div className={`${bar} h-11 w-14 shrink-0`} />
            <div className={`${bar} h-11 w-32 shrink-0`} />
            <div className={`${bar} h-11 w-32 shrink-0`} />
          </div>
        </div>

        {/* Record rows */}
        <ul className="px-2 flex flex-col gap-1">
          {Array.from({ length: 6 }, (_, i) => (
            <li
              key={i}
              className="rounded-card bg-surface border border-line border-l-4 border-l-raised px-4 py-3"
            >
              <div className={`${bar} h-5 ${i % 2 ? "w-1/2" : "w-2/3"}`} />
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <div className={`${bar} h-3.5 w-24`} />
                  <div className={`${bar} h-3.5 w-20 mt-2`} />
                </div>
                <div className={`${bar} h-7 w-28`} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
