import { createSignal, For } from "solid-js"

export interface StudioTemplate {
  readonly id: string
  readonly name: string
  readonly category: string
  readonly description: string
  readonly primaryColor: string
}

export const STUDIO_TEMPLATES: readonly StudioTemplate[] = [
  {
    id: "apex-saas",
    name: "Apex SaaS",
    category: "SaaS Landing",
    description: "Dark glassmorphic SaaS landing with kinetic typography & bento cards.",
    primaryColor: "hsl(262, 83%, 58%)",
  },
  {
    id: "bloom-ai",
    name: "Bloom AI Platform",
    category: "AI Agents",
    description: "Streaming prompt terminal hero, multi-agent orchestrator layout.",
    primaryColor: "hsl(263, 70%, 50%)",
  },
  {
    id: "akor-security",
    name: "AKOR Security Cloud",
    category: "Cyber Defense",
    description: "Enterprise zero-trust telemetry, animated network radar node graph.",
    primaryColor: "hsl(142, 71%, 45%)",
  },
  {
    id: "ai-designer-portfolio",
    name: "AI Designer Portfolio",
    category: "Creative Portfolio",
    description: "Editorial horizontal snap gallery with custom case study cards.",
    primaryColor: "hsl(187, 90%, 55%)",
  },
  {
    id: "aethera-studio",
    name: "Aethera Creative Studio",
    category: "Media Studio",
    description: "Cinematic full-bleed video hero with liquid glass interactive buttons.",
    primaryColor: "hsl(36, 100%, 50%)",
  },
]

export interface MotionSitesStudioProps {
  readonly onGeneratePrompt?: (templateId: string, promptText: string) => void
}

export function MotionSitesStudioPanel(props: MotionSitesStudioProps) {
  const [selectedTemplate, setSelectedTemplate] = createSignal<StudioTemplate>(STUDIO_TEMPLATES[0])
  const [productName, setProductName] = createSignal("Vibe Code")
  const [generatedPrompt, setGeneratedPrompt] = createSignal("")

  const handleGenerate = () => {
    const t = selectedTemplate()
    const compiled = `Build a cinematic landing page for "${productName()}" using MotionSites aesthetic rules. Template: ${t.name} (${t.category}). Stack: React 19 + Tailwind CSS v4 + TypeScript. Apply .liquid-glass utility and HSL theme tokens.`
    setGeneratedPrompt(compiled)
    props.onGeneratePrompt?.(t.id, compiled)
  }

  return (
    <div class="vibe-motionsites-studio flex flex-col gap-4 p-4 bg-zinc-950/90 rounded-xl border border-zinc-800 text-zinc-100">
      <div class="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div>
          <h3 class="text-sm font-semibold tracking-wide text-zinc-200">MotionSites Web Studio</h3>
          <p class="text-xs text-zinc-400">Generate award-winning, cinematic landing pages and web components (MIT)</p>
        </div>
        <span class="text-xs font-mono bg-purple-950/60 text-purple-300 border border-purple-800/40 px-2 py-0.5 rounded">
          67+ Prompts Loaded
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Template Picker */}
        <div class="flex flex-col gap-2">
          <label class="text-xs font-medium text-zinc-300">Curated Design Templates</label>
          <div class="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
            <For each={STUDIO_TEMPLATES}>
              {(t) => {
                const isSelected = () => selectedTemplate().id === t.id
                return (
                  <div
                    onClick={() => setSelectedTemplate(t)}
                    class={`cursor-pointer p-2.5 rounded-lg border text-left transition-colors ${
                      isSelected()
                        ? "bg-zinc-900 border-purple-500/80 ring-1 ring-purple-500/40"
                        : "bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900"
                    }`}
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-semibold text-zinc-100">{t.name}</span>
                      <span
                        class="w-2.5 h-2.5 rounded-full"
                        style={{ "background-color": t.primaryColor }}
                      />
                    </div>
                    <p class="text-[11px] text-zinc-400 mt-1 line-clamp-1">{t.description}</p>
                  </div>
                )
              }}
            </For>
          </div>
        </div>

        {/* Configuration and Live Generation */}
        <div class="flex flex-col gap-3">
          <div>
            <label class="text-xs font-medium text-zinc-300">Product / Component Name</label>
            <input
              type="text"
              value={productName()}
              onInput={(e) => setProductName(e.currentTarget.value)}
              class="w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
              placeholder="e.g. NextGen FinTech"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-2 rounded-lg text-xs transition-all shadow-md shadow-purple-900/30 active:scale-[0.98]"
          >
            ✨ Compile MotionSites Design Prompt
          </button>

          {generatedPrompt() && (
            <div class="mt-1 bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5 text-[11px] font-mono text-zinc-300 overflow-x-auto">
              <span class="text-zinc-500 select-none">// Compiled Prompt ready for agent:</span>
              <p class="mt-1">{generatedPrompt()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
