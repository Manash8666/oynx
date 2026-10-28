export type ViewportMode = "desktop" | "tablet" | "mobile"

export interface PreviewFrameOptions {
  viewport?: ViewportMode
  theme?: "dark" | "light"
  injectTailwind?: boolean
  injectFont?: boolean
  title?: string
}

export interface RenderedFrame {
  readonly htmlDocument: string
  readonly viewportWidth: number
  readonly viewportHeight: number
  readonly theme: "dark" | "light"
  readonly cspHeader: string
  readonly estimatedRenderBudgetMs: number
}

export class VisualStudioPreviewRenderer {
  public renderComponentToSandbox(
    componentHtml: string,
    options?: PreviewFrameOptions
  ): RenderedFrame {
    const viewport = options?.viewport ?? "desktop"
    const theme = options?.theme ?? "dark"
    const injectTailwind = options?.injectTailwind ?? true

    let width = 1440
    let height = 900
    if (viewport === "tablet") {
      width = 768
      height = 1024
    } else if (viewport === "mobile") {
      width = 375
      height = 812
    }

    const tailwindScript = injectTailwind
      ? `<script src="https://cdn.tailwindcss.com"></script>
         <script>
           tailwind.config = {
             darkMode: 'class',
             theme: {
               extend: {
                 colors: {
                   onyx: { 50: '#f8fafc', 500: '#6366f1', 900: '#0b0f17', 950: '#05070a' }
                 }
               }
             }
           }
         </script>`
      : ""

    const csp = "default-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://fonts.googleapis.com https://fonts.gstatic.com data:;"

    const htmlDocument = `<!DOCTYPE html>
<html lang="en" class="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <title>${options?.title ?? "Onyx Visual Studio Sandbox"}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  ${tailwindScript}
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; padding: 0; }
    code, pre { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="${theme === "dark" ? "bg-[#0b0f17] text-slate-100" : "bg-slate-50 text-slate-900"} antialiased min-h-screen">
  <div id="onyx-preview-root" class="w-full h-full p-4 md:p-8">
    ${componentHtml}
  </div>
</body>
</html>`.trim()

    return {
      htmlDocument,
      viewportWidth: width,
      viewportHeight: height,
      theme,
      cspHeader: csp,
      estimatedRenderBudgetMs: 16, // 60fps target
    }
  }
}
