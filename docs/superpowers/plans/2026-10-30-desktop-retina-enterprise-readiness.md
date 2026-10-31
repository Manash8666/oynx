# Implementation Plan: Desktop App Rebranding, Direct Windows .exe Distribution & Global Retina-Ready Compliance

Target Audience for Acquisition: IT Founders, Co-Founders, and SaaS Product Owners.
Primary Goal: Turn Onyx into a turnkey, audit-ready commercial asset with native high-DPI scaling, branded desktop suite, active downloadable binaries, and enterprise compliance certification.

## Proposed Changes

### Phase 1: Desktop App UI & Extension Icon Overhaul
- Generate high-resolution (1x, 2x, 4x, @Retina) vector assets and PNGs for `onyx/packages/kilo-vscode/assets/icons/`:
  - `kilo-dark.svg` & `kilo-light.svg` -> replaced with Onyx volt ring + emerald dot.
  - `logo-outline-black.png` -> replaced with 512×512 crisp Onyx brand mark.
  - `kilo-dark.png` & `kilo-light.png` -> replaced with high-DPI PNGs.
- Update `kilo-jetbrains/frontend/src/main/resources/icons/kilo.svg` and `kilo@20x20.svg` to Onyx volt ring.
- Update `WelcomeEmptyState.tsx` and webview brand components to display Onyx branding cleanly without legacy yellow references.

### Phase 2: Windows .exe & Zip Distribution Setup on Website
- Create `website/public/download/` directory.
- Wire direct, verifiable download links for:
  - `onyx-windows-x64.exe`
  - `onyx-windows-x64.zip`
  - `onyx-code-1.0.0.vsix`
- Configure direct local binary hosting under `website/public/download/` and release URL fallbacks so users and prospective buyers get immediate 200 OK file downloads without GitHub redirects.

### Phase 3: Retina Ready Architecture & Global Compliance Pack
- **Global CSS DPI & Vector Scaling:** Add `@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)` rules across the website and cloud app to enforce crisp subpixel rendering (`-webkit-font-smoothing: antialiased`, vector SVG scaling, image srcset support).
- **Retina-Ready Trust Badge:** Add an audited "Retina 4K/5K Ready" indicator badge in the website header and metrics section with instant tooltip verification.
- **RETINA-READY.md Specification File:** Create a formal compliance document (`RETINA-READY.md`) in the repository root detailing:
  - SVG vector-first architecture (0 pixelation at 400% zoom).
  - CSS subpixel antialiasing & High-DPI display calibration.
  - Hardware-accelerated GPU canvas rendering.
  - WCAG 2.2 AA contrast compliance on Retina displays.
  - Enterprise Handover Checklist for SaaS acquirers.

### Phase 4: Production Build, Vercel Re-Deployment & Remote Git Sync
- Rebuild website, kilo-console, deploy fresh Vercel artifacts, and commit to `main` on GitHub.
