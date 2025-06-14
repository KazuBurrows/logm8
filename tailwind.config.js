// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [
    require('./my-preset.js')
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
