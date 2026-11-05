import { ColibriProcessManager } from '../src/core/inference/process-manager.js';
import { ColibriClient } from '../src/core/inference/colibri-client.js';
import { resolveModelProvider } from '../src/core/config/models.js';

async function main() {
  console.log('--- Testing Colibri Local MoE Integration ---');

  const manager = new ColibriProcessManager({ port: 8080 });
  const platformArch = manager.detectPlatform();
  console.log(`✓ Detected Host Platform Architecture: ${platformArch}`);

  try {
    // 1. Start daemon / mock daemon
    console.log('Starting Colibri inference daemon...');
    const health = await manager.start();
    if (!health.healthy) {
      throw new Error(`Failed to initialize Colibri daemon: ${health.error}`);
    }
    console.log(`✓ Daemon Healthy on port ${manager.getPort()} (PID: ${health.pid}, Model: ${health.loadedModel})`);

    // 2. Test Stream Delivery
    console.log('Testing streaming token delivery via ReadableStream...');
    const client = new ColibriClient({ port: manager.getPort() });

    const stream = await client.streamChat({
      model: 'colibri-moe-local',
      messages: [{ role: 'user', content: 'Generate compiler guard instance' }],
      stream: true,
    });

    const reader = stream.getReader();
    let tokenCount = 0;
    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      tokenCount++;
      const tok = value.choices[0]?.delta?.content || '';
      accumulatedText += tok;
    }

    console.log(`✓ Stream completed successfully: ${tokenCount} chunks received.`);
    console.log(`✓ Emitted Token Stream Content: "${accumulatedText}"`);

    if (tokenCount === 0 || !accumulatedText.includes('LspCompilerGuard')) {
      throw new Error('Stream token verification failed: expected LspCompilerGuard tokens.');
    }

    // 3. Test System One Decision Head
    console.log('Testing System One Decision Head logprob distribution...');
    const decision = await client.decideSystemOne('AST syntax error on line 42', [
      'ACTION_AST_VERIFY',
      'ACTION_CODE_GEN',
      'ACTION_TERMINAL_RUN',
    ]);

    console.log(`✓ System One Top Action Selected: ${decision.topAction} (${decision.inferenceLatencyMs}ms)`);
    console.log(`✓ Logprob Distribution:`, decision.distribution.map((d) => `${d.action}: ${d.normalizedProb * 100}%`).join(', '));

    if (decision.topAction !== 'ACTION_AST_VERIFY') {
      throw new Error(`Unexpected top action from decision head: ${decision.topAction}`);
    }

    // 4. Test Model Route Fallback
    console.log('Testing Model Route Fallback logic...');
    const localResolution = await resolveModelProvider('code_generation', { forceLocal: true });
    console.log(`✓ Local Route: ${localResolution.provider} -> ${localResolution.endpointUrl}`);

    console.log('All Colibri MoE connection tests passed with exit code 0.');
  } finally {
    await manager.stop();
    console.log('✓ Teardown: Colibri daemon terminated safely.');
  }
}

main().catch((err) => {
  console.error('Colibri connection test failed:', err);
  process.exit(1);
});
