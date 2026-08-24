/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  mode: "jit",
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--c-primary) / <alpha-value>)",
        secondary: "rgb(var(--c-secondary) / <alpha-value>)",
        tertiary: "rgb(var(--c-tertiary) / <alpha-value>)",
        "black-100": "rgb(var(--c-black-100) / <alpha-value>)",
        "black-200": "rgb(var(--c-black-200) / <alpha-value>)",
        "white-100": "rgb(var(--c-white-100) / <alpha-value>)",
        white: "rgb(var(--c-white) / <alpha-value>)",
        black: "rgb(var(--c-black) / <alpha-value>)",
        accent: "rgb(var(--c-accent) / <alpha-value>)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
      screens: {
        xs: "450px",
      },
      backgroundImage: {
        "hero-pattern": "url('/src/assets/herobg.png')",
      },
      animation: {
        'spin-reverse': 'spin 1.5s linear infinite reverse',
      },
    },
  },
  plugins: [],
};
