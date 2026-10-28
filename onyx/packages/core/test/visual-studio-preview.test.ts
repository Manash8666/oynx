import { describe, expect, test } from "bun:test"
import { VisualStudioPreviewRenderer } from "../src/skills/visual-studio-preview"

describe("MotionSites Live Visual Studio & Sandbox Preview (Upgrade 3)", () => {
  const renderer = new VisualStudioPreviewRenderer()

  test("should package raw HTML into a secure responsive preview document with Tailwind and CSP", () => {
    const rawComponent = `<div class="p-6 bg-slate-800 rounded-xl"><h1 class="text-xl font-bold">Onyx Card</h1></div>`
    const frame = renderer.renderComponentToSandbox(rawComponent, {
      viewport: "desktop",
      theme: "dark",
    })

    expect(frame.htmlDocument).toContain("<!DOCTYPE html>")
    expect(frame.htmlDocument).toContain("Onyx Card")
    expect(frame.htmlDocument).toContain("cdn.tailwindcss.com")
    expect(frame.viewportWidth).toBe(1440)
    expect(frame.theme).toBe("dark")
  })

  test("should adapt frame dimensions according to mobile and tablet viewport settings", () => {
    const mobileFrame = renderer.renderComponentToSandbox("<button>Click</button>", {
      viewport: "mobile",
    })
    expect(mobileFrame.viewportWidth).toBe(375)
    expect(mobileFrame.viewportHeight).toBe(812)

    const tabletFrame = renderer.renderComponentToSandbox("<button>Click</button>", {
      viewport: "tablet",
    })
    expect(tabletFrame.viewportWidth).toBe(768)
    expect(tabletFrame.viewportHeight).toBe(1024)
  })
})
