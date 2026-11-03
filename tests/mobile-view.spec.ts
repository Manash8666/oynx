import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Mobile Viewport & OpenGraph Asset Verification', () => {

  test.use({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true
  });

  test('OpenGraph retina card is 1200x630, optimized, and replaces vaporwave meme', async ({ request }) => {
    // 1. Verify index.html references the v5 version-bumped professional banner
    const res = await request.get('http://localhost:3000/');
    const html = await res.text();
    expect(html).toContain('https://oynx.si/og.png?v=5');
    expect(html).toContain('property="og:image:width" content="1200"');
    expect(html).toContain('property="og:image:height" content="630"');

    // 2. Verify physical og.png dimensions and file size
    const ogPath = path.join(process.cwd(), 'website', 'public', 'og.png');
    expect(fs.existsSync(ogPath)).toBe(true);
    const buf = fs.readFileSync(ogPath);
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);

    expect(width).toBe(1200);
    expect(height).toBe(630);
    expect(buf.length).toBeLessThan(1024 * 1024); // Under 1MB for instant WhatsApp unfurling
    expect(buf.length).toBeGreaterThan(100 * 1024); // Real high-res image, not empty placeholder
  });

  test('Home page on 375px mobile viewport has zero horizontal scroll overflow', async ({ page }) => {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(overflow).toBe(true);

    // Verify adaptive mobile header button shows "Cloud IDE"
    const mobileBtn = page.locator('header a:has-text("Cloud IDE")');
    await expect(mobileBtn).toBeVisible();

    // Verify hamburger button works and opens categorized drawer
    const menuBtn = page.locator('button[aria-label="Toggle menu"]');
    await menuBtn.click();
    await page.waitForTimeout(200);

    const drawer = page.locator('header .lg\\:hidden.mt-2');
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('text=Featured Intelligence')).toBeVisible();
    await expect(drawer.locator('text=Autonomous Tools & Agents')).toBeVisible();

    // Close menu
    await menuBtn.click();
  });

  test('LiveStudio on mobile allows switching between Code Editor and Agent Lucifer', async ({ page }) => {
    await page.goto('http://localhost:3000/#studio', { waitUntil: 'networkidle' });

    // Verify segmented control is visible on mobile inside studio
    const editorBtn = page.locator('#studio button:has-text("Code Editor")');
    const agentBtn = page.locator('#studio button:has-text("Agent Lucifer")');
    await expect(editorBtn).toBeVisible();
    await expect(agentBtn).toBeVisible();

    // Default: Code Editor is active
    const codeArea = page.locator('#studio pre:has-text("OnyxAuthProvider")');
    await expect(codeArea).toBeVisible();

    // Switch to Agent Lucifer
    await agentBtn.click();
    await page.waitForTimeout(200);
    const agentPrompt = page.locator('#studio').getByText('USER OBJECTIVE');
    await expect(agentPrompt).toBeVisible();

    // Switch back to Code Editor
    await editorBtn.click();
    await page.waitForTimeout(200);
    await expect(codeArea).toBeVisible();
  });

  test('Battlecard comparison table has sticky left Capability column', async ({ page }) => {
    await page.goto('http://localhost:3000/#comparison', { waitUntil: 'networkidle' });

    const capabilityHeader = page.locator('#comparison th:has-text("Capability")');
    await expect(capabilityHeader).toHaveClass(/sticky/);
    await expect(capabilityHeader).toHaveClass(/left-0/);
  });

  test('VPC, Code Reviewer, and Security Agent subpages fit within 375px mobile screen', async ({ page }) => {
    for (const route of ['/vpc', '/code-reviewer', '/security-agent']) {
      await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' });
      const noOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
      });
      expect(noOverflow).toBe(true);
    }
  });

});
