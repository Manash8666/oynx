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
        anthracite: {
          base: "#07080a",      // Obsidian Dark (Base)
          charcoal: "#0b0d11",  // Deep Charcoal (Cards / Sections)
          surface: "#12151d",   // Card / Surface Dark
          elevated: "#181c26",  // Elevated Dark / Hover
        },
        volt: {
          DEFAULT: "#d8ff38",   // Electric Lime / Volt
          glow: "rgba(216, 255, 56, 0.25)",
          border: "rgba(216, 255, 56, 0.35)",
        },
        status: {
          emerald: "#22c55e",
          red: "#ef4444",
          yellow: "#eab308",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Syne"', '"Epilogue"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'volt-glow': '0 0 25px rgba(216, 255, 56, 0.25)',
        'volt-glow-lg': '0 0 45px rgba(216, 255, 56, 0.35)',
        'anthracite-card': 'inset 0 1px 1px rgba(255, 255, 255, 0.06), 0 20px 40px -15px rgba(0, 0, 0, 0.7)',
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
