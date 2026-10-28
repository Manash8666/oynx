import { createSignal, For } from "solid-js"

export interface ModelOption {
  readonly id: string
  readonly name: string
  readonly provider: "ollama" | "deepseek" | "dashscope" | "moonshot" | "zhipu" | "nvidia"
  readonly type: "local" | "cloud"
  readonly contextWindow: string
  readonly license: string
  readonly isReasoning?: boolean
}

export const DEFAULT_VIBE_MODELS: readonly ModelOption[] = [
  {
    id: "qwen3-coder",
    name: "Qwen3 Coder (Next-Gen)",
    provider: "ollama",
    type: "local",
    contextWindow: "131k",
    license: "Apache-2.0",
  },
  {
    id: "deepseek-coder",
    name: "DeepSeek Coder V2.5",
    provider: "ollama",
    type: "local",
    contextWindow: "131k",
    license: "MIT",
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1 (Reasoning)",
    provider: "deepseek",
    type: "cloud",
    contextWindow: "64k",
    license: "MIT",
    isReasoning: true,
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3 (MoE)",
    provider: "deepseek",
    type: "cloud",
    contextWindow: "64k",
    license: "DeepSeek Terms",
  },
  {
    id: "gemma-27b",
    name: "Google Gemma 2 27B",
    provider: "ollama",
    type: "local",
    contextWindow: "8k",
    license: "Gemma Terms",
  },
  {
    id: "kimi-k3",
    name: "Moonshot Kimi K3",
    provider: "moonshot",
    type: "cloud",
    contextWindow: "200k",
    license: "Kimi License",
    isReasoning: true,
  },
  {
    id: "glm-5",
    name: "Zhipu GLM-5 Agentic",
    provider: "zhipu",
    type: "cloud",
    contextWindow: "131k",
    license: "Apache-2.0",
    isReasoning: true,
  },
  {
    id: "nemotron-70b",
    name: "NVIDIA Nemotron 70B",
    provider: "nvidia",
    type: "cloud",
    contextWindow: "131k",
    license: "Apache-2.0",
  },
  {
    id: "gpt-oss-120b",
    name: "OpenAI gpt-oss 120B",
    provider: "ollama",
    type: "local",
    contextWindow: "131k",
    license: "Apache-2.0",
  },
]

export interface ModelSelectorProps {
  readonly selectedModelId?: string
  readonly onSelectModel?: (model: ModelOption) => void
}

export function ModelSelectorPanel(props: ModelSelectorProps) {
  const [selectedId, setSelectedId] = createSignal(props.selectedModelId ?? "qwen3-coder")
  const [filter, setFilter] = createSignal<"all" | "local" | "cloud">("all")

  const filteredModels = () =>
    DEFAULT_VIBE_MODELS.filter((m) => filter() === "all" || m.type === filter())

  const handleSelect = (model: ModelOption) => {
    setSelectedId(model.id)
    props.onSelectModel?.(model)
  }

  return (
    <div class="vibe-model-selector flex flex-col gap-3 p-4 bg-zinc-950/90 rounded-xl border border-zinc-800 text-zinc-100">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold tracking-wide text-zinc-200">AI Foundation Model</h3>
          <p class="text-xs text-zinc-400">Choose between local Ollama zero-latency models or cloud frontier engines</p>
        </div>
        <div class="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800 text-xs">
          <button
            type="button"
            class={`px-2.5 py-1 rounded-md transition-colors ${filter() === "all" ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:text-zinc-200"}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            type="button"
            class={`px-2.5 py-1 rounded-md transition-colors ${filter() === "local" ? "bg-emerald-950 text-emerald-300 font-medium border border-emerald-800/40" : "text-zinc-400 hover:text-zinc-200"}`}
            onClick={() => setFilter("local")}
          >
            ⚡ Local (Ollama)
          </button>
          <button
            type="button"
            class={`px-2.5 py-1 rounded-md transition-colors ${filter() === "cloud" ? "bg-indigo-950 text-indigo-300 font-medium border border-indigo-800/40" : "text-zinc-400 hover:text-zinc-200"}`}
            onClick={() => setFilter("cloud")}
          >
            ☁️ Cloud Frontier
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
        <For each={filteredModels()}>
          {(model) => {
            const isSelected = () => selectedId() === model.id
            return (
              <div
                onClick={() => handleSelect(model)}
                class={`group relative cursor-pointer rounded-lg p-3 border transition-all text-left ${
                  isSelected()
                    ? "bg-zinc-900 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50"
                    : "bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700"
                }`}
              >
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-sm font-medium text-zinc-100 group-hover:text-white truncate">
                    {model.name}
                  </span>
                  <span
                    class={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
                      model.type === "local"
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40"
                        : "bg-indigo-950/80 text-indigo-400 border border-indigo-800/40"
                    }`}
                  >
                    {model.type}
                  </span>
                </div>

                <div class="flex items-center gap-2 text-xs text-zinc-400">
                  <span>Context: {model.contextWindow}</span>
                  <span>•</span>
                  <span>{model.license}</span>
                  {model.isReasoning && (
                    <span class="text-amber-400 text-[10px] bg-amber-950/50 px-1 rounded border border-amber-800/30">
                      Reasoning
                    </span>
                  )}
                </div>
              </div>
            )
          }}
        </For>
      </div>
    </div>
  )
}
