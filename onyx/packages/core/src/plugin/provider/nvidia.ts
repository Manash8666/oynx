import { Effect } from "effect"
import { define } from "../internal"
import { ProviderV2 } from "../../provider" // onyx_change

export const NvidiaPlugin = define({
  id: "nvidia",
  effect: Effect.fn(function* (ctx) {
    yield* ctx.catalog.transform(
      Effect.fn(function* (evt) {
        for (const item of evt.provider.list()) {
          if (item.provider.api.type !== "aisdk") continue
          if (item.provider.api.package !== "@ai-sdk/openai-compatible") continue
          if (item.provider.api.url !== "https://integrate.api.nvidia.com/v1") continue
          if (item.provider.id !== ProviderV2.ID.make("nvidia")) continue // onyx_change
          evt.provider.update(item.provider.id, (provider) => {
            provider.request.headers["HTTP-Referer"] = "https://oynx.si/" // onyx_change
            // onyx_change start
            provider.request.headers["X-Title"] = "Onyx"
            provider.request.headers["X-BILLING-INVOKE-ORIGIN"] ??= "KiloCode"
            // onyx_change end
          })
        }
      }),
    )
  }),
})
