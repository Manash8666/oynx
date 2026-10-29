import path from "path"
import { Effect, Schema } from "effect"
import { InstanceState } from "@/effect/instance-state"
import { FSUtil } from "@opencode-ai/core/fs-util"
import { Ripgrep } from "@opencode-ai/core/ripgrep"
import * as KiloGrep from "@/kilocode/tool/grep-signal-controls" // onyx_change
import { assertExternalDirectoryEffect } from "./external-directory"
import DESCRIPTION from "./grep.txt"
import * as Tool from "./tool"

export const Parameters = Schema.Struct({
  pattern: Schema.String.annotate({ description: "Pattern to search for in file contents (regex by default)" }), // onyx_change
  path: Schema.optional(Schema.String).annotate({
    description: "The directory to search in. Defaults to the current working directory.",
  }),
  include: Schema.optional(Schema.String).annotate({
    description: 'File pattern to include in the search (e.g. "*.js", "*.{ts,tsx}")',
  }),
  ...KiloGrep.fields, // onyx_change
})

export const GrepTool = Tool.define(
  "grep",
  Effect.gen(function* () {
    const fs = yield* FSUtil.Service
    const ripgrep = yield* Ripgrep.Service
    return {
      description: KiloGrep.describe(DESCRIPTION), // onyx_change
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, ctx: Tool.Context) =>
        Effect.gen(function* () {
          const limit = params.limit ?? KiloGrep.DEFAULT_LIMIT // onyx_change
          const context = params.context ?? 0 // onyx_change
          const empty = {
            title: params.pattern,
            metadata: { matches: 0, truncated: false },
            output: "No files found",
          }
          if (!params.pattern) {
            throw new Error("pattern is required")
          }

          yield* ctx.ask({
            permission: "grep",
            patterns: [params.pattern],
            always: ["*"],
            metadata: {
              pattern: params.pattern,
              path: params.path,
              include: params.include,
              ...KiloGrep.metadata(params, limit, context), // onyx_change
            },
          })

          const ins = yield* InstanceState.context
          const requested = path.isAbsolute(params.path ?? ins.directory)
            ? (params.path ?? ins.directory)
            : path.join(ins.directory, params.path ?? ".")
          const requestedInfo = yield* fs.stat(requested).pipe(Effect.catch(() => Effect.succeed(undefined)))
          yield* assertExternalDirectoryEffect(ctx, requested, {
            bypass: false,
            kind: requestedInfo?.type === "Directory" ? "directory" : "file",
          })

          const search = FSUtil.resolve(requested)
          const info = yield* fs.stat(search).pipe(Effect.catch(() => Effect.succeed(undefined)))
          if (!info || (info.type !== "File" && info.type !== "Directory")) return empty // onyx_change
          const cwd = info?.type === "Directory" ? search : path.dirname(search)
          const result = yield* ripgrep.grep({
            cwd,
            file: info?.type === "File" ? path.basename(search) : undefined, // onyx_change - constrain exact-file searches
            pattern: params.pattern,
            include: params.include,
            ...KiloGrep.options(params, limit, context), // onyx_change
            signal: ctx.abort, // onyx_change - stop ripgrep when the tool call is cancelled
          })
          // onyx_change start
          const matches = result.items
          if (matches.length === 0) return empty
          // onyx_change end

          const rows = matches.map((item) => ({
            // onyx_change
            path: path.resolve(
              requestedInfo?.type === "Directory" ? requested : path.dirname(requested),
              item.entry.path,
            ),
            line: item.line,
            text: item.text,
            context: item.context, // onyx_change
            textTruncated: item.textTruncated, // onyx_change
          }))

          const truncated = result.truncated // onyx_change
          const final = rows
          if (final.length === 0) return empty

          const total = rows.filter((row) => !row.context).length // onyx_change
          const hasMore = truncated // onyx_change
          const output = [`Found ${total} matches${hasMore ? " (more matches available)" : ""}`]

          let current = ""
          for (const match of final) {
            if (current !== match.path) {
              if (current !== "") output.push("")
              current = match.path
              output.push(`${match.path}:`)
            }
            output.push(KiloGrep.line(match, context)) // onyx_change
          }

          if (truncated) {
            output.push("")
            output.push(KiloGrep.limitNotice(limit)) // onyx_change
          }
          output.push(...KiloGrep.notices(rows)) // onyx_change
          if (result.partial) output.push("", "(Some paths were inaccessible.)") // onyx_change

          return {
            title: params.pattern,
            metadata: {
              matches: total,
              truncated,
            },
            output: output.join("\n"),
          }
        }).pipe(Effect.orDie),
    }
  }),
)
