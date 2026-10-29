---
name: ui-motion-designer
description: Use when the user asks to generate, design, or build modern web components, landing pages, interactive hero sections, WebGL shader canvases, cinematic motion sites, or creative UI layouts using AI models.
---

# Onyx Living Hero & MotionSites UI Generative Engine

This skill equips the Onyx IDE agent and connected AI models to generate award-winning, cinematic landing pages, living UI components, and WebGL shader hero sections.

## Design System & Theme Foundations
- **Base Canvas:** `#07080a` (Obsidian Dark)
- **Surfaces:** `#0b0d11` (Deep Charcoal) and `#12151d` (Card Dark)
- **Elevated / Hover:** `#181c26`
- **Accent Volt:** `#d8ff38` (Electric Lime / Volt) with glow `rgba(216, 255, 56, 0.25)`
- **Success / Live:** `#22c55e` (Accent Emerald)
- **Borders:** Hairline `rgba(255, 255, 255, 0.08)`
- **Typography:**
  - Headings / Body: `Geist` (or Inter Display)
  - Code / Terminal / Metrics: `Geist Mono` or `JetBrains Mono`

## 70 Living Hero Template Categories & Slugs
1. **shaders-3d**: WebGL shaders, volumetric illumination, raymarching, liquid metal, depth maps
   - Key slugs: `vermilion`, `relic`, `mercury`, `aurora`, `event-horizon`, `cyber-monolith`, `liquid-metal`, `plasma-core`
2. **experiences**: Interactive 3D camera transitions, kinetic typography, GSAP smooth scroll
   - Key slugs: `quantum-realm`, `chronos`, `hyper-speed`, `deep-space`, `neon-gravity`
3. **artwork-parallax**: Multi-layer 2.5D depth parallax, pointer-tracking illustrations
   - Key slugs: `tokyo-drift`, `astral-voyage`, `synthwave-highway`, `obsidian-peaks`
4. **ascii-print**: High-tech retro-terminal, ASCII wireframes, matrix cascades, typography grids
   - Key slugs: `orbit-ascii`, `terminal-flow`, `matrix-rain`, `cyber-deck`
5. **glass-gradients**: Iridescent chromatic meshes, frosted glass, backdrop blur
   - Key slugs: `spectral-mesh`, `liquid-glass`, `aurora-borealis`, `prism-bloom`

## Generated UI Architecture
When generating UI components or full landing pages:
1. Embed the responsive WebGL background canvas:
```html
<section style="position:relative; min-height:100vh; isolation:isolate; overflow:hidden;">
  <canvas data-bg style="position:absolute; inset:0; width:100%; height:100%; z-index:-1;"></canvas>
  <!-- Main Hero UI and CTAs -->
</section>
<script src="/templates/<template-slug>/bg.js"></script>
```
2. Use dark anthracite cards with subtle hairline borders (`border border-white/[0.08] bg-[#0b0d11]/80 backdrop-blur-md`).
3. Wire buttons with high-contrast Electric Lime fills (`bg-[#d8ff38] text-[#07080a] font-bold shadow-[0_0_20px_rgba(216,255,56,0.3)]`).
4. Ensure 100% responsiveness on mobile, tablet, and desktop viewports.
