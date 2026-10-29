import { Reference } from "@opencode-ai/core/reference"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Api } from "../api"
import { response } from "../location"
import { reconcile } from "../kilocode/reference-reconciler" // onyx_change

export const ReferenceHandler = HttpApiBuilder.group(Api, "server.reference", (handlers) =>
  handlers.handle("reference.list", () =>
    response(reconcile(Reference.Service.use((reference) => reference.list()))), // onyx_change
  ),
)
