import { Server } from "@/server/server"
import { InstanceRuntime } from "@/project/instance-runtime"
import { Rpc } from "@/util/rpc"
import { upgrade } from "@/cli/upgrade"
import { Config } from "@/config/config"
import { GlobalBus } from "@/bus/global"
import { ServerAuth } from "@/server/auth"
import { writeHeapSnapshot } from "node:v8"
import { Heap } from "@/cli/heap"
import { AppRuntime } from "@/effect/app-runtime"
import { Effect } from "effect"
import { disposeAllInstancesAndEmitGlobalDisposed } from "@/server/global-lifecycle"
import { KiloLog } from "@/kilocode/log" // onyx_change
import * as Log from "@opencode-ai/core/util/log" // onyx_change
import { ensureProcessMetadata } from "@opencode-ai/core/util/opencode-process" // onyx_change
import { createWorkerRemoteExit } from "@/kilocode/cli/cmd/tui/remote-exit-worker" // onyx_change
import { createWorkerShutdown } from "@/cli/tui/worker-shutdown" // onyx_change
import { KiloSessions } from "@/kilo-sessions/kilo-sessions" // onyx_change
import { KiloRpc } from "@/kilocode/util/rpc" // onyx_change
import { WorkerConsole } from "@/kilocode/cli/cmd/tui/worker-console" // onyx_change

// onyx_change start - queue parent requests before the await below; KiloRpc.listen replays them
KiloRpc.arm()
// onyx_change end

ensureProcessMetadata("worker") // onyx_change - retain worker role and parent run correlation
await KiloLog.init() // onyx_change - keep compatibility logs off the TUI terminal
WorkerConsole.redirect() // onyx_change - and keep console writes from this realm off the TUI frame
Heap.start()

// onyx_change start - startup checkpoints: these separate "worker never started" from
// "worker up but RPC stuck", which is how the release PTY smoke stall was localised
const log = Log.create({ service: "tui-worker" })
log.info("worker booted")
// onyx_change end

// onyx_change start - keep upstream's keep-alive intent but never swallow the error silently
const onUnhandledRejection = (error: unknown) => {
  console.error("worker unhandledRejection", error)
}

const onUncaughtException = (error: Error) => {
  console.error("worker uncaughtException", error)
}
// onyx_change end

process.on("unhandledRejection", onUnhandledRejection)
process.on("uncaughtException", onUncaughtException)

// Subscribe to global events and forward them via RPC
GlobalBus.on("event", (event) => {
  Rpc.emit("global.event", event)
})

let server: Awaited<ReturnType<typeof Server.listen>> | undefined
const remoteExit = createWorkerRemoteExit(Rpc.emit) // onyx_change
// onyx_change start - drain ingest before dispose so GlobalBus/remote stay live
const runShutdown = createWorkerShutdown({
  drain: () => KiloSessions.drainIngestForShutdown(),
  dispose: () => InstanceRuntime.disposeAllInstances(),
  stopServer: async () => {
    if (server) await server.stop(true)
    process.off("unhandledRejection", onUnhandledRejection)
    process.off("uncaughtException", onUncaughtException)
  },
})
// onyx_change end

export const rpc = {
  // onyx_change start - worker lifecycle hooks for remote exit
  tuiReady() {
    remoteExit.ready()
  },
  tuiGone() {
    remoteExit.gone()
  },
  // onyx_change end
  async fetch(input: { url: string; method: string; headers: Record<string, string>; body?: string }) {
    const headers = { ...input.headers }
    const auth = ServerAuth.header()
    if (auth && !headers["authorization"] && !headers["Authorization"]) {
      headers["Authorization"] = auth
    }
    const request = new Request(input.url, {
      method: input.method,
      headers,
      body: input.body,
    })
    const response = await Server.Default().app.fetch(request)
    const body = await response.text()
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body,
    }
  },
  snapshot() {
    const result = writeHeapSnapshot("server.heapsnapshot")
    return result
  },
  async server(input: { port: number; hostname: string; mdns?: boolean; cors?: string[] }) {
    if (server) await server.stop(true)
    server = await Server.listen(input)
    return { url: server.url.toString() }
  },
  async checkUpgrade(input: { directory: string }) {
    await InstanceRuntime.load({ directory: input.directory })
    await upgrade().catch(() => {})
  },
  async reload() {
    await AppRuntime.runPromise(
      Effect.gen(function* () {
        const cfg = yield* Config.Service
        yield* cfg.invalidate()
        yield* disposeAllInstancesAndEmitGlobalDisposed({ swallowErrors: true })
      }),
    )
  },
  async shutdown() {
    remoteExit.shutdown() // onyx_change
    await runShutdown() // onyx_change - drain → dispose → stopServer
    // onyx_change start - Clear the Rpc message channel so the worker's event loop can drain and
    // exit naturally. Without this, the active onmessage handle keeps the
    // worker alive even after all async work is done.
    onmessage = null
    // onyx_change end
  },
}

// onyx_change start - KiloRpc.listen replays queued requests and announces readiness
KiloRpc.listen(rpc)
log.info("worker listening") // checkpoint, see the note above KiloRpc.arm
// onyx_change end
