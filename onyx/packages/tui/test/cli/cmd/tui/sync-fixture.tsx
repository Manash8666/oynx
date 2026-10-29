/** @jsxImportSource @opentui/solid */
import { testRender } from "@opentui/solid"
import { onMount } from "solid-js"
import { ArgsProvider, type Args } from "../../../../src/context/args" // onyx_change - plumb CLI args for mode-specific sync tests
import { KVProvider, useKV } from "../../../../src/context/kv"
import { ProjectProvider, useProject } from "../../../../src/context/project"
import { SDKProvider } from "../../../../src/context/sdk"
import { SyncProvider, useSync } from "../../../../src/context/sync"
import { ToastProvider } from "../../../../src/ui/toast" // onyx_change
import { ExitProvider } from "../../../../src/context/exit" // onyx_change
import { PermissionProvider } from "../../../../src/context/permission"
import { createEventSource, createFetch, type FetchHandler, directory } from "../../../fixture/tui-sdk"
import { TestTuiContexts } from "../../../fixture/tui-environment"
export { createEventSource, createFetch, directory, eventSource, json, worktree } from "../../../fixture/tui-sdk"

export async function wait(fn: () => boolean, timeout = 2000) {
  const start = Date.now()
  while (!fn()) {
    if (Date.now() - start > timeout) throw new Error("timed out waiting for condition")
    await Bun.sleep(10)
  }
}

type Ctx = { kv: ReturnType<typeof useKV>; project: ReturnType<typeof useProject>; sync: ReturnType<typeof useSync> }

// onyx_change start
// optional TUI args for tests
export async function mount(override?: FetchHandler, state?: string, args?: Args) {
  // onyx_change end
  const calls = createFetch(override)
  const events = createEventSource()
  let sync!: ReturnType<typeof useSync>
  let project!: ReturnType<typeof useProject>
  let kv!: ReturnType<typeof useKV>
  let done!: () => void
  const ready = new Promise<void>((resolve) => {
    done = resolve
  })

  function Probe() {
    const ctx: Ctx = { kv: useKV(), project: useProject(), sync: useSync() }
    onMount(() => {
      sync = ctx.sync
      project = ctx.project
      kv = ctx.kv
      done()
    })
    return <box />
  }

  const app = await testRender(() => (
    <TestTuiContexts paths={state ? { state } : undefined}>
      {/* onyx_change start - optional TUI args for tests */}
      <ArgsProvider {...args}>
        {/* onyx_change end */}
        <KVProvider>
          {/* onyx_change start */}
          <ToastProvider>
            {/* onyx_change end */}
            <SDKProvider url="http://test" directory={directory} fetch={calls.fetch} events={events.source}>
              <PermissionProvider>
                <ProjectProvider>
                  {/* onyx_change start - SyncProvider consumes the exit context */}
                  <ExitProvider exit={() => {}}>
                    <SyncProvider>
                      <Probe />
                    </SyncProvider>
                  </ExitProvider>
                  {/* onyx_change end */}
                </ProjectProvider>
              </PermissionProvider>
            </SDKProvider>
            {/* onyx_change start */}
          </ToastProvider>
          {/* onyx_change end */}
        </KVProvider>
      </ArgsProvider>
    </TestTuiContexts>
  ))

  await ready
  await project.sync() // onyx_change - event routing requires the resolved project
  await wait(() => sync.status === "complete")
  return { app, emit: events.emit, kv, project, sync, session: calls.session }
}
