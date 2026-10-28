// @ts-nocheck
import { ModelSelectorPanel } from "./model-selector-panel"
import { MotionSitesStudioPanel } from "./motionsites-studio-panel"
import { LegalComplianceCard } from "./legal-compliance-card"
import { GenerativeMediaPanel } from "./generative-media-panel"

export default {
  title: "Vibe/Platform Suite",
  id: "vibe-platform-suite",
  tags: ["autodocs"],
  render: () => {
    return (
      <div class="flex flex-col gap-6 p-6 max-w-4xl mx-auto bg-black text-white min-h-screen">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-white">Vibe Code Platform Studio</h1>
          <p class="text-xs text-zinc-400 mt-1">
            Commercial AI IDE frontend components with local Ollama, MotionSites, and Legal Intelligence.
          </p>
        </div>

        <LegalComplianceCard
          license="MIT / Apache-2.0"
          isCommercialSafe={true}
          recommendation="All workspace modules are 100% permissive (MIT/Apache 2.0). AGPL and unofficial scrapers have been isolated and prohibited."
        />

        <ModelSelectorPanel />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MotionSitesStudioPanel />
          <GenerativeMediaPanel />
        </div>
      </div>
    )
  },
}

export const FullStudioView = {}
