export type MediaType = "video" | "image" | "audio"

export type MediaJobStatus = "queued" | "processing" | "completed" | "failed"

export interface MediaGenerationRequest {
  readonly type: MediaType
  readonly prompt: string
  readonly aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3"
  readonly durationSeconds?: number
  readonly provider?: string
  readonly model?: string
}

export interface MediaJob {
  readonly id: string
  readonly request: MediaGenerationRequest
  status: MediaJobStatus
  outputUrl?: string
  error?: string
  readonly createdAt: number
}

export class GenerativeStudio {
  private readonly jobs = new Map<string, MediaJob>()
  private counter = 0

  createJob(request: MediaGenerationRequest): MediaJob {
    this.counter++
    const id = `media-job-${Date.now()}-${this.counter}`
    const job: MediaJob = {
      id,
      request,
      status: "queued",
      createdAt: Date.now(),
    }
    this.jobs.set(id, job)
    return job
  }

  getJob(id: string): MediaJob | undefined {
    return this.jobs.get(id)
  }

  listJobs(): MediaJob[] {
    return Array.from(this.jobs.values())
  }

  async executeJob(id: string): Promise<MediaJob> {
    const job = this.jobs.get(id)
    if (!job) {
      throw new Error(`Media job "${id}" not found`)
    }

    job.status = "processing"

    // Simulate / dispatch to generative backend (Open-Generative-AI / ComfyUI / local model)
    const ext = job.request.type === "video" ? "mp4" : job.request.type === "image" ? "png" : "mp3"
    job.outputUrl = `assets/generated/${job.request.type}/${id}.${ext}`
    job.status = "completed"

    return job
  }
}

