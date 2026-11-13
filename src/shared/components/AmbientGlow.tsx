/**
 * The soft background glows behind app screens. Clipped by its own layer so the
 * glows can't widen the page, which means ancestors don't need overflow-hidden
 * (that would break position: sticky for the content).
 */
export const AmbientGlow = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-glow/30 blur-3xl" />
    <div className="absolute top-32 -left-20 w-56 h-56 rounded-full bg-glow/10 blur-3xl" />
  </div>
);
