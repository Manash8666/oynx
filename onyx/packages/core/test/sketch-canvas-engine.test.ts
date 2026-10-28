import { describe, expect, test } from "bun:test"
import { SketchCanvasEngine } from "../src/skills/sketch-canvas-engine"

describe("Sketch Canvas & Creative Animation Engine (Clean-Room sketch.js)", () => {
  const engine = new SketchCanvasEngine({
    particleCount: 25,
    width: 600,
    height: 400,
  })

  test("should initialize configured number of dynamic physics particles", () => {
    const particles = engine.getParticles()
    expect(particles.length).toBe(25)
    expect(particles[0].x).toBeGreaterThanOrEqual(0)
    expect(particles[0].y).toBeGreaterThanOrEqual(0)
    expect(particles[0].color).toBe("#6366F1")
  })

  test("should advance particle coordinates on simulation step", () => {
    const initialX = engine.getParticles()[0].x
    const initialVx = engine.getParticles()[0].vx

    engine.stepSimulation({ width: 600, height: 400 })

    const updatedX = engine.getParticles()[0].x
    expect(updatedX).toBeCloseTo(initialX + initialVx, 5)
  })

  test("should generate standalone HTML5 Canvas particle animation script for MotionSites", () => {
    const snippet = engine.generateCanvasSnippet("hero-canvas")
    expect(snippet).toContain("<canvas id=\"hero-canvas\"")
    expect(snippet).toContain("requestAnimationFrame(loop)")
    expect(snippet).toContain("rgba(99, 102, 241")
  })
})
