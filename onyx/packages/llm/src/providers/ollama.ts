import { ProviderID } from "../schema"
import { configure, type FamilyModelOptions, ollama as baseOllama } from "./openai-compatible"

export const id = ProviderID.make("ollama")

export interface OllamaOptions extends FamilyModelOptions {
  readonly host?: string
  readonly port?: number
}

export const ollamaProvider = (options: OllamaOptions = {}) => {
  const host = options.host ?? "127.0.0.1"
  const port = options.port ?? 11434
  const defaultBaseURL = `http://${host}:${port}/v1`
  const baseURL = options.baseURL ?? defaultBaseURL

  return {
    ...baseOllama.configure({
      ...options,
      baseURL,
    }),
    baseUrl: baseURL,
  }
}

export const ollama = baseOllama
export default ollamaProvider
