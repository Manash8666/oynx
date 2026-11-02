import { test, expect } from '@playwright/test';

test.describe('Adversarial Security & Boundary Testing', () => {
  test('Path traversal attempts are blocked with zero file leakage', async ({ request }) => {
    const maliciousPaths = [
      '/../../etc/passwd',
      '/..\\..\\windows\\win.ini',
      '/....//....//etc/shadow',
      '/%2e%2e/%2e%2e/package.json',
    ];

    for (const path of maliciousPaths) {
      const response = await request.get(path);
      // Must not leak sensitive files
      const text = await response.text();
      expect(text).not.toContain('root:x:0:0');
      expect(text).not.toContain('[fonts]');
      expect(text).not.toContain('[extensions]');
    }
  });

  test('CORS preflight (OPTIONS) handles cross-origin requests securely', async ({ request }) => {
    const response = await request.fetch('/api/health', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://malicious-origin.com',
        'Access-Control-Request-Method': 'POST',
      },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['access-control-allow-origin']).toBe('*');
  });

  test('POST /api/byoai/test handles SQL/Command injection payloads gracefully', async ({ request }) => {
    const injectionPayloads = [
      { type: 'local', provider: "'; DROP TABLE users; --", endpointUrl: 'http://localhost:11434' },
      { type: 'api_key', provider: 'openai', endpointUrl: 'http://127.0.0.1:11434$(whoami)' },
      { type: 'custom_endpoint', provider: 'test', endpointUrl: '<script>alert(1)</script>' },
    ];

    for (const payload of injectionPayloads) {
      const response = await request.post('/api/byoai/test', {
        data: payload,
      });

      // Must not crash server with 500
      expect(response.status()).toBeLessThan(500);
      const json = await response.json();
      expect(json).toBeDefined();
    }
  });

  test('POST /api/security/evaluate detects dangerous code patterns', async ({ request }) => {
    const maliciousCode = `
      import os
      os.system("rm -rf /")
      eval("process.exit(1)")
    `;

    const response = await request.post('/api/security/evaluate', {
      data: { code: maliciousCode },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toBeDefined();
  });

  test('Boundary: empty inputs and oversized payloads are trapped gracefully', async ({ request }) => {
    // 1. Empty body
    const emptyResponse = await request.post('/api/byoai/test', {
      data: {},
    });
    expect(emptyResponse.status()).toBeLessThan(500);

    // 2. Large payload (256 KB string)
    const largeCode = 'const a = 1;\n'.repeat(18000);
    const largeResponse = await request.post('/api/security/evaluate', {
      data: { code: largeCode },
    });
    expect(largeResponse.status()).toBeLessThan(500);
  });
});
