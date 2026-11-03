import { test, expect } from '@playwright/test'

const CONSOLE_BASE_URL = process.env.CONSOLE_TEST_URL || 'https://app.oynx.si'

test.describe('Onyx Cloud IDE - Autonomous Workbench & Claude UI Integration', () => {

  test('Cloud IDE Hub renders "Back at it, Lucifer", prompt container, model and permission selectors', async ({ page }) => {
    await page.goto(`${CONSOLE_BASE_URL}/cloud-agent`, { waitUntil: 'networkidle' })

    // Verify Hub View Greeting
    const greeting = page.locator('.claude-hub-greeting')
    await expect(greeting).toBeVisible()
    await expect(greeting).toContainText('Back at it, Lucifer')

    // Verify Floating Prompt Box
    const promptBox = page.locator('.claude-prompt-container')
    await expect(promptBox).toBeVisible()

    // Verify Action dropdown (+) button
    const actionPlusBtn = page.locator('.claude-icon-btn:has-text("+")')
    await expect(actionPlusBtn).toBeVisible()
    await actionPlusBtn.click()

    // Verify Dropdown items
    const dropdown = page.locator('.claude-floating-dropdown')
    await expect(dropdown).toBeVisible()
    await expect(dropdown).toContainText('Upload or add files')
    await expect(dropdown).toContainText('New File')
    await expect(dropdown).toContainText('Skills & MCP Tools')
    await expect(dropdown).toContainText('Design System')

    // Click outside or click button again to close
    await actionPlusBtn.click()
    await expect(dropdown).not.toBeVisible()

    // Verify Permission Mode toggle
    const permBtn = page.locator('.claude-pill-btn:has-text("Manual"), .claude-pill-btn:has-text("Auto")')
    await expect(permBtn).toBeVisible()
    await permBtn.click()

    const permMenu = page.locator('.claude-floating-dropdown')
    await expect(permMenu).toBeVisible()
    await expect(permMenu).toContainText('Permission Mode')
    await expect(permMenu).toContainText('Manual')
    await expect(permMenu).toContainText('Auto (Autonomous)')

    // Select Auto mode
    const autoOption = page.locator('.claude-dropdown-item:has-text("Auto (Autonomous)")')
    await autoOption.click()
    await expect(page.locator('.claude-pill-btn:has-text("Auto")')).toBeVisible()
  })

  test('Seamless toggle between Hub view and Code Workspace', async ({ page }) => {
    await page.goto(`${CONSOLE_BASE_URL}/cloud-agent`, { waitUntil: 'networkidle' })

    // Verify Hub view is active initially
    await expect(page.locator('.claude-hub-view')).toBeVisible()

    // Switch to Code Workspace via Header toggle
    const workspaceToggle = page.locator('.cloud-ide-mode-btn:has-text("Code Workspace")')
    await workspaceToggle.click()

    // Verify IDE 3-Column Workbench is displayed
    await expect(page.locator('.ide-workspace-view')).toBeVisible()
    await expect(page.locator('.ide-explorer-col')).toBeVisible()
    await expect(page.locator('.ide-editor-col')).toBeVisible()
    await expect(page.locator('.ide-agent-col')).toBeVisible()

    // Switch back to Hub
    const hubToggle = page.locator('.cloud-ide-mode-btn:has-text("Agent Hub")')
    await hubToggle.click()
    await expect(page.locator('.claude-hub-view')).toBeVisible()
  })

  test('Workable File Explorer: lists client test files, creates new files, edits code, runs terminal', async ({ page }) => {
    await page.goto(`${CONSOLE_BASE_URL}/cloud-agent`, { waitUntil: 'networkidle' })

    // Switch to Workspace
    await page.locator('.cloud-ide-mode-btn:has-text("Code Workspace")').click()
    await expect(page.locator('.ide-workspace-view')).toBeVisible()

    // Verify File Explorer lists client project files (React template by default)
    const explorer = page.locator('.ide-explorer-col')
    await expect(explorer).toContainText('src/App.tsx')
    await expect(explorer).toContainText('package.json')

    // Create a new file
    const newFileBtn = page.locator('.ide-explorer-btn[title="New File"]')
    await newFileBtn.click()

    const modal = page.locator('.ide-modal-backdrop')
    await expect(modal).toBeVisible()
    await page.fill('.ide-modal-input', 'src/components/TestWidget.tsx')
    await page.click('.ide-modal-submit:has-text("Create File")')

    // Verify new file appears in explorer and tab opens
    await expect(explorer).toContainText('TestWidget.tsx')
    await expect(page.locator('.ide-tabs-bar')).toContainText('TestWidget.tsx')

    // Edit code in the editor
    const editor = page.locator('.ide-code-textarea')
    await editor.fill('export const TestWidget = () => {\n  return <div>Lucifer Workable IDE Widget</div>\n}')

    // Verify AST status is Valid
    await expect(page.locator('.ide-ast-indicator')).toContainText('AST Clean')

    // Test Terminal commands
    const terminalInput = page.locator('.ide-terminal-input')
    await terminalInput.fill('ls')
    await terminalInput.press('Enter')
    await expect(page.locator('.ide-terminal-output')).toContainText('src/components/TestWidget.tsx')

    // Run test command
    await terminalInput.fill('test')
    await terminalInput.press('Enter')
    await expect(page.locator('.ide-terminal-output')).toContainText('AST Syntax Check PASS')

    // Switch template to Python FastAPI
    await page.locator('.ide-explorer-col button:has-text("Python")').click()
    await expect(explorer).toContainText('main.py')
    await expect(explorer).toContainText('requirements.txt')
  })

  test('Typing greeting "Hello" stays in Hub view with Lucifer conversational response, suggestion chips, and New Chat revert', async ({ page }) => {
    await page.goto(`${CONSOLE_BASE_URL}/cloud-agent`, { waitUntil: 'networkidle' })

    // Verify initial Hub Landing
    await expect(page.locator('.claude-hub-greeting')).toContainText('Back at it, Lucifer')

    // Type "Hello" in prompt box and submit
    const promptInput = page.locator('.claude-prompt-textarea')
    await promptInput.fill('Hello')
    await promptInput.press('Enter')

    // Verify view STAYS in Hub view (.claude-hub-view), does NOT violently switch to ide-workspace-view
    await expect(page.locator('.claude-hub-view')).toBeVisible()
    await expect(page.locator('.ide-workspace-view')).not.toBeVisible()

    // Verify User chat bubble exists with "Hello"
    const userBubble = page.locator('.claude-chat-bubble-user')
    await expect(userBubble).toBeVisible()
    await expect(userBubble).toContainText('Hello')

    // Wait for Lucifer response bubble (exclude transient thinking indicator)
    await expect(page.locator('.claude-chat-bubble-agent:has-text("connected directly to your workspace"), .claude-chat-bubble-agent:has-text("Hello Lucifer")')).toBeVisible({ timeout: 30000 })

    // Verify suggestion chips are present
    const chips = page.locator('.claude-chat-chip')
    await expect(chips.first()).toBeVisible()
    await expect(page.locator('.claude-chat-chip:has-text("Tree-Sitter AST Audit"), .claude-chat-chip:has-text("Run AST Audit")')).toBeVisible()

    // Verify Top Bar has "New Chat / Revert" button
    const revertBtn = page.locator('.claude-chat-revert-btn')
    await expect(revertBtn).toBeVisible()

    // Click Revert button
    await revertBtn.click()

    // Verify returns cleanly to "Back at it, Lucifer" empty state
    await expect(page.locator('.claude-hub-greeting')).toBeVisible()
    await expect(page.locator('.claude-chat-bubble-user')).not.toBeVisible()
  })

  test('Multimodal Studios: Watermarked Asset Downloads (.WAV, .WEBM, .PNG, .PDF) and Social Sharing Modal', async ({ page }) => {
    await page.goto(`${CONSOLE_BASE_URL}/cloud-agent`, { waitUntil: 'networkidle' })

    // Switch to Workspace
    await page.locator('.cloud-ide-mode-btn:has-text("Code Workspace")').click()
    await expect(page.locator('.ide-workspace-view')).toBeVisible()

    // 1. Sonic DAW Studio Tab
    await page.locator('.ide-bottom-tab-btn:has-text("Sonic DAW")').click()
    const sonicWatermark = page.locator('.sonic-daw-panel .onyx-watermark-pill')
    await expect(sonicWatermark).toBeVisible()
    await expect(sonicWatermark).toContainText('ONYX AI · COPYRIGHTED AUDIO')

    const wavDownloadBtn = page.locator('.sonic-daw-panel .onyx-asset-btn:has-text("⬇ .WAV")')
    await expect(wavDownloadBtn).toBeVisible()

    // 2. Video Studio Tab
    await page.locator('.ide-bottom-tab-btn:has-text("Video Pipeline")').click()
    const videoWatermark = page.locator('.video-studio-panel .onyx-watermark-pill')
    await expect(videoWatermark).toBeVisible()
    await expect(videoWatermark).toContainText('ONYX AI · COPYRIGHTED VIDEO')

    const webmDownloadBtn = page.locator('.video-studio-panel .onyx-asset-btn:has-text("⬇ .WEBM")')
    await expect(webmDownloadBtn).toBeVisible()

    // 3. Image Studio Tab
    await page.locator('.ide-bottom-tab-btn:has-text("Image")').click()
    const imageWatermark = page.locator('.image-studio-panel .onyx-watermark-pill')
    await expect(imageWatermark).toBeVisible()
    await expect(imageWatermark).toContainText('ONYX AI · COPYRIGHTED IMAGE')

    const pngDownloadBtn = page.locator('.image-studio-panel .onyx-asset-btn:has-text("⬇ .PNG")')
    await expect(pngDownloadBtn).toBeVisible()

    // 4. Docling PDF Studio Tab
    await page.locator('.ide-bottom-tab-btn:has-text("Docling PDF AST")').click()
    const pdfWatermark = page.locator('.pdf-studio-panel .onyx-watermark-pill')
    await expect(pdfWatermark).toBeVisible()
    await expect(pdfWatermark).toContainText('ONYX AI · COPYRIGHTED PDF')

    const pdfDownloadBtn = page.locator('.pdf-studio-panel .onyx-asset-btn:has-text("⬇ .PDF")')
    await expect(pdfDownloadBtn).toBeVisible()

    // Open Share Modal from PDF Studio
    const shareBtn = page.locator('.pdf-studio-panel .onyx-asset-btn:has-text("🔗 Share")')
    await expect(shareBtn).toBeVisible()
    await shareBtn.click()

    // Verify Share Modal appears with all required copyright and social broadcast elements
    const shareModal = page.locator('.onyx-share-modal-overlay')
    await expect(shareModal).toBeVisible()
    await expect(shareModal).toContainText('Share AI Asset')
    await expect(shareModal).toContainText('Copyright Watermark ID')
    await expect(shareModal).toContainText('COPYRIGHTED BY ONYX AI')
    await expect(shareModal).toContainText('Public Asset Link')
    await expect(shareModal.locator('.onyx-social-btn:has-text("Share on X")')).toBeVisible()
    await expect(shareModal.locator('.onyx-social-btn:has-text("LinkedIn")')).toBeVisible()
    await expect(shareModal.locator('.onyx-social-btn:has-text("Native Share")')).toBeVisible()
    await expect(shareModal.locator('.onyx-asset-btn.primary:has-text("Download Watermarked File")')).toBeVisible()

    // Test Copy Link Button and Toast
    const copyLinkBtn = shareModal.locator('button:has-text("Copy Link")')
    await copyLinkBtn.click()
    await expect(page.locator('.onyx-floating-toast')).toBeVisible()

    // Close Modal
    await shareModal.locator('button:has-text("Close")').click()
    await expect(shareModal).not.toBeVisible()
  })

  test('Multi-Format & Resolution Encoders with Dynamic Token Capacity Gauges', async ({ page }) => {
    await page.goto(`${CONSOLE_BASE_URL}/cloud-agent`, { waitUntil: 'networkidle' })

    // Switch to Workspace
    await page.locator('.cloud-ide-mode-btn:has-text("Code Workspace")').click()
    await expect(page.locator('.ide-workspace-view')).toBeVisible()

    // 1. Sonic DAW: Switch Format to MP3 and Sample Rate to 96kHz
    await page.locator('.ide-bottom-tab-btn:has-text("Sonic DAW")').click()
    const audioSelect = page.locator('.sonic-daw-panel .onyx-format-select').first()
    await expect(audioSelect).toBeVisible()
    await audioSelect.selectOption('mp3')
    await expect(page.locator('.sonic-daw-panel .onyx-asset-btn:has-text("⬇ .MP3")')).toBeVisible()
    await expect(page.locator('.sonic-daw-panel .onyx-token-capacity-badge')).toContainText('Tokens')

    // 2. Video Pipeline: Switch to 4K UHD and MP4 Container
    await page.locator('.ide-bottom-tab-btn:has-text("Video Pipeline")').click()
    const videoFmtSelect = page.locator('.video-studio-panel .onyx-format-select').first()
    await videoFmtSelect.selectOption('mp4')
    const videoResSelect = page.locator('.video-studio-panel .onyx-format-select').nth(1)
    await videoResSelect.selectOption('4k')
    await expect(page.locator('.video-studio-panel .onyx-asset-btn:has-text("⬇ .MP4")')).toBeVisible()
    await expect(page.locator('.video-studio-panel .onyx-token-capacity-badge')).toContainText('168,000 Tokens')

    // 3. Image Studio: Switch to SVG and Banner (1500x500)
    await page.locator('.ide-bottom-tab-btn:has-text("Image")').click()
    const imgFmtSelect = page.locator('.image-studio-panel .onyx-format-select').first()
    await imgFmtSelect.selectOption('svg')
    await expect(page.locator('.image-studio-panel .onyx-asset-btn:has-text("⬇ .SVG")')).toBeVisible()
    await expect(page.locator('.image-studio-panel .onyx-token-capacity-badge')).toContainText('1,800 Tokens')

    // 4. Open Share Modal and verify format & token capacity metadata
    await page.locator('.image-studio-panel .onyx-asset-btn:has-text("🔗 Share")').click()
    const shareModal = page.locator('.onyx-share-modal-overlay')
    await expect(shareModal).toBeVisible()
    await expect(shareModal.locator('.onyx-encoder-pill:has-text("SVG")')).toBeVisible()
    await expect(shareModal.locator('.onyx-token-capacity-badge:has-text("1,800 Tokens")')).toBeVisible()
    await shareModal.locator('button:has-text("Close")').click()
  })

  test('Engineering Role Architecture & TechStack-Differentiated Token Capacity', async ({ page }) => {
    await page.goto(`${CONSOLE_BASE_URL}/cloud-agent`, { waitUntil: 'networkidle' })

    // 1. Verify Role Architecture Bar is rendered in Hub view
    const roleBar = page.locator('.claude-hub-view .onyx-role-architecture-bar').first()
    await expect(roleBar).toBeVisible()

    // Verify all 5 engineering roles exist
    const genPill = roleBar.locator('.onyx-role-pill:has-text("Code Gen")')
    const qaPill = roleBar.locator('.onyx-role-pill:has-text("QA & Tests")')
    const reviewPill = roleBar.locator('.onyx-role-pill:has-text("Code Review")')
    const fixPill = roleBar.locator('.onyx-role-pill:has-text("Bug Fixing")')
    const livePill = roleBar.locator('.onyx-role-pill:has-text("Live Testing")')

    await expect(genPill).toBeVisible()
    await expect(qaPill).toBeVisible()
    await expect(reviewPill).toBeVisible()
    await expect(fixPill).toBeVisible()
    await expect(livePill).toBeVisible()

    // Verify default active state (Code Gen is active initially)
    await expect(genPill).toHaveClass(/active/)

    // 2. Switch to QA & Tests Role and verify dynamic token capacity update
    await qaPill.evaluate((el: HTMLElement) => el.click())
    await expect(qaPill).toHaveClass(/active/)
    await expect(roleBar.locator('.onyx-token-pill-count')).toContainText('24,300')

    // 3. Switch Complexity Tier to L4 High-Scale and verify token expansion
    const l4Chip = roleBar.locator('.onyx-complexity-chip:has-text("L4 High-Scale")')
    await l4Chip.evaluate((el: HTMLElement) => el.click())
    await expect(l4Chip).toHaveClass(/active/)
    // QA on L4 TypeScript: 180,000 * 1.35 = 243,000 Tokens
    await expect(roleBar.locator('.onyx-token-pill-count')).toContainText('243,000')

    // 4. Switch TechStack to Rust / Tokio
    const stackSelect = roleBar.locator('.onyx-techstack-select')
    await stackSelect.selectOption('rust')
    // Rust L4 with QA is max capped at 256,000 Tokens
    await expect(roleBar.locator('.onyx-token-pill-count')).toContainText('256,000')
    await expect(roleBar.locator('.onyx-guard-pill:has-text("Borrow Checker")')).toBeVisible()

    // 5. Switch to Code Review Role
    await reviewPill.evaluate((el: HTMLElement) => el.click())
    await expect(reviewPill).toHaveClass(/active/)

    // 6. Switch to Bug Fixing Role on L2 Python
    await fixPill.evaluate((el: HTMLElement) => el.click())
    await expect(fixPill).toHaveClass(/active/)
    await stackSelect.selectOption('python')
    const l2Chip = roleBar.locator('.onyx-complexity-chip:has-text("L2 Module")')
    await l2Chip.evaluate((el: HTMLElement) => el.click())
    // Python L2: 16,000 * 0.9 = 14,400 Tokens
    await expect(roleBar.locator('.onyx-token-pill-count')).toContainText('14,400')
    await expect(roleBar.locator('.onyx-guard-pill:has-text("Python AST")')).toBeVisible()

    // 7. Verify IDE Workspace renders compact Role Architecture Bar
    await page.locator('.cloud-ide-mode-btn:has-text("Code Workspace")').evaluate((el: HTMLElement) => el.click())
    await expect(page.locator('.ide-workspace-view')).toBeVisible()
    const ideRoleBar = page.locator('.ide-agent-col .onyx-role-architecture-bar.compact')
    await expect(ideRoleBar).toBeVisible()
    await expect(ideRoleBar.locator('.onyx-role-pill:has-text("Live Testing")')).toBeVisible()

    // 8. Test Role interaction: Send QA prompt in IDE and verify QA Test Suite response
    const ideQaPill = ideRoleBar.locator('.onyx-role-pill:has-text("QA & Tests")')
    await ideQaPill.evaluate((el: HTMLElement) => el.click())
    const idePromptInput = page.locator('.ide-agent-input')
    await idePromptInput.fill('Generate complete test suite for active code')
    await page.locator('.ide-agent-prompt-bar button[type="submit"]').click()

    // Verify Agent Lucifer generates QA Response and Test Suite patch
    const qaMsg = page.locator('.ide-agent-chat-list .agent-msg-bubble:has(.agent-apply-btn)')
    await expect(qaMsg).toBeVisible({ timeout: 15000 })
    await expect(qaMsg).toContainText('QA & Test Suite Synthesis')
    await expect(qaMsg.locator('.agent-apply-btn')).toBeVisible()
  })
})
