import { describe, it, expect } from 'vitest';
import { TrafficRecorder } from '../../src/core/mocks/traffic-recorder.js';
import { MswWriter } from '../../src/core/mocks/msw-writer.js';
import type { RecordedNetworkCall } from '../../src/core/mocks/types.js';

describe('Deterministic Network & Mock Factory (Live CDP Traffic-to-Mock)', () => {
  it('should filter static assets, deduplicate parameterized routes, redact secrets, and output MSW handlers', () => {
    const recorder = new TrafficRecorder();

    // 1. Static asset: should be ignored
    const staticCall: RecordedNetworkCall = {
      url: 'http://localhost:3000/assets/logo.png',
      method: 'GET',
      status: 200,
      timestamp: Date.now(),
    };
    expect(recorder.recordCall(staticCall)).toBe(false);

    // 2. Dynamic API Call 1: user 101
    const call1: RecordedNetworkCall = {
      url: 'http://localhost:3000/api/users/101',
      method: 'GET',
      status: 200,
      responseBody: {
        id: '101',
        name: 'Alice',
        userPasswordHash: '$2b$12$e8Y7z...',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
      timestamp: Date.now(),
    };
    recorder.recordCall(call1);

    // 3. Dynamic API Call 2: user 102 (same route parameter pattern)
    const call2: RecordedNetworkCall = {
      url: 'http://localhost:3000/api/users/102',
      method: 'GET',
      status: 200,
      responseBody: { id: '102', name: 'Bob' },
      timestamp: Date.now(),
    };
    recorder.recordCall(call2);

    // 4. Dynamic API Call 3: POST /api/checkout with card
    const call3: RecordedNetworkCall = {
      url: 'http://localhost:3000/api/checkout',
      method: 'POST',
      status: 201,
      responseBody: {
        success: true,
        cardNumber: '4111 2222 3333 4444',
      },
      timestamp: Date.now(),
    };
    recorder.recordCall(call3);

    const calls = recorder.getCalls();
    expect(calls.length).toBe(3);

    // Compile to MSW file
    const mswContent = MswWriter.generateMswFileContent(calls);

    // Verify parameterization: /api/users/101 + /api/users/102 collapsed to /api/users/:id
    expect(mswContent).toContain("http.get('/api/users/:id'");

    // Verify secret redaction
    expect(mswContent).not.toContain('$2b$12$e8Y7z...');
    expect(mswContent).toContain('mock_secret_redacted');
    expect(mswContent).not.toContain('4111 2222 3333 4444');
    expect(mswContent).toContain('4242-4242-4242-4242');

    // Verify valid MSW imports and structure
    expect(mswContent).toContain("import { http, HttpResponse } from 'msw';");
    expect(mswContent).toContain("http.post('/api/checkout'");
  });
});
