export * as ConfigAgent from "./agent"

import path from "path"
import * as Log from "@opencode-ai/core/util/log"
import { Exit, Schema } from "effect"
import { Glob } from "@opencode-ai/core/util/glob"
import { ConfigAgentV1 } from "@opencode-ai/core/v1/config/agent"
import { configEntryNameFromPath } from "./entry-name"
import * as ConfigMarkdown from "./markdown"
import { ConfigParse } from "./parse"
import { ConfigVariable } from "./variable" // onyx_change
// onyx_change start
import { ConfigErrorV1 as ConfigError, FrontmatterError } from "@opencode-ai/core/v1/config/error"
import { KilocodeConfig } from "@/kilocode/config/config"
import { report } from "@/kilocode/config/report"
import type { Warning } from "./config"
// onyx_change end

const log = Log.create({ service: "config" })

// onyx_change start - trusted gates {env:}; fileScope confines untrusted agent prompt {file:} reads
export async function load(
  dir: string,
  warnings?: Warning[],
  trusted = false,
  fileScope?: ConfigVariable.FileScope,
  sourceScope?: ConfigVariable.FileScope | readonly ConfigVariable.FileScope[],
) {
  // onyx_change end
  const result: Record<string, ConfigAgentV1.Info> = {}
  for (const item of await Glob.scan("{agent,agents}/**/*.md", {
    cwd: dir,
    absolute: true,
    dot: true,
    symlink: true,
  })) {
    // onyx_change start
    const md = await ConfigMarkdown.parse(item, { trusted, fileScope, sourceScope }).catch(async (err) => {
      // onyx_change end
      const message = FrontmatterError.isInstance(err)
        ? err.data.message
        : `Failed to parse agent ${item}`
      // onyx_change start
      if (warnings) warnings.push({ path: item, message })
      try {
        const { capture } = await import("@/kilocode/instance")
        const ctx = capture()
        if (ctx) await report(ctx, message)
      } catch (error) {
        log.warn("could not publish session error", { message, err: error })
      }
      // onyx_change end
      log.error("failed to load agent", { agent: item, err })
      return undefined
    })
    if (!md) continue

    const name = configEntryNameFromPath(path.relative(dir, item), ["agent/", "agents/"])

    // onyx_change start - substitute agent prompt variables relative to the agent file. Project agents are
    // untrusted (no {env:}, {file:} confined to fileScope.root); a rejected substitution must skip only this
    // agent with a warning, not fail the whole config load, mirroring the frontmatter-parse handling above.
    const prompt = await ConfigVariable.substitute({
      text: md.content.trim(),
      type: "virtual",
      dir: path.dirname(item),
      source: item,
      missing: "empty",
      escapeJson: false,
      trusted,
      fileScope,
      markdown: true,
    }).catch((err): string | undefined => {
      const message =
        (ConfigError.InvalidError.isInstance(err) ? err.data.message : undefined) ??
        `Failed to substitute variables in agent ${item}`
      if (warnings) warnings.push({ path: item, message })
      log.error("failed to substitute agent prompt", { agent: item, err })
      return undefined
    })
    if (prompt === undefined) continue
    const config = {
      name,
      ...md.data,
      prompt,
    }
    // onyx_change end
    // onyx_change start - use Effect schema (propertyOrder: original) + non-fatal handleInvalid
    try {
      result[config.name] = ConfigParse.schema(ConfigAgentV1.Info, config, item)
    } catch (err) {
      if (ConfigError.InvalidError.isInstance(err)) {
        await KilocodeConfig.handleInvalid("agent", item, err.data.issues ?? [], err, warnings)
        continue
      }
      throw err
    }
    // onyx_change end
  }
  return result
}

// onyx_change start
export async function loadMode(
  dir: string,
  warnings?: Warning[],
  trusted = false,
  fileScope?: ConfigVariable.FileScope,
  sourceScope?: ConfigVariable.FileScope,
) {
  // onyx_change end
  const result: Record<string, ConfigAgentV1.Info> = {}
  for (const item of await Glob.scan("{mode,modes}/*.md", {
    cwd: dir,
    absolute: true,
    dot: true,
    symlink: true,
  })) {
    // onyx_change start
    const md = await ConfigMarkdown.parse(item, { trusted, fileScope, sourceScope }).catch(async (err) => {
      // onyx_change end
      const message = FrontmatterError.isInstance(err)
        ? err.data.message
        : `Failed to parse mode ${item}`
      // onyx_change start
      if (warnings) warnings.push({ path: item, message })
      try {
        const { capture } = await import("@/kilocode/instance")
        const ctx = capture()
        if (ctx) await report(ctx, message)
      } catch (error) {
        log.warn("could not publish session error", { message, err: error })
      }
      // onyx_change end
      log.error("failed to load mode", { mode: item, err })
      return undefined
    })
    if (!md) continue

    const config = {
      name: configEntryNameFromPath(path.relative(dir, item), ["mode/", "modes/"]),
      ...md.data,
      prompt: md.content.trim(),
    }
    // onyx_change start - use Effect schema (propertyOrder: original) + non-fatal handleInvalid
    try {
      result[config.name] = {
        ...ConfigParse.schema(ConfigAgentV1.Info, config, item),
        mode: "primary" as const,
      }
    } catch (err) {
      if (ConfigError.InvalidError.isInstance(err)) {
        await KilocodeConfig.handleInvalid("agent", item, err.data.issues ?? [], err, warnings)
        continue
      }
      throw err
    }
    // onyx_change end
  }
  return result
}
