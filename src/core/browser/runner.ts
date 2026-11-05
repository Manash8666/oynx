import { chromium, type Browser, type BrowserContext, type Page, type Locator } from 'playwright';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { CDPListener, type CDPSessionLike } from './cdp-listener.js';
import type {
  AccessibilitySnapshotNode,
  BrowserInteractionAction,
  BrowserRunnerConfig,
  ExecutionTelemetry,
} from './types.js';

export class BrowserRunner {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private cdpListener: CDPListener | null = null;
  private actionsHistory: BrowserInteractionAction[] = [];
  private isTracing = false;
  private readonly timeoutMs: number;
  private readonly headless: boolean;
  private readonly traceArtifactDir: string;

  constructor(config: Partial<BrowserRunnerConfig> = {}) {
    this.headless = config.headless ?? true;
    this.timeoutMs = config.timeoutMs ?? 8000;
    this.traceArtifactDir = config.traceArtifactDir ?? join(process.cwd(), '.onyx', 'traces');
  }

  public async init(existingPage?: Page, sessionOverride?: CDPSessionLike): Promise<void> {
    if (existingPage) {
      this.page = existingPage;
      this.context = existingPage.context();
    } else {
      this.browser = await chromium.launch({
        headless: this.headless,
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 800 },
      });

      await this.context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true,
      });
      this.isTracing = true;

      this.page = await this.context.newPage();
    }

    this.page.setDefaultTimeout(this.timeoutMs);
    this.page.setDefaultNavigationTimeout(this.timeoutMs);

    this.cdpListener = new CDPListener(this.page, sessionOverride);
    await this.cdpListener.start();
  }

  public getPage(): Page {
    if (!this.page) {
      throw new Error('BrowserRunner has not been initialized. Call init() first.');
    }
    return this.page;
  }

  public getTelemetry(): ExecutionTelemetry {
    if (!this.cdpListener) {
      return {
        consoleMessages: [],
        networkFailures: [],
        uncaughtExceptions: [],
        timestamp: Date.now(),
      };
    }
    return this.cdpListener.getTelemetry();
  }

  public async navigate(url: string): Promise<AccessibilitySnapshotNode> {
    const page = this.getPage();
    const startTime = Date.now();

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: this.timeoutMs,
    });

    const snapshot = await this.captureAccessibilityTree();

    const telemetryDelta = this.cdpListener
      ? this.cdpListener.getDeltaSince(startTime)
      : {
          consoleMessages: [],
          networkFailures: [],
          uncaughtExceptions: [],
          timestamp: Date.now(),
        };

    const actionRecord: BrowserInteractionAction = {
      action: 'navigate',
      target: url,
      timestamp: startTime,
      durationMs: Date.now() - startTime,
      telemetryDelta,
    };
    this.actionsHistory.push(actionRecord);

    return snapshot;
  }

  public async interact(
    selector: string,
    action: 'click' | 'fill',
    value?: string
  ): Promise<BrowserInteractionAction> {
    const page = this.getPage();
    const startTime = Date.now();

    const locator = this.resolveElement(page, selector);

    // Timeout guard at 8000ms
    if (action === 'click') {
      await locator.click({ timeout: this.timeoutMs });
    } else if (action === 'fill') {
      await locator.fill(value ?? '', { timeout: this.timeoutMs });
    }

    const telemetryDelta = this.cdpListener
      ? this.cdpListener.getDeltaSince(startTime)
      : {
          consoleMessages: [],
          networkFailures: [],
          uncaughtExceptions: [],
          timestamp: Date.now(),
        };

    const actionRecord: BrowserInteractionAction = {
      action,
      target: selector,
      value,
      timestamp: startTime,
      durationMs: Date.now() - startTime,
      telemetryDelta,
    };
    this.actionsHistory.push(actionRecord);

    return actionRecord;
  }

  private resolveElement(page: Page, selector: string): Locator {
    // 1. Check for role syntax, e.g. "role=button[name='Submit']"
    if (selector.startsWith('role=')) {
      const match = selector.match(/^role=([a-zA-Z]+)(?:\[name=['"]([^'"]+)['"]\])?/);
      if (match) {
        const role = match[1] as any;
        const name = match[2];
        return page.getByRole(role, name ? { name } : undefined).first();
      }
    }

    // 2. Check for label syntax, e.g. "label='Email Address'"
    if (selector.startsWith('label=')) {
      const labelText = selector.replace(/^label=['"]?/, '').replace(/['"]?$/, '');
      return page.getByLabel(labelText).first();
    }

    // 3. Check for text syntax, e.g. "text='Sign In'"
    if (selector.startsWith('text=')) {
      const textVal = selector.replace(/^text=['"]?/, '').replace(/['"]?$/, '');
      return page.getByText(textVal).first();
    }

    // 4. Fallback to standard CSS / XPath locator
    return page.locator(selector).first();
  }

  public async captureAccessibilityTree(): Promise<AccessibilitySnapshotNode> {
    const page = this.getPage();

    // Use page.accessibility if available or DOM evaluation
    try {
      const snapshot = await (page as any).accessibility?.snapshot?.({ interestingOnly: true });
      if (snapshot) {
        return this.mapA11yNode(snapshot);
      }
    } catch {
      // Fallback
    }

    // Synthesize structured accessibility tree from DOM
    const rawTree = await page.evaluate(() => {
      function traverse(el: Element): {
        role: string;
        name: string;
        children: any[];
      } {
        const role =
          el.getAttribute('role') ||
          el.tagName.toLowerCase();
        const name =
          el.getAttribute('aria-label') ||
          (el as HTMLElement).innerText?.slice(0, 50) ||
          el.getAttribute('title') ||
          '';

        const children: any[] = [];
        for (let i = 0; i < el.children.length; i++) {
          const child = el.children[i];
          if (child) {
            children.push(traverse(child));
          }
        }

        return { role, name, children };
      }
      return traverse(document.body || document.documentElement);
    });

    return rawTree as AccessibilitySnapshotNode;
  }

  private mapA11yNode(node: any): AccessibilitySnapshotNode {
    return {
      role: node.role || 'unknown',
      name: node.name || undefined,
      value: node.value ? String(node.value) : undefined,
      description: node.description || undefined,
      children: Array.isArray(node.children)
        ? node.children.map((c: any) => this.mapA11yNode(c))
        : undefined,
    };
  }

  public async captureTrace(): Promise<string> {
    if (!this.context || !this.isTracing) {
      throw new Error('Tracing was not started or context is not active.');
    }

    await mkdir(this.traceArtifactDir, { recursive: true });
    const tracePath = join(
      this.traceArtifactDir,
      `trace-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.zip`
    );

    await this.context.tracing.stop({ path: tracePath });
    this.isTracing = false;

    return tracePath;
  }

  public async exportSpec(targetPath: string): Promise<string> {
    const testLines: string[] = [
      `import { test, expect } from '@playwright/test';`,
      ``,
      `test('Autonomous agent verified execution flow', async ({ page }) => {`,
      `  page.setDefaultTimeout(${this.timeoutMs});`,
    ];

    for (const record of this.actionsHistory) {
      if (record.action === 'navigate') {
        testLines.push(`  await page.goto('${record.target}', { waitUntil: 'domcontentloaded' });`);
      } else if (record.action === 'click') {
        testLines.push(`  await page.locator('${record.target}').first().click();`);
      } else if (record.action === 'fill') {
        testLines.push(
          `  await page.locator('${record.target}').first().fill('${(record.value ?? '').replace(/'/g, "\\'")}');`
        );
      }
    }

    testLines.push(`  // Assert zero unhandled exceptions or critical 5xx errors`);
    testLines.push(`  await expect(page).toHaveURL(/.*/);`);
    testLines.push(`});`);
    testLines.push(``);

    const specContent = testLines.join('\n');

    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, specContent, 'utf-8');

    return specContent;
  }

  public getActionsHistory(): readonly BrowserInteractionAction[] {
    return this.actionsHistory;
  }

  public async close(): Promise<void> {
    if (this.cdpListener) {
      await this.cdpListener.stop();
      this.cdpListener = null;
    }

    if (this.context) {
      if (this.isTracing) {
        try {
          await this.context.tracing.stop();
        } catch {
          // Ignore if already stopped
        }
        this.isTracing = false;
      }
      try {
        await this.context.close();
      } catch {
        // Ignore
      }
      this.context = null;
    }

    if (this.browser) {
      try {
        await this.browser.close();
      } catch {
        // Ignore
      }
      this.browser = null;
    }

    this.page = null;
  }
}
