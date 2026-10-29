import { createBuiltinPlugins, type BuiltinTuiPlugin } from "@opencode-ai/tui/builtins"
import type { RuntimeFlags } from "@/effect/runtime-flags"
import { withKiloTuiPlugins } from "@/kilocode/plugins/internal" // onyx_change

export type InternalTuiPlugin = BuiltinTuiPlugin

// onyx_change start
export function internalTuiPlugins(
  flags: Pick<RuntimeFlags.Info, "experimentalEventSystem" | "experimentalSessionSwitcher">,
): InternalTuiPlugin[] {
  return withKiloTuiPlugins(
    createBuiltinPlugins({
      experimentalEventSystem: flags.experimentalEventSystem,
    }),
    flags,
  )
  // onyx_change end
}
