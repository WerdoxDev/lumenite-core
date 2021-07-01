const defaultTheme = require('tailwindcss/defaultTheme')

/** @typedef { import('tailwindcss/defaultConfig') } DefaultConfig */
/** @typedef { import('tailwindcss/defaultTheme') } DefaultTheme */
/** @typedef { DefaultConfig & { theme: { extend: DefaultTheme } } } TailwindConfig */

/** @type {TailwindConfig} */

module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      animation: {
        'light-body-popup': 'light-body-popup 0.5s ease',
        'light-footer-popup': 'light-footer-popup 0.8s ease'
      },
      keyframes: {
        'light-body-popup': {
          '0%': { opacity: '0', transform: 'scale(0.5) rotate(-20deg)' },
        },
        'light-footer-popup': {
          '0%, 50%': { opacity: '0', transform: 'scaleX(0.8) translateY(-60px)' },
          '75%': { transform: 'scaleX(0.8)' },
          '100%': { opacity: '1' }
        }
      },
      rotate: {
        '-20': '-20deg'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

