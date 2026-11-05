import type { SecretRule } from './types.js';

export const SECRET_RULES: SecretRule[] = [
  {
    id: 'aws-access-key',
    name: 'AWS Access Key ID',
    pattern: /\b(AKIA[0-9A-Z]{16})\b/g,
    tokenPrefix: 'ONYX_REDACTED_AWS_KEY',
  },
  {
    id: 'stripe-live-key',
    name: 'Stripe Live Secret Key',
    pattern: /\b(sk_live_[0-9a-zA-Z]{24,32})\b/g,
    tokenPrefix: 'ONYX_REDACTED_STRIPE_KEY',
  },
  {
    id: 'github-pat',
    name: 'GitHub Personal Access Token',
    pattern: /\b(ghp_[0-9a-zA-Z]{36}|github_pat_[0-9a-zA-Z_]{82})\b/g,
    tokenPrefix: 'ONYX_REDACTED_GITHUB_PAT',
  },
  {
    id: 'gitlab-pat',
    name: 'GitLab Personal Access Token',
    pattern: /\b(glpat-[0-9a-zA-Z\-_]{20,24})\b/g,
    tokenPrefix: 'ONYX_REDACTED_GITLAB_PAT',
  },
  {
    id: 'slack-webhook',
    name: 'Slack Incoming Webhook URL',
    pattern: /https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9+/_-]+/g,
    tokenPrefix: 'ONYX_REDACTED_SLACK_WEBHOOK',
  },
  {
    id: 'private-key',
    name: 'Private RSA/OpenSSH Key Header',
    pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g,
    tokenPrefix: 'ONYX_REDACTED_PRIVATE_KEY',
  },
];
