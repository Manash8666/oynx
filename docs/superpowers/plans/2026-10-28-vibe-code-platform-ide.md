# Vibe Code Platform (Kilo-Based) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the cloned Kilo codebase into the "Vibe Code Platform" — a commercial-grade, legally compliant, highly optimized AI IDE featuring multi-model orchestration (DeepSeek, Qwen3, Gemma, Kimi K3, GLM-5, Nemotron, Ollama), self-improving agents (Agno-inspired), clean document/legal parsing (LlamaIndex-inspired), MotionSites visual generation, and multimodal video generation.

**Architecture:** Extend Kilo's Bun/SolidJS/Effect-TS/Hono monorepo with pluggable, modular packages: native Ollama and universal OpenAI-compatible model profiles in `@kilocode/llm`, an AGPL-free document intelligence pipeline in `@kilocode/kilo-indexing`, self-improving agent memory loops in `@kilocode/core`, and MotionSites visual web generation in `@kilocode/kilo-ui`. All code strictly adheres to permissive commercial licensing (MIT/Apache 2.0).

**Tech Stack:** Bun 1.4, TypeScript 5.8, Effect-TS 4.0, SolidJS 1.9, Hono 4.12, Drizzle ORM / SQLite, Tailwind CSS 4, Ollama 0.40, LlamaIndex concepts, Agno agent architecture.

**Spec:** `C:\Users\Manas\.gemini\antigravity\brain\21d069cf-9d52-45d2-b44f-107fb96c5fa2\legal-compliance-and-architecture-audit.md`

## Global Constraints

- **Commercial Safety Floor:** Under no circumstances may any code from `open-legal-products/mike` (AGPL-3.0) or `compnew2006/MetaAI-Free-Hermes-Agent` (TOS violator) be copied or linked into the codebase.
- **Asset Cleanliness:** Any components inherited from `Motionsites-AI/claude-skill` must exclude the `examples/` and `media/` proprietary folders.
- **Runtime Compatibility:** Core services must run seamlessly on Bun 1.4 on Windows and cross-platform POSIX environments.
- **Model Standard:** Model providers must expose standard OpenAI-compatible and Anthropic-compatible streaming interfaces with tool calling support.

## Review Focus

1. **Local Ollama Connectivity Failure:** When the local Ollama daemon is offline or cold-starting, the IDE must gracefully suggest starting the service or fail over to configured cloud endpoints without hanging.
2. **Streaming Protocol Backpressure:** High-throughput token streaming from DeepSeek-R1 or Qwen3-Coder must not drop chunks or desynchronize SolidJS reactive state.
3. **Malicious / Corrupt Document Ingestion:** The document parsing pipeline must handle malformed PDFs, oversized source files, or binary artifacts without crashing the indexing worker.
4. **Agent Self-Improvement Cycle Divergence:** Agent memory reflections must be strictly bounded in token size and validated against schema to avoid context window explosion.
5. **Proprietary Asset Leakage:** Automated build checks must verify no restricted media assets from upstream repositories are bundled into production artifacts.

---

### Task 1: First-Class Ollama & Universal Open-Model Gateway in `@kilocode/llm`

**Files:**
- Create: `kilocode/packages/llm/src/providers/ollama.ts`
- Create: `kilocode/packages/llm/src/providers/open-model-registry.ts`
- Modify: `kilocode/packages/llm/src/providers/index.ts`
- Test: `kilocode/packages/llm/test/ollama-provider.test.ts`

**Interfaces:**
- Consumes: `Provider` interface and `LLMOptions` from `kilocode/packages/llm/src/provider.ts`
- Produces: `ollamaProvider` and `openModelRegistry` supporting Qwen3, DeepSeek-V3/R1/Coder, Gemma, Kimi-K3, GLM-5, Nemotron, and gpt-oss.

- [ ] **Step 1: Write the failing unit test for Ollama provider and model catalog**

```typescript
// kilocode/packages/llm/test/ollama-provider.test.ts
import { describe, it, expect } from "bun:test"
import { ollamaProvider } from "../src/providers/ollama"
import { openModelRegistry } from "../src/providers/open-model-registry"

describe("Ollama Provider & Open Model Registry", () => {
  it("should initialize ollama provider with default localhost endpoint", () => {
    const provider = ollamaProvider({ baseUrl: "http://127.0.0.1:11434" })
    expect(provider.id).toBe("ollama")
    expect(provider.baseUrl).toBe("http://127.0.0.1:11434")
  })

  it("should contain registry metadata for Qwen3-Coder, DeepSeek-R1, and Gemma", () => {
    const qwen = openModelRegistry.get("qwen3-coder")
    const deepseek = openModelRegistry.get("deepseek-r1")
    const gemma = openModelRegistry.get("gemma-27b")

    expect(qwen).toBeDefined()
    expect(qwen?.recommendedContext).toBeGreaterThanOrEqual(32768)
    expect(deepseek?.supportsReasoning).toBe(true)
    expect(gemma?.license).toBe("gemma-terms")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test kilocode/packages/llm/test/ollama-provider.test.ts`
