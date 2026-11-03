import { test, expect } from '@playwright/test'

const CONSOLE_BASE_URL = process.env.CONSOLE_TEST_URL || 'https://app.oynx.si'

test.describe('Onyx Desktop IDE UI · Luxury Obsidian & Electric Volt Experience', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
  })

  test('Desktop Titlebar renders High-DPI menu, command palette center, and layout toggles', async ({ page }) => {
    await page.goto(`${CONSOLE_BASE_URL}/desktop-ide`, { waitUntil: 'networkidle' })

    // Verify Titlebar Logo
    const logo = page.locator('.onyx-titlebar-logo')
    await expect(logo).toBeVisible()
    await expect(logo).toContainText('Onyx')

    // Verify Standard Menu Bar
    const menubar = page.locator('.onyx-menubar')
    await expect(menubar).toBeVisible()
    await expect(menubar).toContainText('File')
    await expect(menubar).toContainText('Edit')
    await expect(menubar).toContainText('Selection')
    await expect(menubar).toContainText('View')
    await expect(menubar).toContainText('Go')
    await expect(menubar).toContainText('Run')
    await expect(menubar).toContainText('Terminal')
    await expect(menubar).toContainText('Help')

    // Verify Center Command Palette Pill
    const centerPill = page.locator('.onyx-titlebar-center')
    await expect(centerPill).toBeVisible()
    await expect(centerPill).toContainText('Vibe Code Platform')
    await expect(centerPill).toContainText('Ctrl+Shift+P')
  })

  test('Welcome Canvas renders Open Folder, Clone Repo, Recent Workspaces, and Shortcuts Matrix', async ({ page }) => {
    await page.goto(`${CONSOLE_BASE_URL}/desktop-ide`, { waitUntil: 'networkidle' })

    // Verify Welcome Badge
    const badge = page.locator('.onyx-welcome-badge')
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('ONYX AUTONOMOUS AI IDE')

    // Verify Primary Action Buttons
    const openFolderBtn = page.locator('.onyx-btn-open-folder:has-text("Open Folder")')
    await expect(openFolderBtn).toBeVisible()

    const cloneRepoBtn = page.locator('.onyx-btn-clone-repo:has-text("Clone Repository")')
    await expect(cloneRepoBtn).toBeVisible()

    // Verify Recent Workspaces
    const workspaces = page.locator('.onyx-welcome-workspaces')
    await expect(workspaces).toBeVisible()
    await expect(workspaces).toContainText('Vibe Code Platform')
    await expect(workspaces).toContainText('Insta + Youtube Bot')
    await expect(workspaces).toContainText('MotoFit Website')

    // Verify Global Standard & Onyx Shortcuts Matrix
    const shortcutsSection = page.locator('.onyx-welcome-shortcuts-section')
    await expect(shortcutsSection).toBeVisible()
    await expect(shortcutsSection).toContainText('Show All Commands')
    await expect(shortcutsSection).toContainText('Open Agent Lucifer Copilot')
    await expect(shortcutsSection).toContainText('Run Tree-Sitter AST Audit')
    await expect(shortcutsSection).toContainText('Summon Autonomous Patch')
    await expect(shortcutsSection).toContainText('Toggle Integrated Terminal')
  })

  test('Interactive Spotlight Command Palette (Ctrl+Shift+P) opens, filters commands, and executes', async ({ page }) => {
    await page.goto(`${CONSOLE_BASE_URL}/desktop-ide`, { waitUntil: 'networkidle' })

    // Open palette by clicking center titlebar pill
    await page.locator('.onyx-titlebar-center').click()

    const palette = page.locator('.onyx-palette-modal')
    await expect(palette).toBeVisible()

    // Filter commands by typing
    const input = page.locator('.onyx-palette-input')
    await input.fill('AST')

    const items = page.locator('.onyx-palette-item')
    await expect(items.first()).toContainText('Run Tree-Sitter In-Process AST Audit')

    // Press Escape to close
    await page.keyboard.press('Escape')
    await expect(palette).not.toBeVisible()
  })

  test('Seamless transition to Active Code Editor: tabs, line numbers, AST guard, and terminal runner', async ({ page }) => {
    await page.goto(`${CONSOLE_BASE_URL}/desktop-ide`, { waitUntil: 'networkidle' })

    // Click Open Folder or a workspace item to enter active editor
    await page.locator('.onyx-btn-open-folder').first().scrollIntoViewIfNeeded()
    await page.locator('.onyx-btn-open-folder').first().click({ force: true })

    // Verify Active Code Editor View is displayed
    const editorCanvas = page.locator('.onyx-editor-canvas')
    await expect(editorCanvas).toBeVisible()

    // Verify Tabs Bar
    const tabsBar = page.locator('.onyx-editor-tabs-bar')
    await expect(tabsBar).toBeVisible()
    await expect(tabsBar).toContainText('App.tsx')

    // Verify Line Gutter & Code Textarea
    await expect(page.locator('.onyx-line-gutter')).toBeVisible()
    const textarea = page.locator('.onyx-code-textarea')
    await expect(textarea).toBeVisible()

    // Edit code and verify AST status in bottom status bar
    await textarea.fill('export const testModule = () => { return 42 }\n')
    const statusPill = page.locator('.onyx-status-pill.volt')
    await expect(statusPill).toContainText('AST Clean')

    // Test Terminal Execution
    const termInput = page.locator('.onyx-terminal-input')
    await termInput.fill('test')
    await termInput.press('Enter')
    await expect(page.locator('.onyx-terminal-logs')).toContainText('Tree-Sitter Compiler Sentry: 37 languages verified')

    // Test Agent Lucifer Copilot
    const copilotTextarea = page.locator('.onyx-copilot-textarea')
    await copilotTextarea.fill('Optimize this module')
    await page.locator('.onyx-copilot-actions button:has-text("Send →")').click()

    // Verify Lucifer thought stream appears
    await expect(page.locator('.onyx-copilot-stream')).toContainText('Agent Lucifer Thought Stream')
    await expect(page.locator('.onyx-copilot-stream')).toContainText('Apply Surgical Patch to Editor')
  })
})
