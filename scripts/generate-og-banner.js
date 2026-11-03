import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function generateProfessionalOgImage() {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Onyx OG Image</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1200px;
      height: 630px;
      background-color: #07080a;
      background-image: 
        radial-gradient(circle at 18% 25%, rgba(216, 255, 56, 0.12) 0%, transparent 45%),
        radial-gradient(circle at 85% 75%, rgba(56, 189, 248, 0.10) 0%, transparent 45%),
        radial-gradient(circle at 50% 100%, rgba(34, 197, 94, 0.08) 0%, transparent 40%),
        linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 100% 100%, 32px 32px, 32px 32px;
      color: #ffffff;
      font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 56px 64px;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    /* Ambient Corner Accents */
    .top-glow {
      position: absolute;
      top: -100px;
      left: 100px;
      width: 500px;
      height: 300px;
      background: radial-gradient(circle, rgba(216, 255, 56, 0.18) 0%, rgba(216, 255, 56, 0) 70%);
      filter: blur(50px);
      pointer-events: none;
    }

    /* Left Column: Brand & Value Proposition */
    .left-col {
      width: 610px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      z-index: 10;
    }

    .brand-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand-logo {
      width: 48px;
      height: 48px;
      filter: drop-shadow(0 0 16px rgba(216, 255, 56, 0.4));
    }

    .brand-name {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-version {
      font-family: 'Geist Mono', monospace;
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #a1a1aa;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .eyebrow-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(216, 255, 56, 0.08);
      border: 1px solid rgba(216, 255, 56, 0.28);
      font-family: 'Geist Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      color: #d8ff38;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-top: 24px;
      align-self: flex-start;
      box-shadow: 0 0 20px rgba(216, 255, 56, 0.15);
    }

    .eyebrow-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #d8ff38;
      box-shadow: 0 0 8px #d8ff38;
    }

    .headline {
      font-size: 46px;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.04em;
      color: #ffffff;
      margin-top: 14px;
      margin-bottom: 14px;
    }

    .headline-gradient {
      background: linear-gradient(135deg, #ffffff 30%, #e4e4e7 60%, #d8ff38 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subhead {
      font-size: 16px;
      line-height: 1.5;
      color: #a1a1aa;
      margin-bottom: 24px;
      max-width: 540px;
    }

    .badges-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 24px;
    }

    .badge-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 12px;
      background: rgba(18, 21, 29, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 13px;
      font-weight: 600;
      color: #e4e4e7;
    }

    .badge-card svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .footer-bar {
      display: flex;
      align-items: center;
      gap: 20px;
      font-family: 'Geist Mono', monospace;
      font-size: 13px;
      color: #71717a;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 16px;
    }

    .url-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #d8ff38;
      font-weight: 700;
    }

    .verified-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #22c55e;
      font-size: 12px;
      font-weight: 600;
    }

    /* Right Column: Floating IDE Window Mockup */
    .right-col {
      width: 450px;
      height: 480px;
      background: #0b0d13;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.8),
        0 0 40px rgba(216, 255, 56, 0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
      z-index: 10;
    }

    .window-header {
      background: #0f121a;
      padding: 14px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .window-dots {
      display: flex;
      gap: 8px;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .dot.red { background: #ef4444; }
    .dot.yellow { background: #eab308; }
    .dot.green { background: #22c55e; }

    .window-title {
      font-family: 'Geist Mono', monospace;
      font-size: 12px;
      color: #d8ff38;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .window-status {
      font-family: 'Geist Mono', monospace;
      font-size: 11px;
      color: #22c55e;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 6px #22c55e;
    }

    .code-body {
      padding: 20px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12.5px;
      line-height: 1.7;
      color: #d4d4d8;
      flex: 1;
      overflow: hidden;
      background: #08090d;
    }

    .comment { color: #52525b; font-style: italic; }
    .keyword { color: #d8ff38; font-weight: 600; }
    .fn { color: #38bdf8; font-weight: 600; }
    .string { color: #a3e635; }
    .type { color: #22c55e; }
    .num { color: #f59e0b; }
    .punct { color: #71717a; }

    .window-footer {
      background: #0e1118;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 12px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'Geist Mono', monospace;
      font-size: 11px;
    }

    .footer-agent {
      color: #d8ff38;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .footer-stats {
      color: #71717a;
    }

    /* Floating Pill Tag */
    .floating-pill {
      position: absolute;
      bottom: -15px;
      right: 20px;
      background: #181c26;
      border: 1px solid rgba(216, 255, 56, 0.35);
      border-radius: 12px;
      padding: 8px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Geist Mono', monospace;
      font-size: 11px;
      color: #ffffff;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
      z-index: 20;
    }

    .badge-icon-volt { color: #d8ff38; }
    .badge-icon-green { color: #22c55e; }
    .badge-icon-blue { color: #38bdf8; }
  </style>
</head>
<body>
  <div class="top-glow"></div>

  <!-- Left Column -->
  <div class="left-col">
    <div>
      <div class="brand-row">
        <!-- SVG Logo -->
        <svg class="brand-logo" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="10" fill="#0c0e14" stroke="#d8ff38" stroke-width="2" />
          <path d="M20 7L31 13.5V26.5L20 33L9 26.5V13.5L20 7Z" stroke="#d8ff38" stroke-width="2.5" stroke-linejoin="round" />
          <path d="M20 16L26 19.5V26.5L20 30L14 26.5V19.5L20 16Z" fill="#d8ff38" fill-opacity="0.2" stroke="#ffffff" stroke-width="1.8" />
          <circle cx="20" cy="20" r="3" fill="#d8ff38" />
        </svg>
        <span class="brand-name">Onyx</span>
        <span class="brand-version">v1.0 Retinal</span>
      </div>

      <div class="eyebrow-pill">
        <span class="eyebrow-dot"></span>
        <span>Dual-Cortex Engine • Agent Lucifer</span>
      </div>

      <h1 class="headline">
        The Autonomous AI IDE<br>
        <span class="headline-gradient">You Actually Own.</span>
      </h1>

      <p class="subhead">
        Harmonizes DeepSeek R1 reasoning + Qwen 2.5 multimodal UI with in-process Tree-Sitter AST compiler guards and zero vendor markups.
      </p>

      <div class="badges-grid">
        <div class="badge-card">
          <svg class="badge-icon-volt" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>100% Customer IP Ownership</span>
        </div>
        <div class="badge-card">
          <svg class="badge-icon-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          <span>$0 Token Markup • BYOAI</span>
        </div>
        <div class="badge-card">
          <svg class="badge-icon-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
          <span>Air-Gapped GPU (153 tok/s)</span>
        </div>
        <div class="badge-card">
          <svg class="badge-icon-volt" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Zero Code Telemetry Egress</span>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div class="url-pill">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <span>oynx.si</span>
      </div>
      <span>•</span>
      <div class="verified-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        <span>Enterprise & Open Source</span>
      </div>
      <span>•</span>
      <span>Windows · macOS · Linux</span>
    </div>
  </div>

  <!-- Right Column: IDE Window Mockup -->
  <div class="right-col">
    <div class="window-header">
      <div class="window-dots">
        <div class="dot red"></div>
        <div class="dot yellow"></div>
        <div class="dot green"></div>
      </div>
      <div class="window-title">
        <span>compiler-guard.ts</span>
      </div>
      <div class="window-status">
        <span class="pulse-dot"></span>
        <span>AST Clean</span>
      </div>
    </div>

    <div class="code-body">
      <span class="comment">// 1. In-Process Tree-Sitter AST Sentry</span><br>
      <span class="keyword">const</span> <span class="fn">diagnostics</span> <span class="punct">=</span> <span class="keyword">await</span> LspGuard.<span class="fn">verify</span>(patch.ast);<br><br>
      <span class="keyword">if</span> (diagnostics.length <span class="punct">===</span> <span class="num">0</span>) {<br>
      &nbsp;&nbsp;<span class="comment">// 2. Create reversible atomic git snapshot</span><br>
      &nbsp;&nbsp;<span class="keyword">const</span> cp <span class="punct">=</span> <span class="keyword">await</span> GitSnapshot.<span class="fn">checkpoint</span>();<br>
      &nbsp;&nbsp;<span class="keyword">return</span> {<br>
      &nbsp;&nbsp;&nbsp;&nbsp;status: <span class="string">'AST_CLEAN'</span>,<br>
      &nbsp;&nbsp;&nbsp;&nbsp;hash: cp.hash,<br>
      &nbsp;&nbsp;&nbsp;&nbsp;latency: <span class="string">'14ms'</span><br>
      &nbsp;&nbsp;};<br>
      }<br><br>
      <span class="comment">// 3. Self-healing micro-patch synthesis</span><br>
      <span class="keyword">return await</span> Runtime.<span class="fn">autoHeal</span>(diagnostics);
    </div>

    <div class="window-footer">
      <div class="footer-agent">
        <span>✦ Agent Lucifer</span>
        <span style="color: #71717a;">·</span>
        <span style="color: #22c55e;">Qwen 2.5 + DeepSeek R1</span>
      </div>
      <div class="footer-stats">
        <span>0 errors · 153 tok/s</span>
      </div>
    </div>
  </div>
</body>
</html>`;

  const htmlPath = path.join(process.cwd(), 'scripts', 'temp-og.html');
  fs.writeFileSync(htmlPath, htmlContent);

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1 // standard 1200x630 pixel-for-pixel
  });

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500); // ensure fonts are fully rendered

  const targetOgPng = path.join(process.cwd(), 'website', 'public', 'og.png');
  const targetOgImagePng = path.join(process.cwd(), 'website', 'public', 'og-image.png');
  const targetOgPreview = path.join(process.cwd(), 'website', 'public', 'assets', 'images', 'og-preview.png');
  const targetOgImageInImages = path.join(process.cwd(), 'website', 'public', 'assets', 'images', 'og-image.png');

  // Also save to brain artifacts
  const artifactDir = 'C:\\Users\\Manas\\.gemini\\antigravity\\brain\\21d069cf-9d52-45d2-b44f-107fb96c5fa2';
  const artifactPath = path.join(artifactDir, 'professional-og-retina.png');

  // Capture screenshot directly
  await page.screenshot({ path: targetOgPng, type: 'png' });
  fs.copyFileSync(targetOgPng, targetOgImagePng);
  fs.copyFileSync(targetOgPng, targetOgPreview);
  fs.copyFileSync(targetOgPng, targetOgImageInImages);
  fs.copyFileSync(targetOgPng, artifactPath);

  console.log('Successfully generated professional 1200x630 Retina OG banner!');
  console.log('Saved to:', targetOgPng);
  console.log('File size:', fs.statSync(targetOgPng).size, 'bytes');

  await browser.close();
  fs.unlinkSync(htmlPath);
}

generateProfessionalOgImage().catch(console.error);
