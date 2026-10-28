# Onyx Code — The High-Performance Open-Source Commercial AI IDE

**Onyx** (`onyx.dev`) is an ultra-optimized, agentic engineering IDE platform built on **Bun**, **TypeScript**, **Effect-TS**, **SolidJS**, and **Hono**, designed specifically for commercial and enterprise production with zero legal complications.

---

## 🌟 Key Subsystems & Architectural Integrations

### 1. Universal Foundation Model Gateway & Local Ollama Runtime (`@opencode-ai/llm`)
- **Native Ollama Local Daemon:** First-class support for low-latency, zero-cost offline code completion and chat using `Qwen3-Coder`, `DeepSeek-Coder`, `Gemma 2 27B`, and `gpt-oss-120b`.
- **Open Model Registry:** Pre-configured profiles and capability metadata for:
  - **Qwen3 Series:** `qwen3`, `qwen3-vl`, `qwen3-coder` (Apache 2.0)
  - **DeepSeek Series:** `deepseek-v3`, `deepseek-r1` (MIT), `deepseek-coder` (MIT), `deepseek-ocr-2` (Apache 2.0)
  - **Google Gemma:** `gemma-27b` (Gemma Terms of Use)
  - **Zhipu GLM:** `glm-5` (Apache 2.0)
  - **Moonshot Kimi:** `kimi-k3` (Kimi K3 License)
  - **NVIDIA:** `nemotron` 70B (Apache 2.0 / NVIDIA Open Model License)
  - **OpenAI Open Weights:** `gpt-oss-120b`, `gpt-oss-20b` (Apache 2.0)

### 2. MotionSites Cinematic UI Engine (`@opencode-ai/core/skills`)
- **MIT-Compliant Design System:** Inherits 67+ curated web design prompt templates from MotionSites without proprietary media bundles.
- **Glassmorphic & Kinetic Styles:** Built-in support for `.liquid-glass`, ambient glows, fluid typography, and dynamic bento grid layouts.
- **Framework Support:** Generates production-ready React 19 / SolidJS components with Tailwind CSS v4 and Lucide icons.

### 3. Clean-Room Document & Legal Compliance Engine (`@onyx/indexing`)
- **LlamaIndex-Inspired Semantic Chunker:** Recursively parses and chunks source code and documents with AST boundary preservation and line metadata.
- **Legal Compliance & Contract Analyzer:** Automatically audits dependencies, licenses, and documentation to safeguard against unauthorized scrapers, CFAA violations, and third-party restrictions to ensure clean dual-licensing rights.

### 4. Self-Improving Agent Memory Loop (`@opencode-ai/core/agent`)
- **Adaptive Memory:** Distills coding patterns, user preferences, and error corrections across sessions.
- **Trajectory Reflection Loop:** Evaluates agent execution trajectories to generate actionable anti-pattern warnings and prevent recurring regressions.

### 5. Multimodal Generative Media Studio (`@opencode-ai/core/media`)
- **Video, Image, & Audio Dispatcher:** Enables developers to generate UI video walkthroughs, hero backdrops, and sonic feedback directly within the IDE studio.

### 6. Reactive UI & Onyx Frontend Suite (`@opencode-ai/ui` & `@onyx/web-ui`)
- **SolidJS 1.9 + Tailwind CSS v4:** High-performance, zero-virtual-DOM reactive frontend architecture.
- **Onyx Components (`src/components/vibe`):**
  - `<ModelSelectorPanel />`: Interactive switcher between local Ollama zero-cost models and cloud frontier models.
  - `<MotionSitesStudioPanel />`: Visual generator panel with 67+ prompt templates and `.liquid-glass` live previews.
  - `<LegalComplianceCard />`: Real-time license status and AGPL/TOS risk badge.
  - `<GenerativeMediaPanel />`: Video, image, and audio dispatch dock.
- **Storybook Story:** Visual sandbox preview available in `vibe-suite.stories.tsx`.

---

## 🛡️ Legal Compliance & Licensing Triage

| Category | Component / Library | License | Commercial Status |
|:---|:---|:---|:---|
| Base Platform | `Onyx Core Architecture` | **MIT** | Permissive (Approved) |
| Local LLM Runner | `ollama/ollama` | **MIT** | Permissive (Approved) |
| Document Parsing | `run-llama/llama_index` | **MIT** | Permissive (Approved) |
| Agent Intelligence | `agno-agi/agno` | **Apache-2.0** | Permissive (Approved) |
| Web Design Prompts | `motionsites-prompt-collection` | **MIT** | Permissive (Approved) |
| Generative Media | `Open-Generative-AI` | **MIT** | Permissive (Approved) |
| Legal Platform | `open-legal-products/mike` | **AGPL-3.0** | **PROHIBITED** (Replaced with clean MIT parser) |
| Scraper Wrapper | `MetaAI-Free-Hermes-Agent` | **TOS Violator** | **PROHIBITED** (Replaced with legitimate Ollama/API models) |

---

## 🚀 Development Quickstart

```bash
# 1. Start Ollama local runtime
ollama serve

# 2. Run unit tests across all platform packages
bun test onyx/packages/llm/test/ollama-provider.test.ts \
         onyx/packages/core/test/motionsites-engine.test.ts \
         onyx/packages/core/test/clean-room-legal-engine.test.ts \
         onyx/packages/core/test/self-improving-memory.test.ts \
         onyx/packages/core/test/generative-studio.test.ts

# 3. Launch the IDE dev server
cd onyx
bun run dev
```
