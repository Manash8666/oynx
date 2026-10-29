import type { Hooks } from "@kilocode/plugin"
import * as Log from "@opencode-ai/core/util/log" // onyx_change
import { ModalModels } from "./models"

const log = Log.create({ service: "plugin.modal" }) // onyx_change

export async function ModalPlugin(): Promise<Hooks> {
  return {
    provider: {
      id: "modal",
      async models(provider, ctx) {
        const apiKey = ctx.auth?.type === "api" ? ctx.auth.key : process.env.MODAL_PROXY_TOKEN
        const baseURL = Object.values(provider.models)[0]?.api.url
        if (!apiKey || !baseURL) return provider.models // onyx_change - preserve catalog models without discovery credentials

        // onyx_change start - transient discovery failures must not erase the existing catalog
        return ModalModels.get(baseURL, apiKey, provider.models).catch((err) => {
          log.warn("modal model discovery failed", { err })
          return provider.models
        })
        // onyx_change end
      },
    },
  }
}
