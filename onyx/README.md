# Onyx Code (`onyx.dev`)

> **High-Performance, Local-First Commercial AI IDE Platform**  
> Engineered with Bun, TypeScript, SolidJS 1.9, and Ollama. Certified 100% Commercial-Safe under permissive MIT licensing.

---

## ⚡ Overview

**Onyx** is a next-generation AI IDE engineered from the ground up for autonomous development, zero-latency local model execution, and full-spectrum multi-agent orchestration.

- **Local-First & Offline Inference:** Instant code generation and completions powered by native local Ollama inference (`qwen2.5-coder:1.5b`) with zero token costs and zero telemetry leaks.
- **Smart Hybrid Model Router:** Dynamic classification and token ledger that automatically routes high-complexity architectural tasks to frontier cloud models while routing inline edits locally.
- **MotionSites Visual Studio:** Built-in generative web studio with live side-by-side sandboxed iframe previews, responsive viewport switching, and liquid glass styling.
- **Graph-RAG Knowledge Graph:** AST-derived codebase knowledge graph computing multi-hop topological ripple impacts before modifying code.
- **Self-Healing Runtime:** Zero-broken-code runtime execution loop that intercepts runtime and syntax exceptions, analyzes stack traces, and self-heals files automatically.
- **PTY Terminal Process Guardian:** Bulletproof PTY lifecycle management with atomic git snapshots for instant 1-click agent rollback.
- **Native LSP Compiler Guard:** In-process TypeScript/language server compilation loop that catches type mismatches before patches touch disk.
- **Real-Time Legal Guard:** Automated commercial compliance scanner barring copyleft (AGPL) and unauthorized scrapers.

---

## 📦 Monorepo Architecture

```text
onyx/
├── packages/
│   ├── core/                  # Agent loop, swarm coordinator, memory, runtime, LSP guard
│   ├── indexing/              # Graph-RAG knowledge graph, vector indexing, legal guard
│   ├── vscode/                # Production VS Code extension bundle (onyx-code-1.0.0.vsix)
│   ├── web-ui/                # Web Studio dashboard & visual canvas
│   ├── llm/                   # Hybrid model router, Ollama provider, circuit breaker
│   ├── opencode/              # Headless CLI & TUI developer binary
│   └── ui/                    # SolidJS 1.9 reactive components & theme palette
├── bin/
│   ├── onyxdev                # Bash dev launcher
│   └── onyxdev.cmd            # Windows CMD dev launcher
└── script/
    └── check-legal-compliance.ts # Automated monorepo commercial compliance gate
```

---

## 🚀 Quick Start

### 1. Run Legal Compliance Gate
Verify that 100% of the monorepo is clean of copyleft, non-commercial research restrictions, or unauthorized scrapers:
```bash
bun run check:legal
```

### 2. Run Comprehensive Core Test Suite
```bash
cd packages/core
bun test
```

### 3. Start the Live Dev Server & Web Studio
```bash
bun run onyx-dev-server.ts
```
Open [http://localhost:3000](http://localhost:3000) to access the interactive Onyx Web Studio.

### 4. Install the Extension
```bash
code --install-extension onyx-code-1.0.0.vsix
```

---

## 🛡️ License, Compliances & EULA

Onyx Code is licensed under the **[GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE)** (<https://github.com/Manash8666/oynx.git>).

- **Community Core:** Fully open source under AGPL-3.0, protecting the ecosystem from closed cloud free-riders.
- **Enterprise EULA:** Commercial non-copyleft enterprise exceptions are governed by the **[End User License Agreement (EULA.md)](EULA.md)**.
- **Regulatory Compliances:** Model AUPs, GDPR, CCPA, EAR, and cybersecurity compliance details are documented in **[COMPLIANCE.md](COMPLIANCE.md)**.
- **Author & Copyright:** Copyright (C) 2026 Manash Dash / Onyx Contributors. All customer-generated code is 100% owned by the customer.
