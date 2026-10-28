import { describe, it, expect } from "bun:test"
import { GenerativeStudio, type MediaGenerationRequest } from "../src/media/generative-studio"

describe("Generative Media Studio (Open-Generative-AI Inspired, MIT)", () => {
  it("should configure studio job with video generation request", () => {
    const studio = new GenerativeStudio()
    const request: MediaGenerationRequest = {
      type: "video",
      prompt: "Cinematic camera orbiting futuristic code IDE with glowing syntax highlights",
      aspectRatio: "16:9",
      durationSeconds: 5,
      provider: "mock-local",
    }

    const job = studio.createJob(request)
    expect(job.id).toBeDefined()
    expect(job.status).toBe("queued")
    expect(job.request.type).toBe("video")
    expect(job.request.aspectRatio).toBe("16:9")
  })

  it("should support image and audio asset generation for IDE UI previews", () => {
    const studio = new GenerativeStudio()
    
    const imageJob = studio.createJob({
      type: "image",
      prompt: "Glassmorphic hero background abstract gradient",
      aspectRatio: "1:1",
      provider: "mock-local",
    })

    const audioJob = studio.createJob({
      type: "audio",
      prompt: "Subtle futuristic terminal completion chime",
      provider: "mock-local",
    })

    expect(imageJob.request.type).toBe("image")
    expect(audioJob.request.type).toBe("audio")
  })

  it("should transition job from queued to completed with simulated or local output", async () => {
    const studio = new GenerativeStudio()
    const job = studio.createJob({
      type: "video",
      prompt: "Preview video for landing page hero",
      aspectRatio: "16:9",
      provider: "mock-local",
    })

    const completed = await studio.executeJob(job.id)
    expect(completed.status).toBe("completed")
    expect(completed.outputUrl).toBeDefined()
    expect(completed.outputUrl).toContain("video")
  })

  it("should list active and historical media jobs", () => {
    const studio = new GenerativeStudio()
    studio.createJob({ type: "image", prompt: "Job 1", provider: "mock-local" })
    studio.createJob({ type: "video", prompt: "Job 2", provider: "mock-local" })

    const jobs = studio.listJobs()
    expect(jobs.length).toBe(2)
  })
})

