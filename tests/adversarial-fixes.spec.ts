import { test, expect } from '@playwright/test'

test.describe('Adversarial Codebase Fixes & Upgrades (Google Antigravity Verification)', () => {
  const BASE_URL = 'http://localhost:3000'

  test('POST /api/v1/contact logs enterprise lead and returns reference ID', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/v1/contact`, {
      data: {
        name: 'Enterprise Architect',
        email: 'architect@enterprise.org',
        company: 'Global Defense Systems',
        teamSize: '50 - 250 developers',
        message: 'Requesting on-premise air-gapped VPC architecture deployment.'
      }
    })

    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data.ok).toBe(true)
    expect(data.status).toBe('DISPATCHED')
    expect(data.leadId).toMatch(/^lead-/)
  })

  test('POST /api/v1/contact rejects payload without email', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/v1/contact`, {
      data: {
        name: 'No Email User',
        company: 'Acme Corp'
      }
    })

    expect(res.status()).toBe(400)
    const data = await res.json()
    expect(data.error).toBeDefined()
  })

  test('POST /api/v1/vpc/request dispatches customized architecture package', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/v1/vpc/request`, {
      data: {
        email: 'devops-lead@boeing.internal',
        company: 'Aerospace Engineering Corp',
        provider: 'aws',
        seats: '200 - 1000 enterprise seats',
        notes: 'Strict air-gap, zero data egress requirement'
      }
    })

    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data.ok).toBe(true)
    expect(data.status).toBe('APPROVED')
    expect(data.requestId).toMatch(/^vpc-/)
    expect(data.zeroEgressEnforced).toBe(true)
  })

  test('POST /api/v1/code-review/analyze traps SQL injection and secret leaks', async ({ request }) => {
    const vulnerableCode = `
      const user = await db.query("SELECT * FROM users WHERE email = '" + req.body.email + "'");
      const key = "secret_key_123";
    `
    const res = await request.post(`${BASE_URL}/api/v1/code-review/analyze`, {
      data: { code: vulnerableCode, language: 'typescript' }
    })

    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data.ok).toBe(true)
    expect(data.diagnosticsCount).toBeGreaterThanOrEqual(1)
  })

  test('POST /api/v1/security/sast-scan detects CWE-22 and CWE-78', async ({ request }) => {
    const vulnerableCode = `
      const data = fs.readFileSync(path.join("/uploads", req.query.file));
      exec("gzip " + file);
    `
    const res = await request.post(`${BASE_URL}/api/v1/security/sast-scan`, {
      data: { code: vulnerableCode }
    })

    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data.ok).toBe(true)
    expect(data.status).toBe('VULNERABILITIES_DETECTED')
    expect(data.cweCount).toBeGreaterThanOrEqual(2)
  })

  test('UI Route /vpc is fully interactive with YAML generator and modal', async ({ page }) => {
    await page.goto(`${BASE_URL}/vpc`)
    await expect(page.locator('h1')).toContainText('Deployment Studio')

    // Verify Cloud Infrastructure buttons exist and update state
    await page.click('button:has-text("GCP GKE")')
    await expect(page.locator('pre')).toContainText('namespace: gcp-private-gke')

    await page.click('button:has-text("Azure AKS")')
    await expect(page.locator('pre')).toContainText('namespace: azure-private-aks')

    await page.click('button:has-text("Bare Metal K8s")')
    await expect(page.locator('pre')).toContainText('namespace: airgapped-baremetal')

    // Verify Copy button works
    await page.click('button:has-text("Copy")')
    await expect(page.locator('button:has-text("Copied")')).toBeVisible()

    // Open Enterprise Intake Modal
    await page.click('button:has-text("Request Enterprise Architecture Review")')
    await expect(page.locator('text=Request VPC Deployment Architecture')).toBeVisible()

    // Fill form and submit
    await page.fill('input[type="email"]', 'vp-cloud@defense.gov')
    await page.fill('input[placeholder*="JPMorgan"]', 'Defense Contracting Corp')
    await page.click('button:has-text("Dispatch Architecture Intake")')

    // Confirm dispatched message
    await expect(page.locator('text=VPC Specification Dispatched!')).toBeVisible()
    await expect(page.locator('text=Request ID:')).toBeVisible()
  })

  test('UI Route /code-reviewer provides interactive AST analysis', async ({ page }) => {
    await page.goto(`${BASE_URL}/code-reviewer`)
    await expect(page.locator('h1')).toContainText('AI Code Reviewer')

    // Click SQL Injection preset
    await page.click('button:has-text("SQL Injection")')
    await page.click('button:has-text("Run AST Review")')

    // Verify audit result
    await expect(page.locator('text=TREE-SITTER VERIFIED')).toBeVisible()
    await expect(page.locator('text=CWE-89 (SQL Injection)')).toBeVisible()
  })

  test('UI Route /security-agent provides interactive vulnerability scanner', async ({ page }) => {
    await page.goto(`${BASE_URL}/security-agent`)
    await expect(page.locator('h1')).toContainText('Security Agent')

    // Click RCE scenario and scan
    await page.click('button:has-text("RCE & Path Traversal")')
    await page.click('button:has-text("Scan Vulnerabilities")')

    // Verify findings
    await expect(page.locator('span:has-text("CWE-22:")')).toBeVisible()
    await expect(page.locator('text=CVSS SCORE:')).toBeVisible()
  })
})
