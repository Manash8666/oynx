export class FixtureGenerator {
  public static sanitizePayload(payload: unknown): unknown {
    if (typeof payload === 'string') {
      // JWT token
      if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(payload)) {
        return 'mock_jwt_token_header_payload_sig';
      }
      // Credit card pattern
      if (/^\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}$/.test(payload)) {
        return '4242-4242-4242-4242';
      }
      return payload;
    }

    if (Array.isArray(payload)) {
      return payload.map((item) => this.sanitizePayload(item));
    }

    if (typeof payload === 'object' && payload !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(payload as Record<string, unknown>)) {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('password') || lowerKey.includes('secret')) {
          sanitized[key] = 'mock_secret_redacted';
        } else if (lowerKey.includes('token') || lowerKey.includes('authorization')) {
          sanitized[key] = 'mock_auth_token';
        } else {
          sanitized[key] = this.sanitizePayload(val);
        }
      }
      return sanitized;
    }

    return payload;
  }
}
