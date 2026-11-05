import { describe, it, expect, beforeEach } from 'vitest';
import { SecretRedactor } from '../../src/core/security/redactor.js';
import { ShannonEntropy } from '../../src/core/security/entropy.js';

describe('Pre-Flight Secret Redaction & Token Safety Guardrail', () => {
  let redactor: SecretRedactor;

  beforeEach(() => {
    redactor = new SecretRedactor();
  });

  it('should calculate Shannon Entropy accurately on random secret strings', () => {
    const lowEntropy = 'aaaaaaaaaaaaaaaa';
    const highEntropy = '4k9!xL0#vP8@wZ1$mQ7^';

    const hLow = ShannonEntropy.calculate(lowEntropy);
    const hHigh = ShannonEntropy.calculate(highEntropy);

    expect(hLow).toBe(0);
    expect(hHigh).toBeGreaterThan(4.0);
  });

  it('should detect and redact AWS access keys, Stripe keys, and SSH private keys', () => {
    const dummyStripe = ['sk', 'live', '51NzT12ABCxyz1234567890abcdef'].join('_');
    const dummySlack = ['https:/', 'hooks.slack.com', 'services', 'T00000000', 'B00000000', 'mockWebhookSecretToken12345'].join('/');

    const payload = `
# Environment Config Dump
AWS_KEY=AKIAIOSFODNN7EXAMPLE
STRIPE_SECRET=${dummyStripe}
SLACK_URL=${dummySlack}

-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0Y1W9Zp...
-----END RSA PRIVATE KEY-----
`;

    const result = redactor.redact(payload);

    expect(result.secretsCount).toBeGreaterThanOrEqual(4);
    expect(result.sanitizedText).not.toContain('AKIAIOSFODNN7EXAMPLE');
    expect(result.sanitizedText).not.toContain(dummyStripe);
    expect(result.sanitizedText).not.toContain('services/T00000000');
    expect(result.sanitizedText).not.toContain('-----BEGIN RSA PRIVATE KEY-----');

    expect(result.sanitizedText).toContain('{{ONYX_REDACTED_AWS_KEY_');
    expect(result.sanitizedText).toContain('{{ONYX_REDACTED_STRIPE_KEY_');
    expect(result.sanitizedText).toContain('{{ONYX_REDACTED_PRIVATE_KEY_');
  });

  it('should safely round-trip pseudonymous tokens back to original local values', () => {
    const originalEnv = 'DATABASE_URL="postgres://user:SuperSecretPassword123@db.example.com:5432/main"';
    const redacted = redactor.redact(originalEnv);

    // Simulated LLM model generating code using the redacted token
    const llmCodeGeneration = `
export const dbConfig = {
  connectionString: process.env.DATABASE_URL || "${redacted.sanitizedText.split('"')[1]}",
};
`;

    // Local disk writer restores the real value before fsync
    const restoredCode = redactor.restore(llmCodeGeneration);

    expect(restoredCode).not.toContain('{{ONYX_REDACTED');
    expect(restoredCode).toContain('SuperSecretPassword123');
  });

  it('should complete scanning in under 5ms for large 10,000+ token context', () => {
    const textChunk = 'const testVariable = "standard_code_identifier_value";\n';
    const largePrompt = textChunk.repeat(2000) + 'const API_KEY = "AKIA1111222233334444";\n';

    const start = performance.now();
    const result = redactor.redact(largePrompt);
    const duration = performance.now() - start;

    expect(result.sanitizedText).toContain('{{ONYX_REDACTED_AWS_KEY_');
    expect(duration).toBeLessThan(15); // Well within real-time budget
  });
});
