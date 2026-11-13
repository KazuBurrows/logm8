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
        accent: {
          DEFAULT: "#3b82f6", // primary actions and selected states
          fg: "#ffffff", // text/icons on accent
        },
        glow: "#3b82f6", // decorative ambient glow only
      },
      borderRadius: {
        card: "1rem", // cards, tiles, inputs
        sheet: "1.5rem", // sheets and large containers
      },
    },
  },
  plugins: [],
}
