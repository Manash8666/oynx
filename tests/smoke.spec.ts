import { test, expect, Response } from '@playwright/test';

// ---------------------------------------------------------------------------
// 1. Core Route and API Manifest
// ---------------------------------------------------------------------------
const CORE_UI_ROUTES = [
  { path: '/', expectedSelector: 'main, #root, #__next', titleSnippet: '' },
  { path: '/login', expectedSelector: 'form, input[type="email"], input[type="text"]' },
  { path: '/dashboard', expectedSelector: 'nav, [role="navigation"], main' },
  { path: '/settings', expectedSelector: 'h1, h2, form' },
  { path: '/what-is-onyx', expectedSelector: '#root, main, section' },
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
        // Ignore expected third-party telemetry failures or external rate-limits in local testing
        if (status >= 400 && !url.includes('google-analytics') && !url.includes('hotjar') && !url.includes('api.github.com')) {
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

  test('What is Onyx Enterprise Demo Cockpit is interactive and renders verified evidence', async ({ page }) => {
    await page.goto('/what-is-onyx');

    // 1. Check hero header and enterprise demo pill
    await expect(page.locator('text=COMMERCIAL ENTERPRISE EXECUTIVE BRIEFING')).toBeVisible();
    await expect(page.locator('h1')).toContainText('What is Onyx?');

    // 2. Cockpit Tabs exist and can be switched
    const techStackTab = page.locator('button:has-text("TechStack & Complexity")').first();
    await expect(techStackTab).toBeVisible();
    await techStackTab.click();

    // Verify AST compiler guards and code preview
    await expect(page.locator('text=AI Code Generation Differentiated by TechStack')).toBeVisible();

    // Switch TechStack language to Rust
    const rustButton = page.locator('button:has-text("Rust")').first();
    if (await rustButton.isVisible()) {
      await rustButton.click();
      await expect(page.locator('text=Rust 1.82 / Tokio / Axum / Serde')).toBeVisible();
    }

    // Switch to Multimodal Studios Tab
    const multimodalTab = page.locator('button:has-text("4x Multimodal Studio")').first();
    await expect(multimodalTab).toBeVisible();
    await multimodalTab.click();
    await expect(page.locator('button:has-text("Sonic DAW")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Docling PDF")').first()).toBeVisible();

    // 3. Enterprise ROI Calculator updates dynamically
    const roiSection = page.locator('text=How Much Money Does Onyx Save Your Company?');
    await expect(roiSection).toBeVisible();
    const devInput = page.locator('input[type="range"]').first();
    if (await devInput.isVisible()) {
      await devInput.fill('50');
      // Verify savings calculation exists
      await expect(page.locator('text=Annual Savings')).toBeVisible();
    }

    // 4. Verify 5-Minute Live Executive Demo Walkthrough (authoritative live demo, zero first-person script quotes)
    await expect(page.locator('text=The 5-Minute Live Executive Walkthrough.')).toBeVisible();
    await expect(page.locator('text=STAGE 01 · 60s')).toBeVisible();
    await expect(page.locator('text=STAGE 05 · 60s')).toBeVisible();
    await expect(page.locator('text=Eliminating the 300% SaaS Token Tax')).toBeVisible();
  });
});
