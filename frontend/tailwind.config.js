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
        display: ["Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 4px 16px -2px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 12px 32px -4px rgba(0, 0, 0, 0.08)",
        modal: "0 20px 35px -5px rgba(0, 0, 0, 0.12), 0 10px 15px -5px rgba(0, 0, 0, 0.05)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.06)",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: 0, transform: "scale(0.97) translateY(4px)" },
          "100%": { opacity: 1, transform: "scale(1) translateY(0)" },
        },
        stampIn: {
          "0%": { opacity: 0, transform: "scale(1.3) rotate(-8deg)" },
          "60%": { opacity: 1, transform: "scale(0.96) rotate(-3deg)" },
          "100%": { opacity: 1, transform: "scale(1) rotate(-3deg)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: 0.8 },
          "50%": { opacity: 0.3 },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both",
        fadeInUp: "fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        scaleIn: "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both",
        stampIn: "stampIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        pulseGlow: "pulseGlow 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};