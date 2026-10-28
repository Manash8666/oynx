import { describe, it, expect } from "bun:test"
import { ollama, ollamaProvider } from "../src/providers/ollama"
import { openModelRegistry } from "../src/providers/open-model-registry"

describe("Ollama Provider & Open Model Registry", () => {
  it("should initialize ollama provider with default localhost endpoint", () => {
    const custom = ollama.configure({ baseURL: "http://127.0.0.1:11434/v1" })
    expect(custom.id).toBe("ollama")

    const model = custom.model("qwen3-coder:latest")
    expect(model.id).toBe("qwen3-coder:latest")
    expect(model.provider).toBe("ollama")
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

  it("should expose all foundation models requested for the commercial IDE", () => {
    const models = openModelRegistry.list()
    const ids = models.map((m) => m.id)

    expect(ids).toContain("qwen3")
    expect(ids).toContain("qwen3-vl")
    expect(ids).toContain("qwen3-coder")
    expect(ids).toContain("deepseek-v3")
    expect(ids).toContain("deepseek-r1")
    expect(ids).toContain("deepseek-coder")
    expect(ids).toContain("gemma-27b")
    expect(ids).toContain("glm-5")
    expect(ids).toContain("kimi-k3")
    expect(ids).toContain("nemotron")
    expect(ids).toContain("gpt-oss-120b")
  })
})
