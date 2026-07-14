/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--color-paper)",
        card: "var(--color-card)",
        ink: "var(--color-ink)",
        inksoft: "var(--color-inksoft)",
        line: "var(--color-line)",
        gold: "var(--color-brand)", // Map legacy gold elements to the primary brand color
        brand: "var(--color-brand)",
        "brand-dark": "var(--color-brand-dark)",
        "brand-mint": "var(--color-brand-mint)",
        "brand-soft": "var(--color-brand-soft)",
        credit: "var(--color-credit)",
        debt: "var(--color-debt)",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        "card-hover": "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        modal: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
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