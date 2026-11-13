/**
 * The one place a service (record) type maps to a colour. Anything that shows
 * a type (list rows, badges, filter chips, stats bars, the type picker) takes
 * its classes from here; everything else uses the neutral theme tokens. The hex
 * values live in tailwind.config.js under `colors.type`.
 *
 * Class names are written out in full so Tailwind can find them.
 */
export interface ServiceTypeStyle {
  /** Small swatch next to a label. */
  dot: string;
  /** Left edge of a list row. */
  edge: string;
  /** Pill showing the type name. */
  badge: string;
  /** Type name as coloured text on a neutral surface. */
  text: string;
  /** Filled part of a bar. */
  bar: string;
}

const TYPE_STYLES: Record<string, ServiceTypeStyle> = {
  Maintenance: {
    dot: "bg-type-maintenance",
    edge: "border-l-type-maintenance",
    badge: "bg-type-maintenance/20 text-type-maintenance-fg",
    text: "text-type-maintenance-fg",
    bar: "bg-type-maintenance",
  },
  Replacement: {
    dot: "bg-type-replacement",
    edge: "border-l-type-replacement",
    badge: "bg-type-replacement/20 text-type-replacement-fg",
    text: "text-type-replacement-fg",
    bar: "bg-type-replacement",
  },
  Inspection: {
    dot: "bg-type-inspection",
    edge: "border-l-type-inspection",
    badge: "bg-type-inspection/20 text-type-inspection-fg",
    text: "text-type-inspection-fg",
    bar: "bg-type-inspection",
  },
  Adjustment: {
    dot: "bg-type-adjustment",
    edge: "border-l-type-adjustment",
    badge: "bg-type-adjustment/20 text-type-adjustment-fg",
    text: "text-type-adjustment-fg",
    bar: "bg-type-adjustment",
  },
  Tune: {
    dot: "bg-type-tune",
    edge: "border-l-type-tune",
    badge: "bg-type-tune/20 text-type-tune-fg",
    text: "text-type-tune-fg",
    bar: "bg-type-tune",
  },
};

/** Types without their own colour (WOF, Registration, Certification, ...). */
const NEUTRAL_STYLE: ServiceTypeStyle = {
  dot: "bg-fg-muted",
  edge: "border-l-fg-muted",
  badge: "bg-raised text-fg-soft",
  text: "text-fg-soft",
  bar: "bg-fg-muted",
};

export function serviceTypeStyle(type: string | null | undefined): ServiceTypeStyle {
  return (type && TYPE_STYLES[type]) || NEUTRAL_STYLE;
}

/** True when the type has its own colour, i.e. a swatch is meaningful. */
export function hasTypeColour(type: string | null | undefined): boolean {
  return !!type && type in TYPE_STYLES;
}
