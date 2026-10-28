export interface EditorViewportState {
  readonly activeFilePath: string
  readonly cursorLine: number
  readonly selectedText?: string
  readonly visibleLineRange: [number, number]
}

export interface VoicePairResponse {
  readonly transcriptHeard: string
  readonly spokenResponseText: string
  readonly audioOutputFormat: "pcm_16k" | "wav" | "mp3"
  readonly codeAction?: {
    readonly type: "INLINE_EDIT" | "EXPLAIN_LINE" | "RUN_TEST"
    readonly targetLine: number
    readonly replacementText?: string
  }
  readonly latencyMs: number
}

export class MultimodalVoiceCopilotEngine {
  constructor(
    private readonly asrModel = "qwen3-asr",
    private readonly ttsModel = "qwen3-tts"
  ) {}

  public async processVoiceCommand(
    voiceQuery: string,
    viewport: EditorViewportState
  ): Promise<VoicePairResponse> {
    const start = Date.now()
    const lower = voiceQuery.toLowerCase()

    let spokenResponseText = ""
    let codeAction: VoicePairResponse["codeAction"] = undefined

    if (lower.includes("memory leak") || lower.includes("cleanup")) {
      spokenResponseText = `I found the memory leak at line ${viewport.cursorLine}. You are missing an unmount abort controller; applying the cleanup patch now.`
      codeAction = {
        type: "INLINE_EDIT",
        targetLine: viewport.cursorLine,
        replacementText: "return () => controller.abort();",
      }
    } else if (lower.includes("why is this failing") || lower.includes("explain")) {
      spokenResponseText = `Looking at lines ${viewport.visibleLineRange[0]} through ${viewport.visibleLineRange[1]}: the promise rejection is unhandled because the async callback lacks a try-catch block.`
      codeAction = {
        type: "EXPLAIN_LINE",
        targetLine: viewport.cursorLine,
      }
    } else if (lower.includes("run test") || lower.includes("verify")) {
      spokenResponseText = `Running the unit test suite for ${viewport.activeFilePath}. Stand by.`
      codeAction = {
        type: "RUN_TEST",
        targetLine: viewport.cursorLine,
      }
    } else {
      spokenResponseText = `Understood. Analyzing ${viewport.activeFilePath} around line ${viewport.cursorLine}.`
    }

    return {
      transcriptHeard: voiceQuery,
      spokenResponseText,
      audioOutputFormat: "wav",
      codeAction,
      latencyMs: Date.now() - start,
    }
  }

  public getEngineConfig() {
    return {
      asr: this.asrModel,
      tts: this.ttsModel,
      mode: "duplex_audio_streaming",
      sampleRateHz: 16000,
    }
  }
}
