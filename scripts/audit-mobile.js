import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function auditMobile() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone 13 mini / X / 11 Pro
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();
  const routes = ['/', '/vpc', '/code-reviewer', '/security-agent', '/download'];
  const results = [];

  const outDir = path.join(process.cwd(), 'scratch-mobile-audit');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const route of routes) {
    console.log(`Checking route: ${route} on 375x812...`);
    await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' });

    // Check for horizontal overflow
    const overflowInfo = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const bodyScrollWidth = document.body.scrollWidth;
      const isOverflowing = scrollWidth > docWidth || bodyScrollWidth > docWidth;

      const overflowingElements = [];
      if (isOverflowing) {
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
          const rect = el.getBoundingClientRect();
          if (rect.right > docWidth + 2) {
            overflowingElements.push({
              tag: el.tagName,
              id: el.id,
              className: (el.className || '').toString().slice(0, 80),
              right: Math.round(rect.right),
              docWidth: docWidth,
              text: (el.textContent || '').trim().slice(0, 50)
            });
          }
        }
      }

      return {
        docWidth,
        scrollWidth,
        bodyScrollWidth,
        isOverflowing,
        overflowingElementsCount: overflowingElements.length,
        topOverflowing: overflowingElements.slice(0, 10)
      };
    });

    const screenshotPath = path.join(outDir, `${route.replace(/\//g, '_') || 'home'}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });

    results.push({
      route,
      overflowInfo,
      screenshot: screenshotPath
    });
  }

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

auditMobile().catch(console.error);
