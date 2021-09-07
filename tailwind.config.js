const defaultTheme = require("tailwindcss/defaultTheme");

/** @typedef { import('tailwindcss/defaultConfig') } DefaultConfig */
/** @typedef { import('tailwindcss/defaultTheme') } DefaultTheme */
/** @typedef { DefaultConfig & { theme: { extend: DefaultTheme } } } TailwindConfig */

/** @type {TailwindConfig} */

module.exports = {
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      animation: {
        "light-body-popup": "light-body-popup 0.5s ease",
        "light-footer-popup": "light-footer-popup 0.8s ease",
      },
      keyframes: {
        "light-body-popup": {
          "0%": { opacity: "0", transform: "scale(0.5) rotate(-20deg)" },
        },
        "light-footer-popup": {
          "0%, 50%": { opacity: "0", transform: "scaleX(0.8) translateY(-60px)" },
          "75%": { transform: "scaleX(0.8)" },
          "100%": { opacity: "1" },
        },
      },
      rotate: {
        "-20": "-20deg",
      },
    },
    boxShadow: {
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      "3xl": "0 35px 60px -15px rgba(0, 0, 0, 0.3)",
      inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
      none: "none",
      "lg-r": "10px 0 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    },
    zIndex: {
      "-100": -100,
      "-75": -70,
      "-50": -50,
      "-40": -40,
      "-30": -30,
      "-25": -25,
      "-20": -20,
      "-10": -10,
      "-1": -1,
      0: 0,
      10: 10,
      20: 20,
      25: 25,
      30: 30,
      40: 40,
      50: 50,
      75: 75,
      100: 100,
      auto: "auto",
    },
  },
  variants: {
    extend: {
      transform: ["group-hover"],
      scale: ["group-hover"],
      rotate: ["group-hover"],
      translate: ["group-hover"],
    },
    margin: ["responsive", "hover", "group-hover"],
    padding: ["responsive", "hover", "group-hover"],
    display: ["responsive", "hover", "group-hover"],
  },
  plugins: [],
};
