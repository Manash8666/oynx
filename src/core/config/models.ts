import { ColibriProcessManager } from '../inference/process-manager.js';
import type { ModelRouteResolution } from '../inference/types.js';

export interface ModelProviderConfig {
  id: string;
  name: string;
  endpoint: string;
  apiKeyEnvVar: string;
  contextWindow: number;
}

export const CLOUD_FALLBACK_MODELS: Record<string, ModelProviderConfig> = {
  'deepseek-r1': {
    id: 'deepseek-reasoner',
    name: 'DeepSeek-R1 (671B MoE CoT)',
    endpoint: 'https://api.deepseek.com/v1',
    apiKeyEnvVar: 'DEEPSEEK_API_KEY',
    contextWindow: 128000,
  },
  'qwen-coder-32b': {
    id: 'qwen-2.5-coder-32b-instruct',
    name: 'Qwen 2.5 Coder 32B Frontier',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKeyEnvVar: 'DASHSCOPE_API_KEY',
    contextWindow: 131072,
  },
  'claude-sonnet-3-7': {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude 3.7 Sonnet Extended Thinking',
    endpoint: 'https://api.anthropic.com/v1',
    apiKeyEnvVar: 'ANTHROPIC_API_KEY',
    contextWindow: 200000,
  },
};

let processManagerInstance: ColibriProcessManager | null = null;

export function getColibriProcessManager(): ColibriProcessManager {
  if (!processManagerInstance) {
    processManagerInstance = new ColibriProcessManager({ port: 8080 });
  }
  return processManagerInstance;
}

/**
 * Resolves whether to route to local Colibri MoE daemon or fallback to cloud provider
 */
export async function resolveModelProvider(
  taskType = 'code_generation',
  options: { forceLocal?: boolean; preferredModel?: string } = {}
): Promise<ModelRouteResolution> {
  const manager = getColibriProcessManager();

  // 1. If forced local, start daemon if not running
  if (options.forceLocal) {
    const health = await manager.healthCheck();
    if (!health.healthy) {
      await manager.start();
    }
    return {
      provider: 'colibri-local',
      modelId: 'colibri-moe-local',
      endpointUrl: `http://127.0.0.1:${manager.getPort()}/v1`,
      isLocal: true,
      reason: 'User explicitly forced local inference via configuration',
    };
  }

  // 2. Probe local Colibri daemon health
  const health = await manager.healthCheck();

  if (health.healthy) {
    return {
      provider: 'colibri-local',
      modelId: health.loadedModel || 'colibri-moe-local',
      endpointUrl: `http://127.0.0.1:${manager.getPort()}/v1`,
      isLocal: true,
      reason: 'Local Colibri MoE daemon is operational with active NVMe cache',
    };
  }

  // 3. Fall back gracefully to configured cloud provider
  const fallbackKey = options.preferredModel || (taskType === 'reasoning' ? 'deepseek-r1' : 'qwen-coder-32b');
  const fallbackConfig = CLOUD_FALLBACK_MODELS[fallbackKey] || CLOUD_FALLBACK_MODELS['qwen-coder-32b'];

  return {
    provider: 'cloud-fallback',
    modelId: fallbackConfig.id,
    endpointUrl: fallbackConfig.endpoint,
    apiKey: process.env[fallbackConfig.apiKeyEnvVar],
    isLocal: false,
    reason: `Local Colibri daemon unavailable (${health.error || 'unreachable'}). Falling back to ${fallbackConfig.name}.`,
  };
}
