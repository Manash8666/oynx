import { chromium } from 'playwright';
import path from 'path';

async function captureSections() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // Full page screenshot
  await page.screenshot({ path: 'scratch-mobile-audit/home-fullpage.png', fullPage: true });
  console.log('Saved home-fullpage.png');

  // Let's capture other pages
  for (const pageName of ['vpc', 'code-reviewer', 'security-agent', 'what-is-onyx', 'pricing', 'docs']) {
    try {
      await page.goto(`http://localhost:3000/${pageName}`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: `scratch-mobile-audit/${pageName}-fullpage.png`, fullPage: true });
      console.log(`Saved ${pageName}-fullpage.png`);
    } catch (e) {
      console.error(`Failed ${pageName}:`, e.message);
    }
  }

  await browser.close();
}

captureSections().catch(console.error);