Expected: FAIL ("Cannot find module ../src/providers/ollama")

- [ ] **Step 3: Implement `ollama.ts` and `open-model-registry.ts`**

Implement `ollamaProvider` using Kilo's provider architecture and configure the full open model metadata directory for Qwen3 (base, VL, coder), DeepSeek (V3, R1, Coder), Gemma, GLM-5, Kimi-K3, Nemotron, and gpt-oss.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test kilocode/packages/llm/test/ollama-provider.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add kilocode/packages/llm/src/providers/ollama.ts kilocode/packages/llm/src/providers/open-model-registry.ts kilocode/packages/llm/test/ollama-provider.test.ts
git commit -m "feat(llm): add native Ollama provider and open model registry"
```

---

### Task 2: MotionSites UI Design Engine & Prompt System Integration

**Files:**
- Create: `kilocode/packages/core/src/skills/motionsites-engine.ts`
- Create: `kilocode/packages/core/src/skills/motionsites-prompts.ts`
- Test: `kilocode/packages/core/test/motionsites-engine.test.ts`

**Interfaces:**
- Consumes: Prompt rules and skill guidelines from `references/claude-skill` and `references/motionsites-prompt-collection`
- Produces: `generateMotionSiteSpec(prompt: string, category: string): MotionSiteSpec` and `motionSitePromptsCatalog`

- [ ] **Step 1: Write the failing test for MotionSites generation engine**

```typescript
// kilocode/packages/core/test/motionsites-engine.test.ts
import { describe, it, expect } from "bun:test"
import { generateMotionSitePrompt, getMotionSiteCategories } from "../src/skills/motionsites-engine"

