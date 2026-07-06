/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#E9F0E4",
        card: "#FFFFFF",
        ink: "#1C2B22",
        inksoft: "#4B5C4F",
        line: "#C7D4C0",
        gold: "#B8892B",
        credit: "#2F6B45",
        debt: "#A8402A",
      },
      fontFamily: {
        display: ["'Roboto Slab'", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
