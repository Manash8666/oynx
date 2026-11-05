export type PlatformArch = 'darwin-arm64' | 'linux-x64' | 'win32-x64' | 'unknown';

export interface ColibriDaemonConfig {
  port: number;
  threads: string | number;
  nvmeDir?: string;
  modelPath?: string;
  binaryPath?: string;
  timeoutMs?: number;
}

export interface ColibriHealthStatus {
  healthy: boolean;
  pid?: number;
  uptimeSec?: number;
  loadedModel?: string;
  nvmeAvailableBytes?: number;
  error?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export interface SystemOneActionProb {
  action: string;
  token: string;
  logprob: number;
  normalizedProb: number;
}

export interface SystemOneDecisionResponse {
  topAction: string;
  distribution: SystemOneActionProb[];
  inferenceLatencyMs: number;
}

export interface ModelRouteResolution {
  provider: 'colibri-local' | 'cloud-fallback';
  modelId: string;
  endpointUrl: string;
  apiKey?: string;
  isLocal: boolean;
  reason: string;
}
