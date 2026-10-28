export interface OpenModelMetadata {
  readonly id: string
  readonly name: string
  readonly provider: string
  readonly license: "apache-2.0" | "mit" | "gemma-terms" | "deepseek-license" | "kimi-k3-license"
  readonly recommendedContext: number
  readonly supportsReasoning: boolean
  readonly supportsVision?: boolean
  readonly supportsCode: boolean
  readonly defaultEndpoint: "local-ollama" | "cloud-api"
  readonly commercialStatus: "permissive" | "conditional"
}

export const OPEN_MODELS: readonly OpenModelMetadata[] = [
  {
    id: "qwen3",
    name: "Qwen3 Foundation",
    provider: "dashscope",
    license: "apache-2.0",
    recommendedContext: 131072,
    supportsReasoning: true,
    supportsCode: true,
    defaultEndpoint: "cloud-api",
    commercialStatus: "permissive",
  },
  {
    id: "qwen3-vl",
    name: "Qwen3 Vision Language",
    provider: "dashscope",
    license: "apache-2.0",
    recommendedContext: 131072,
    supportsReasoning: true,
    supportsVision: true,
    supportsCode: true,
    defaultEndpoint: "cloud-api",
    commercialStatus: "permissive",
  },
  {
    id: "qwen3-coder",
    name: "Qwen3 Coder (Next-Gen)",
    provider: "ollama",
    license: "apache-2.0",
    recommendedContext: 131072,
    supportsReasoning: true,
    supportsCode: true,
    defaultEndpoint: "local-ollama",
    commercialStatus: "permissive",
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek-V3 MoE",
    provider: "deepseek",
    license: "deepseek-license",
    recommendedContext: 65536,
    supportsReasoning: true,
    supportsCode: true,
    defaultEndpoint: "cloud-api",
    commercialStatus: "conditional",
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek-R1 Reasoning",
    provider: "deepseek",
    license: "mit",
    recommendedContext: 65536,
    supportsReasoning: true,
    supportsCode: true,
    defaultEndpoint: "cloud-api",
    commercialStatus: "permissive",
  },
  {
    id: "deepseek-coder",
    name: "DeepSeek Coder V2.5",
    provider: "ollama",
    license: "mit",
    recommendedContext: 131072,
    supportsReasoning: false,
    supportsCode: true,
    defaultEndpoint: "local-ollama",
    commercialStatus: "permissive",
  },
  {
    id: "deepseek-ocr-2",
    name: "DeepSeek OCR 2",
    provider: "deepseek",
    license: "apache-2.0",
    recommendedContext: 32768,
    supportsReasoning: false,
    supportsVision: true,
    supportsCode: false,
    defaultEndpoint: "cloud-api",
    commercialStatus: "permissive",
  },
  {
    id: "gemma-27b",
    name: "Google Gemma 2 27B",
    provider: "ollama",
    license: "gemma-terms",
    recommendedContext: 8192,
    supportsReasoning: false,
    supportsCode: true,
    defaultEndpoint: "local-ollama",
    commercialStatus: "conditional",
  },
  {
    id: "glm-5",
    name: "GLM-5 Agentic Engineering",
    provider: "zhipu",
    license: "apache-2.0",
    recommendedContext: 131072,
    supportsReasoning: true,
    supportsCode: true,
    defaultEndpoint: "cloud-api",
    commercialStatus: "permissive",
  },
  {
    id: "kimi-k3",
    name: "Moonshot Kimi K3",
    provider: "moonshot",
    license: "kimi-k3-license",
    recommendedContext: 200000,
    supportsReasoning: true,
    supportsCode: true,
    defaultEndpoint: "cloud-api",
    commercialStatus: "conditional",
  },
  {
    id: "nemotron",
    name: "NVIDIA Nemotron 70B",
    provider: "nvidia",
    license: "apache-2.0",
    recommendedContext: 131072,
    supportsReasoning: true,
    supportsCode: true,
    defaultEndpoint: "cloud-api",
    commercialStatus: "permissive",
  },
  {
    id: "gpt-oss-120b",
    name: "OpenAI gpt-oss 120B",
    provider: "ollama",
    license: "apache-2.0",
    recommendedContext: 131072,
    supportsReasoning: true,
    supportsCode: true,
    defaultEndpoint: "local-ollama",
    commercialStatus: "permissive",
  },
] as const

export const openModelRegistry = {
  list: () => OPEN_MODELS,
  get: (id: string): OpenModelMetadata | undefined =>
    OPEN_MODELS.find((m) => m.id.toLowerCase() === id.toLowerCase()),
  byProvider: (provider: string) =>
    OPEN_MODELS.filter((m) => m.provider.toLowerCase() === provider.toLowerCase()),
}
