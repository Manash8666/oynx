import {
  MOTIONSITE_CATEGORIES,
  MOTIONSITE_TEMPLATES,
  type MotionSiteTemplate,
} from "./motionsites-prompts"
import {
  ONYX_MOTION_TEMPLATES,
  getOnyxMotionTemplate,
  getOnyxMotionTemplatesByCategory,
  type OnyxMotionTemplate,
} from "./motionsites-templates"

export {
  ONYX_MOTION_TEMPLATES,
  getOnyxMotionTemplate,
  getOnyxMotionTemplatesByCategory,
  type OnyxMotionTemplate,
}

export interface MotionSitePromptOptions {
  readonly category: string
  readonly productName: string
  readonly description: string
  readonly templateId?: string
  readonly framework?: "react-tailwind" | "solid-tailwind"
}

export const getMotionSiteCategories = (): readonly string[] => MOTIONSITE_CATEGORIES

export const getMotionSiteTemplates = (): readonly MotionSiteTemplate[] => MOTIONSITE_TEMPLATES

export const getMotionSiteTemplate = (id: string): MotionSiteTemplate | undefined =>
  MOTIONSITE_TEMPLATES.find((t) => t.id.toLowerCase() === id.toLowerCase())

export const generateMotionSitePrompt = (options: MotionSitePromptOptions): string => {
  const motionTemplate = options.templateId ? getOnyxMotionTemplate(options.templateId) : undefined
  const template =
    (!motionTemplate && options.templateId && getMotionSiteTemplate(options.templateId)) ||
    MOTIONSITE_TEMPLATES.find((t) => t.category === options.category) ||
    MOTIONSITE_TEMPLATES[0]

  const framework = options.framework ?? "react-tailwind"
  const frameworkDesc =
    framework === "solid-tailwind"
      ? "SolidJS + Tailwind CSS + TypeScript"
      : "React 19 + Tailwind CSS + TypeScript"

  if (motionTemplate) {
    return `
You are an award-winning creative technologist and design engineer.
Build a modern, cinematic landing page for "${options.productName}" using the "${motionTemplate.name}" template (${motionTemplate.category}).
Description: ${options.description}

### Tech Stack & Architecture:
- Framework: ${frameworkDesc}
- Icons: Lucide Icons
- Styling: Tailwind CSS v4 with custom dark anthracite CSS variables
- Interactive Motion Shader: ${motionTemplate.name} WebGL Canvas Program (${motionTemplate.shaderScriptPath})

### Color System:
--background: ${motionTemplate.colorSystem.background};
--foreground: ${motionTemplate.colorSystem.foreground};
--primary: ${motionTemplate.colorSystem.primary};
--border: ${motionTemplate.colorSystem.border};
--card: ${motionTemplate.colorSystem.card};

### Visual Motion Shader Integration:
Embed the responsive background canvas in the hero section:
\`\`\`html
<section style="position:relative; min-height:100vh; isolation:isolate;">
  <canvas data-bg style="position:absolute; inset:0; width:100%; height:100%; z-index:-1;"></canvas>
  <!-- Main Hero UI and CTAs -->
</section>
<script src="${motionTemplate.shaderScriptPath}"></script>
\`\`\`

### Aesthetic Tags & Design Directives:
${motionTemplate.tags.map((t) => `- ${t}`).join("\n")}

### Implementation Rules:
- Ensure accessible contrast and fluid typography across mobile and desktop.
- Avoid low-effort generic layouts; craft bespoke spacing, kinetic micro-interactions, and visual depth.
- Zero placeholder lorem ipsum; write compelling, product-aligned copy for ${options.productName}.
`.trim()
  }

  return `
You are an award-winning creative technologist and design engineer.
Build a modern, cinematic landing page for "${options.productName}".
Description: ${options.description}

### Tech Stack & Architecture:
- Framework: ${frameworkDesc}
- Icons: Lucide Icons
- Styling: Tailwind CSS v4 with custom HSL CSS variables

### Color System (HSL variables in :root):
--background: ${template.colorSystem.background};
--foreground: ${template.colorSystem.foreground};
--primary: ${template.colorSystem.primary};
--primary-foreground: ${template.colorSystem.primaryForeground};
--secondary: ${template.colorSystem.secondary};
--muted: ${template.colorSystem.muted};
--muted-foreground: ${template.colorSystem.mutedForeground};
--border: ${template.colorSystem.border};
--card: ${template.colorSystem.card};

### Essential Design Utilities:
.liquid-glass {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
}

### Planned Page Structure:
${template.layoutStructure.map((s, idx) => `${idx + 1}. ${s}`).join("\n")}

### Key Aesthetic Effects:
${template.keyEffects.map((e) => `- ${e}`).join("\n")}

### Implementation Rules:
- Ensure accessible contrast and fluid typography across mobile and desktop.
- Avoid low-effort generic layouts; craft bespoke spacing, kinetic micro-interactions, and visual depth.
- Zero placeholder lorem ipsum; write compelling, product-aligned copy for ${options.productName}.
`.trim()
}

