import { createSignal, For } from "solid-js"

export interface MediaJobItem {
  readonly id: string
  readonly type: "video" | "image" | "audio"
  readonly prompt: string
  readonly status: "queued" | "completed"
  readonly url?: string
}

export function GenerativeMediaPanel() {
  const [prompt, setPrompt] = createSignal("")
  const [mediaType, setMediaType] = createSignal<"video" | "image" | "audio">("video")
  const [jobs, setJobs] = createSignal<MediaJobItem[]>([
    {
      id: "demo-video-1",
      type: "video",
      prompt: "Cinematic camera orbiting futuristic code IDE with neon syntax glow",
      status: "completed",
      url: "assets/generated/video/demo-1.mp4",
    },
  ])

  const handleCreate = () => {
    if (!prompt()) return
    const newJob: MediaJobItem = {
      id: `job-${Date.now()}`,
      type: mediaType(),
      prompt: prompt(),
      status: "completed",
      url: `assets/generated/${mediaType()}/preview-${Date.now()}.${mediaType() === "video" ? "mp4" : mediaType() === "image" ? "png" : "mp3"}`,
    }
    setJobs([newJob, ...jobs()])
    setPrompt("")
  }

  return (
    <div class="vibe-media-panel flex flex-col gap-3 p-4 bg-zinc-950/90 rounded-xl border border-zinc-800 text-zinc-100">
      <div class="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <div>
          <h3 class="text-sm font-semibold tracking-wide text-zinc-200">Generative Media Studio</h3>
          <p class="text-xs text-zinc-400">Dispatch AI video walk-throughs, UI backdrops, and audio assets (MIT)</p>
        </div>
        <div class="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800 text-xs">
          <button
            type="button"
            class={`px-2 py-0.5 rounded ${mediaType() === "video" ? "bg-purple-950 text-purple-300 font-medium" : "text-zinc-400"}`}
            onClick={() => setMediaType("video")}
          >
            🎬 Video
          </button>
          <button
            type="button"
            class={`px-2 py-0.5 rounded ${mediaType() === "image" ? "bg-purple-950 text-purple-300 font-medium" : "text-zinc-400"}`}
            onClick={() => setMediaType("image")}
          >
            🖼️ Image
          </button>
          <button
            type="button"
            class={`px-2 py-0.5 rounded ${mediaType() === "audio" ? "bg-purple-950 text-purple-300 font-medium" : "text-zinc-400"}`}
            onClick={() => setMediaType("audio")}
          >
            🎵 Audio
          </button>
        </div>
      </div>

      <div class="flex gap-2">
        <input
          type="text"
          value={prompt()}
          onInput={(e) => setPrompt(e.currentTarget.value)}
          placeholder={`Describe the ${mediaType()} to generate...`}
          class="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
        />
        <button
          type="button"
          onClick={handleCreate}
          class="bg-purple-600 hover:bg-purple-500 text-white font-medium px-4 py-1.5 rounded-lg text-xs transition-colors active:scale-95"
        >
          Generate
        </button>
      </div>

      <div class="flex flex-col gap-2 mt-1 max-h-[180px] overflow-y-auto pr-1">
        <For each={jobs()}>
          {(job) => (
            <div class="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs">
              <div class="flex items-center gap-2 truncate pr-2">
                <span class="text-xs uppercase font-mono px-1 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                  {job.type}
                </span>
                <span class="truncate text-zinc-200">{job.prompt}</span>
              </div>
              <span class="text-[10px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded whitespace-nowrap">
                {job.status}
              </span>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
