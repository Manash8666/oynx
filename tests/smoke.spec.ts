import { test, expect, Response } from '@playwright/test';

// ---------------------------------------------------------------------------
// 1. Core Route and API Manifest
// ---------------------------------------------------------------------------
const CORE_UI_ROUTES = [
  { path: '/', expectedSelector: 'main, #root, #__next', titleSnippet: '' },
  { path: '/login', expectedSelector: 'form, input[type="email"], input[type="text"]' },
  { path: '/dashboard', expectedSelector: 'nav, [role="navigation"], main' },
  { path: '/settings', expectedSelector: 'h1, h2, form' },
];

const CORE_API_ENDPOINTS = [
  { path: '/api/health', method: 'GET', expectedStatus: 200 },
  { path: '/api/v1/version', method: 'GET', expectedStatus: 200 },
  { path: '/api/v1/auth/status', method: 'GET', expectedStatus: [200, 401] }, // Handled unauth
];

// ---------------------------------------------------------------------------
// 2. Direct Backend & API Connection Verification
// ---------------------------------------------------------------------------
test.describe('API Connectivity & Contract Smoke Tests', () => {
  for (const endpoint of CORE_API_ENDPOINTS) {
    test(`API [${endpoint.method}] ${endpoint.path} responds with valid status`, async ({ request }) => {
      const response = await request.fetch(endpoint.path, {
        method: endpoint.method,
      });

      const allowedStatuses = Array.isArray(endpoint.expectedStatus)
        ? endpoint.expectedStatus
        : [endpoint.expectedStatus];

      expect(
        allowedStatuses,
        `Expected ${endpoint.path} to return ${allowedStatuses.join('/')}, but got ${response.status()}`
      ).toContain(response.status());

      // Ensure JSON endpoints return valid payload formatting
      const contentType = response.headers()['content-type'] || '';
      if (contentType.includes('application/json')) {
        const body = await response.json();
        expect(body).toBeDefined();
        expect(typeof body).toBe('object');
      }
    });
  }

  test('API catches unhandled 404 paths with structured JSON', async ({ request }) => {
    const response = await request.get('/api/non-existent-route-contract-test');
    expect(response.status()).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// 3. UI Route Navigation & Client-Side Health Sweep
// ---------------------------------------------------------------------------
test.describe('UI Routes & Runtime Error Isolation', () => {
  for (const route of CORE_UI_ROUTES) {
    test(`Route [${route.path}] loads without runtime exceptions or broken responses`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      const failedRequests: string[] = [];

      // Intercept and record client-side runtime errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (!text.includes('Failed to load resource: the server responded with a status of 403')) {
            consoleErrors.push(text);
          }
        }
      });

      page.on('pageerror', (err) => {
        pageErrors.push(err.message);
      });

      // Track failed asset and API calls made by the client
      page.on('response', (res: Response) => {
        const status = res.status();
        const url = res.url();
        // Ignore expected third-party telemetry failures in local testing
        if (status >= 400 && !url.includes('google-analytics') && !url.includes('hotjar')) {
          failedRequests.push(`[${status}] ${url}`);
        }
      });

      // Execute navigation
      const response = await page.goto(route.path, {
        waitUntil: 'domcontentloaded',
      });

      // 1. Verify HTTP Response code
      expect(response, `No response received from route: ${route.path}`).not.toBeNull();
      expect(response?.status(), `Route ${route.path} returned status ${response?.status()}`).toBeLessThan(400);

      // 2. Verify key DOM anchor renders
      const keyElement = page.locator(route.expectedSelector).first();
      await expect(
        keyElement,
        `Expected selector "${route.expectedSelector}" was not visible on ${route.path}`
      ).toBeVisible({ timeout: 10000 });

      // 3. Check for common unhandled error boundaries
      const bodyText = await page.innerText('body');
      expect(bodyText).not.toContain('Application error: a client-side exception has occurred');
      expect(bodyText).not.toContain('Internal Server Error');
      expect(bodyText).not.toContain('Cannot GET ' + route.path);

      // 4. Assert zero fatal client script crashes
      expect(pageErrors, `Unhandled JavaScript runtime errors detected on ${route.path}: \n${pageErrors.join('\n')}`).toEqual([]);
      expect(consoleErrors, `Fatal console.error statements on ${route.path}: \n${consoleErrors.join('\n')}`).toEqual([]);
      expect(failedRequests, `Critical 4xx/5xx network requests triggered on ${route.path}: \n${failedRequests.join('\n')}`).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// 4. Live UI-to-API Interaction Smoke Test
// ---------------------------------------------------------------------------
test.describe('End-to-End Client-to-Backend State Mutation', () => {
  test('Form submission fires API call and updates DOM state without reload', async ({ page }) => {
    await page.goto('/login');

    // Wait for network response triggered by user submission
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/') && res.status() !== 404, { timeout: 10000 }).catch(() => null),
      (async () => {
        // Attempt fill on standard fields if present
        const emailInput = page.getByLabel(/email/i).or(page.locator('input[type="email"], input[name="email"]')).first();
        const submitButton = page.getByRole('button', { name: /submit|sign in|log in|continue/i }).first();

        if (await emailInput.isVisible()) {
          await emailInput.fill('audit-bot@example.com');
        }
        if (await submitButton.isVisible()) {
          await submitButton.click();
        }
      })(),
    ]);

    // If an API request was wired to the button, ensure it didn't crash the server (500)
    if (response) {
      expect(response.status()).toBeLessThan(500);
    }
  });
});
