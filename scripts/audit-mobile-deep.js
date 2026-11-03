import { chromium } from 'playwright';

async function auditMobileDetails() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();

  const routes = [
    '/',
    '/vpc',
    '/code-reviewer',
    '/security-agent',
    '/what-is-onyx',
    '/pricing',
    '/docs',
    '/compliance',
    '/retina-ready',
    '/leaderboard'
  ];

  console.log('--- STARTING MOBILE DEEP AUDIT ---');

  for (const route of routes) {
    await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' });

    // Scroll to bottom to trigger any lazy mounts or animations
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 300;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 50);
      });
    });

    // Check horizontal overflow after full scroll
    const overflowReport = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const scrollW = document.documentElement.scrollWidth;
      const bodyW = document.body.scrollWidth;

      const culprits = [];
      const all = document.querySelectorAll('*');
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.right > docW + 1) {
          culprits.push({
            tag: el.tagName,
            cls: (el.className || '').toString().slice(0, 70),
            right: Math.round(r.right),
            width: Math.round(r.width),
            text: (el.textContent || '').trim().slice(0, 40)
          });
        }
      }

      return {
        docW,
        scrollW,
        bodyW,
        hasOverflow: scrollW > docW || bodyW > docW,
        culprits: culprits.slice(0, 8)
      };
    });

    console.log(`Route [${route}]: Overflow? ${overflowReport.hasOverflow} (docW: ${overflowReport.docW}, scrollW: ${overflowReport.scrollW})`);
    if (overflowReport.hasOverflow) {
      console.log('   Culprits:', JSON.stringify(overflowReport.culprits, null, 2));
    }
  }

  // Also test mobile drawer opening on home
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  const toggleBtn = await page.$('button[aria-label="Toggle menu"]');
  if (toggleBtn) {
    await toggleBtn.click();
    await page.waitForTimeout(300);
    const drawerVisible = await page.evaluate(() => {
      const drawer = document.querySelector('header .lg\\:hidden.mt-2');
      return !!drawer;
    });
    console.log(`Mobile Drawer open test: ${drawerVisible ? 'PASS' : 'FAIL'}`);
  }

  await browser.close();
}

auditMobileDetails().catch(console.error);
