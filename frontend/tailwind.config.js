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
      boxShadow: {
        card: "0 1px 2px rgba(28,43,34,0.04), 0 4px 12px rgba(28,43,34,0.06)",
        "card-hover": "0 4px 8px rgba(28,43,34,0.06), 0 12px 24px rgba(28,43,34,0.1)",
        modal: "0 20px 50px rgba(28,43,34,0.25)",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: 0, transform: "scale(0.95) translateY(4px)" },
          "100%": { opacity: 1, transform: "scale(1) translateY(0)" },
        },
        stampIn: {
          "0%": { opacity: 0, transform: "scale(1.4) rotate(-8deg)" },
          "60%": { opacity: 1, transform: "scale(0.95) rotate(-3deg)" },
          "100%": { opacity: 1, transform: "scale(1) rotate(-3deg)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.25s ease-out both",
        fadeInUp: "fadeInUp 0.35s ease-out both",
        scaleIn: "scaleIn 0.2s ease-out both",
        stampIn: "stampIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
      },
    },
  },
  plugins: [],
};