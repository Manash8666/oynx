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
        // Primary Developer Platform Pairing: Geist + JetBrains Mono / Geist Mono
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        // Option B: Stylized Agency / Boutique Studio Schema
        'ide-sans': ['var(--font-ide-sans)', 'sans-serif'],
        'ide-mono': ['var(--font-ide-mono)', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.04em', // Hero Title (-0.04em)
        tight: '-0.025em',  // Section H2 (-0.025em)
        snug: '-0.02em',    // Card H3 (-0.02em)
        lead: '-0.01em',    // Lead Text (-0.01em)
        micro: '+0.01em',   // UI Micro / Badges (+0.01em)
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
