/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        onyx: {
          950: "#07080a",
          900: "#0e1117",
          850: "#131720",
          800: "#1a1f2c",
          700: "#272f42",
          600: "#38435d",
        },
        accent: {
          purple: "#9333ea",
          indigo: "#6366f1",
          emerald: "#10b981",
          amber: "#f59e0b",
          cyan: "#06b6d4",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Syne"', '"Epilogue"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "marquee": "marquee 25s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
}
