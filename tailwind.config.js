// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [
    require('./my-preset.js')
  ],
  theme: {
    extend: {
      // App theme tokens, taken from the log list's navy-and-glow style. Use these
      // instead of raw palette colours on app screens (log, panels, sheets, forms).
      colors: {
        canvas: "#020617", // page background
        surface: "#0f172a", // cards, tiles, sheets
        raised: "#1e293b", // controls on a surface: inputs, chips, icon buttons
        line: "rgb(255 255 255 / 0.1)", // hairline borders and dividers
        fg: {
          DEFAULT: "#f8fafc", // primary text
          soft: "#cbd5e1", // secondary text
          muted: "#94a3b8", // metadata and labels; >= 4.5:1 on canvas, surface and raised
        },
        // Neutral on purpose: hue is reserved for record types (below), so
        // actions and selected states never read as a type.
        accent: {
          DEFAULT: "#e2e8f0", // primary actions and selected states
          fg: "#020617", // text/icons on accent
        },
        glow: "#1e40af", // decorative ambient glow only
        // Record-type colours. Map types to these only through
        // src/shared/theme/serviceTypes.ts, never directly in components.
        type: {
          maintenance: { DEFAULT: "#3b82f6", fg: "#93c5fd" },
          replacement: { DEFAULT: "#ef4444", fg: "#fca5a5" },
          inspection: { DEFAULT: "#22c55e", fg: "#86efac" },
          adjustment: { DEFAULT: "#facc15", fg: "#fef08a" },
          tune: { DEFAULT: "#8b5cf6", fg: "#c4b5fd" },
        },
      },
      borderRadius: {
        card: "1rem", // cards, tiles, inputs
        sheet: "1.5rem", // sheets and large containers
      },
      // Tailwind 3.3 has no spacing scale for min-height (3.4 adds one), so
      // classes like min-h-11 (the 44px tap-target minimum) need it here.
      minHeight: ({ theme }) => ({ ...theme("spacing") }),
    },
  },
  plugins: [],
}