describe("MotionSites Engine", () => {
  it("should list available cinematic web design categories", () => {
    const categories = getMotionSiteCategories()
    expect(categories).toContain("saas-landing")
    expect(categories).toContain("portfolio")
    expect(categories).toContain("ai-agent-showcase")
  })

  it("should compile a structured design prompt injecting MotionSites aesthetic rules", () => {
    const prompt = generateMotionSitePrompt({
      category: "saas-landing",
      productName: "Vibe Code",
      description: "Next-gen agentic IDE"
    })
    expect(prompt).toContain("Tailwind CSS")
    expect(prompt).toContain("kinetic typography")
    expect(prompt).not.toContain("proprietary-asset")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test kilocode/packages/core/test/motionsites-engine.test.ts`
Expected: FAIL ("Cannot find module ../src/skills/motionsites-engine")

- [ ] **Step 3: Implement `motionsites-engine.ts` and `motionsites-prompts.ts`**

Incorporate the 67+ prompt templates and design system tokens cleanly under MIT licensing, providing structured design generation workflows without bundling restricted media.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test kilocode/packages/core/test/motionsites-engine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add kilocode/packages/core/src/skills/motionsites-engine.ts kilocode/packages/core/src/skills/motionsites-prompts.ts kilocode/packages/core/test/motionsites-engine.test.ts
git commit -m "feat(core): integrate MotionSites generative design engine"
```

---

### Task 3: Clean-Room Document Parsing & Legal AI Intelligence (LlamaIndex-Inspired, MIT)

**Files:**
- Create: `kilocode/packages/kilo-indexing/src/document-parser.ts`
- Create: `kilocode/packages/kilo-indexing/src/legal-clause-analyzer.ts`
- Test: `kilocode/packages/kilo-indexing/test/document-parser.test.ts`

**Interfaces:**
- Consumes: File buffer / string input (Markdown, Code, PDF text, Legal agreements)
- Produces: `parseDocumentNodes(content: string, options: ChunkOptions): DocumentNode[]` and `analyzeLegalCompliance(text: string): LegalRiskAssessment`

- [ ] **Step 1: Write the failing test for document parser and legal compliance analyzer**

```typescript
// kilocode/packages/kilo-indexing/test/document-parser.test.ts
import { describe, it, expect } from "bun:test"
import { parseDocumentNodes, analyzeLegalCompliance } from "../src/document-parser"

describe("Document & Legal Intelligence Engine", () => {
  it("should chunk source files into semantic AST nodes with line metadata", () => {
    const source = `function hello() {\n  return "world"\n}\n\nfunction goodbye() {\n  return "farewell"\n}`
    const nodes = parseDocumentNodes(source, { chunkSize: 50, language: "typescript" })
    expect(nodes.length).toBeGreaterThan(0)
    expect(nodes[0].metadata.startLine).toBeDefined()
  })

  it("should flag copyleft AGPL licenses and terms of service risks in analyzed text", () => {
    const legalText = "This software is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0)."
    const assessment = analyzeLegalCompliance(legalText)
    expect(assessment.hasCopyleftRisk).toBe(true)
    expect(assessment.licenseDetected).toBe("AGPL-3.0")
    expect(assessment.recommendation).toContain("isolate")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test kilocode/packages/kilo-indexing/test/document-parser.test.ts`
Expected: FAIL ("Cannot find module ../src/document-parser")

- [ ] **Step 3: Implement `document-parser.ts` and `legal-clause-analyzer.ts`**

Build the recursive chunker, token counter, AST extractor, and legal compliance detector using pure TypeScript, standard AST parsers, and MIT heuristics.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test kilocode/packages/kilo-indexing/test/document-parser.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add kilocode/packages/kilo-indexing/src/document-parser.ts kilocode/packages/kilo-indexing/src/legal-clause-analyzer.ts kilocode/packages/kilo-indexing/test/document-parser.test.ts
git commit -m "feat(indexing): add LlamaIndex-inspired document chunking and legal compliance analyzer"
```

---

### Task 4: Self-Improving Agent Memory & Reflection Engine (Agno-Inspired, Apache 2.0)

**Files:**
- Create: `kilocode/packages/core/src/agent/self-improving-memory.ts`
- Create: `kilocode/packages/core/src/agent/reflection-loop.ts`
- Test: `kilocode/packages/core/test/self-improving-memory.test.ts`

**Interfaces:**
- Consumes: `Session` and `ToolCall` events from `@kilocode/core`
- Produces: `recordAgentExecution(execution: AgentExecution): Promise<void>` and `getAdaptiveLearnings(context: TaskContext): Promise<LearningInsight[]>`

- [ ] **Step 1: Write the failing test for self-improving agent memory**

```typescript
// kilocode/packages/core/test/self-improving-memory.test.ts
import { describe, it, expect } from "bun:test"
import { SelfImprovingMemory } from "../src/agent/self-improving-memory"

describe("Self-Improving Agent Memory (Agno-Inspired)", () => {
  it("should record successful patterns and extract reusable coding insights", async () => {
    const memory = new SelfImprovingMemory({ maxLearnings: 50 })
    await memory.recordOutcome({
      task: "build reactive counter",
      success: true,
      strategy: "used createSignal with accessor syntax in SolidJS",
      language: "typescript"
    })

    const insights = await memory.retrieveInsights("SolidJS state management")
    expect(insights.length).toBeGreaterThan(0)
    expect(insights[0].strategy).toContain("createSignal")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test kilocode/packages/core/test/self-improving-memory.test.ts`
Expected: FAIL ("Cannot find module ../src/agent/self-improving-memory")

- [ ] **Step 3: Implement `self-improving-memory.ts` and `reflection-loop.ts`**

Store execution traces in SQLite with vectorized embeddings or lexical BM25 matching, and run an automated post-task reflection pass that distills developer preferences into durable memory cards.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test kilocode/packages/core/test/self-improving-memory.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add kilocode/packages/core/src/agent/self-improving-memory.ts kilocode/packages/core/src/agent/reflection-loop.ts kilocode/packages/core/test/self-improving-memory.test.ts
git commit -m "feat(core): add self-improving agent memory and reflection loop"
```

---

### Task 5: Multimodal Video & Media Studio Integration (Open-Generative-AI, MIT)

**Files:**
- Create: `kilocode/packages/core/src/media/generative-studio.ts`
- Test: `kilocode/packages/core/test/generative-studio.test.ts`

**Interfaces:**
- Consumes: Multimodal prompt parameters (model, prompt, resolution, duration)
- Produces: `dispatchMediaGeneration(request: MediaGenerationRequest): Promise<MediaJob>`

- [ ] **Step 1: Write the failing test for generative studio integration**

```typescript
// kilocode/packages/core/test/generative-studio.test.ts
import { describe, it, expect } from "bun:test"
import { GenerativeStudio } from "../src/media/generative-studio"

describe("Generative Media Studio (Open-Generative-AI inspired)", () => {
  it("should configure studio job with video generation providers", () => {
    const studio = new GenerativeStudio()
    const job = studio.createJob({
      type: "video",
      prompt: "Cinematic camera orbiting futuristic code IDE",
      aspectRatio: "16:9",
      provider: "mock-local"
    })
    expect(job.id).toBeDefined()
    expect(job.status).toBe("queued")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test kilocode/packages/core/test/generative-studio.test.ts`
Expected: FAIL ("Cannot find module ../src/media/generative-studio")

- [ ] **Step 3: Implement `generative-studio.ts`**

Expose client and agent tools for queueing image/video jobs, supporting pluggable backends (local ComfyUI, Fal, Replicate, or self-hosted Open-Generative-AI instances).

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test kilocode/packages/core/test/generative-studio.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add kilocode/packages/core/src/media/generative-studio.ts kilocode/packages/core/test/generative-studio.test.ts
git commit -m "feat(core): add multimodal generative media studio dispatcher"
```

---

### Task 6: Full Verification, Monorepo Build & Extension Checks

**Files:**
- Modify: `kilocode/package.json`
- Modify: `kilocode/README.md`
- Test: Integration build tests

- [ ] **Step 1: Run comprehensive tests across modified packages**
Run: `bun test` inside `kilocode/packages/llm`, `kilocode/packages/core`, and `kilocode/packages/kilo-indexing`.
- [ ] **Step 2: Verify monorepo typecheck**
Run: `bun run typecheck` across the workspace.
- [ ] **Step 3: Final Integration Commit & Documentation**
Ensure README highlights the commercial-safe architecture and model deployment guides.
