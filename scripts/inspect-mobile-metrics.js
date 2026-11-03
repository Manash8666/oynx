import { chromium } from 'playwright';

async function inspectMobileIssues() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // 1. Check Navbar button text and size
  const navBtn = await page.$('header a[href*="download"]');
  const navBtnText = navBtn ? await navBtn.textContent() : null;
  const navBtnRect = navBtn ? await navBtn.boundingBox() : null;

  // 2. Check LiveStudio cloud IDE layout on mobile
  const studioColSpan5 = await page.$('#studio .col-span-1.md\\:col-span-5');
  const studioColSpan4 = await page.$('#studio .col-span-1.md\\:col-span-4');
  const studio5Rect = studioColSpan5 ? await studioColSpan5.boundingBox() : null;
  const studio4Rect = studioColSpan4 ? await studioColSpan4.boundingBox() : null;

  // 3. Check Hero CTAs layout
  const heroPrimaryCTA = await page.$('a[href*="cloud-agent"]');
  const heroPrimaryRect = heroPrimaryCTA ? await heroPrimaryCTA.boundingBox() : null;

  // 4. Check Mobile Menu contents
  const menuBtn = await page.$('button[aria-label="Toggle menu"]');
  await menuBtn.click();
  await page.waitForTimeout(200);
  const menuLinks = await page.$$eval('header .lg\\:hidden.mt-2 a', els =>
    els.map(el => ({ text: el.textContent.trim(), href: el.getAttribute('href') }))
  );

  console.log('--- MOBILE INSPECTION METRICS ---');
  console.log('Nav button text:', navBtnText, 'bounding box:', navBtnRect);
  console.log('Hero Primary CTA rect:', heroPrimaryRect);
  console.log('Studio Col 5 (Editor) rect on mobile:', studio5Rect);
  console.log('Studio Col 4 (Agent) rect on mobile:', studio4Rect);
  console.log(`Mobile menu has ${menuLinks.length} links:`, menuLinks.map(l => l.text));

  await browser.close();
}

inspectMobileIssues().catch(console.error);
