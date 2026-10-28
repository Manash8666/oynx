import { describe, expect, test } from "bun:test"
import { MultimodalVoiceCopilotEngine } from "../src/media/multimodal-voice-copilot"

describe("Multimodal Real-Time Voice & Screen Copilot (Upgrade 10)", () => {
  const copilot = new MultimodalVoiceCopilotEngine()

  test("should interpret spoken developer query and correlate with active editor viewport", async () => {
    const viewport = {
      activeFilePath: "src/hooks/useFetch.ts",
      cursorLine: 42,
      visibleLineRange: [30, 60] as [number, number],
    }

    const response = await copilot.processVoiceCommand("Onyx, look at line 42, why is there a memory leak?", viewport)

    expect(response.transcriptHeard).toContain("memory leak")
    expect(response.spokenResponseText).toContain("line 42")
    expect(response.spokenResponseText).toContain("cleanup patch")
    expect(response.codeAction?.type).toBe("INLINE_EDIT")
    expect(response.codeAction?.replacementText).toContain("controller.abort")
  })

  test("should expose duplex audio stream configuration for Qwen3-ASR & Qwen3-TTS", () => {
    const config = copilot.getEngineConfig()
    expect(config.asr).toBe("qwen3-asr")
    expect(config.tts).toBe("qwen3-tts")
    expect(config.mode).toBe("duplex_audio_streaming")
  })
})
