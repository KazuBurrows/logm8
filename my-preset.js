// Example preset
module.exports = {
    theme: {
      extend: {
        animation: {
          'infinite-scroll': 'infinite-scroll 25s linear infinite',
          'shake': 'shake 0.4s ease-in-out',
        },
        textShadow: {
          sm: "1px 1px 2px rgba(0, 0, 0, 0.5)",
          DEFAULT: "2px 2px 4px rgba(0, 0, 0, 0.5)",
          md: "4px 4px 8px rgba(0, 0, 0, 0.4)",
          lg: "6px 6px 12px rgba(0, 0, 0, 0.3)",
        },
        keyframes: {
          'infinite-scroll': {
            from: { transform: 'translateX(0)' },
            to: { transform: 'translateX(-100%)' },
          },
          'shake': {
            '0%, 100%': { transform: 'translateX(0)' },
            '20%': { transform: 'translateX(-6px)' },
            '40%': { transform: 'translateX(6px)' },
            '60%': { transform: 'translateX(-4px)' },
            '80%': { transform: 'translateX(4px)' },
          },
        },
        fontSize: {
          'xs': '0.75rem',
          'sm': '.875rem',
          'base': '1rem',
          'lg': '1.125rem',
          'xl': '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem',
          '6xl': '3.75rem',
          '7xl': '4.5rem',
          '8xl': '5.2rem',
          '9xl': '5.7rem',
          '10xl': '6rem',
          '11xl': '10rem',
          '12xl': '12rem',
          '13xl': '12rem',
          '14xl': '13rem',
          '15xl': '14rem',
          '20xl': '30rem',
        },
        screens: {
          'h-xs':  { raw: '(min-height: 480px)' },
          'h-sm':  { raw: '(min-height: 640px)' },
          'h-md':  { raw: '(min-height: 768px)' },
          'h-lg':  { raw: '(min-height: 1024px)' },
          'h-xl':  { raw: '(min-height: 1280px)' },
          'h-2xl': { raw: '(min-height: 1440px)' },

          // ----- optional: max-height helpers -----
          'h-max-xs':  { raw: '(max-height: 479px)' },
          'h-max-sm':  { raw: '(max-height: 639px)' },
          'h-max-md':  { raw: '(max-height: 767px)' },
          'h-max-lg':  { raw: '(max-height: 1023px)' },
          'h-max-xl':  { raw: '(max-height: 1279px)' },
          'h-max-2xl': { raw: '(max-height: 1439px)' },

          // ----- optional: orientation helpers -----
          'portrait':  { raw: '(orientation: portrait)' },
          'landscape': { raw: '(orientation: landscape)' },
        },
      }
    },
    plugins: [
      function ({ addUtilities }) {
        addUtilities({
          ".text-shadow-sm": {
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
          },
          ".text-shadow": {
            textShadow: "2px 2px 8px rgba(0, 0, 0, 0.5)",
          },
          ".text-shadow-md": {
            textShadow: "32px 10px 5px rgba(0,0,0,0.06)",
          },
          ".text-shadow-lg": {
            textShadow: "6px 6px 12px rgba(0, 0, 0, 0.3)",
          },
          ".text-shadow-white-sm": {
            textShadow: "1px 1px 2px rgba(255, 255, 255, 0.5)",
          },
          ".text-shadow-white": {
            textShadow: "2px 2px 8px rgba(255, 255, 255, 0.5)",
          },
          ".text-shadow-white-md": {
            textShadow: "32px 10px 5px rgba(255, 255, 255, 0.06)",
          },
          ".text-shadow-white-lg": {
            textShadow: "6px 6px 12px rgba(255, 255, 255, 0.3)",
          },
        });
      },
    ],
  }