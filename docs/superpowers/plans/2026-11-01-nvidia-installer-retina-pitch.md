# NVIDIA-Style Windows Installer, Clean Rebuild, and Executive Demo Pitch Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cleanly rebuild `onyx.exe`, transform the Windows installer into a sleek NVIDIA GeForce-style HD Retina-ready multi-step wizard, create the comprehensive `What is Onyx.md` commercial acquisition pitch document, and deploy the dedicated `/what-is-onyx` interactive marketing & client demo page on `https://oynx.si`.

**Architecture:**
- Standalone Go binary compiled with `-ldflags "-H windowsgui -s -w"` and Per-Monitor V2 DPI Awareness embedding `onyx-payload.zip`.
- Windows GUI implemented using zero-console XAML/WPF engine inspired by NVIDIA driver installer aesthetics: widescreen dark titanium layout (~820x530), custom titlebar, vertical 5-stage stepper, interactive feature carousel during install, and volt green telemetry.
- Commercial acquisition & enterprise pitch document `What is Onyx.md` covering executive vision, competitive moat, live working features, enterprise compliance, and a 5-minute client demo script.
- Responsive React + Tailwind page `website/src/pages/WhatIsOnyx.tsx` with live interactive feature explorer, cost ROI calculator, and client demo mode deployed to `https://oynx.si/what-is-onyx`.

**Tech Stack:** Go 1.23+, Bun 1.4+, React 18, Vite, Tailwind CSS, Vercel CLI, Windows Per-Monitor DPI V2 APIs.

---

## Global Constraints
- Target Buyer Persona: IT Companies Founders, Co-Founders, SaaS Product Owners.
- Brand Theme: Onyx Dark Graphite (`#0b0d12`), Cyber Volt (`#d8ff38`), Compiler Emerald (`#22c55e`).
- High-DPI: 100% Vector geometry and font-relative scaling; crisp rendering on 4K, 2K, 125%, 150%, 200% displays.
- Zero MS-DOS Console Flash: Installer must run strictly as a GUI process with hidden child processes (`CREATE_NO_WINDOW`).
- Commercial Cleanliness: Zero traces of legacy or clone names; 100% proprietary Onyx IP branding.

---

## Task Breakdown

### Task 1: Verify Clean Rebuild of `onyx.exe` & Package Payload
- [ ] Wait for `task-6167` to finish.
- [ ] Verify binary output at `onyx/packages/opencode/dist/@onyx/cli-windows-x64/bin/onyx.exe`.
- [ ] Execute smoke test: `.\onyx.exe --version` and `.\onyx.exe --help`.
- [ ] Repack into `installer/onyx-payload.zip`.

### Task 2: Build NVIDIA-Style HD Retina-Ready Windows Installer
- [ ] Update `installer/main.go` with NVIDIA GeForce style multi-step wizard (System Check -> License -> Options -> Installing Carousel -> Finish).
- [ ] Add Per-Monitor V2 High-DPI declaration and vector graphics.
- [ ] Ensure `CREATE_NO_WINDOW` is set on all background process executions.
- [ ] Compile to `website/public/download/onyx-windows-x64.exe` using `-ldflags "-H windowsgui -s -w"`.
- [ ] Verify installer execution.

### Task 3: Author `What is Onyx.md` Commercial Demo Pitch Deck
- [ ] Write `What is Onyx.md` in repository root.
- [ ] Cover Executive Purpose, The Lock-In Problem, The Onyx Moat vs Cursor/Windsurf/Claude Code.
- [ ] Document all live working features, enterprise security/compliance, and 5-minute demo script.

### Task 4: Develop & Deploy `/what-is-onyx` on Website
- [ ] Create `website/src/pages/WhatIsOnyx.tsx` with hero, live feature matrix, ROI calculator, and demo walkthrough.
- [ ] Link `/what-is-onyx` in `website/src/components/Navbar.tsx` and route in `website/src/App.tsx`.
- [ ] Build marketing site (`npm --prefix website run build`).
- [ ] Deploy to Vercel production (`https://oynx.si`).

### Task 5: Final Git Sync & End-to-End Verification
- [ ] Commit all changes to `origin main`.
- [ ] Test live pages with `chrome-devtools-mcp`.
