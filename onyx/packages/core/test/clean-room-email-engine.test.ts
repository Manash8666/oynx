import { describe, expect, test } from "bun:test"
import { CleanRoomEmailEngine } from "../src/email/clean-room-email-engine"

describe("Clean-Room Email Engine (MIT Replacement for AGPL OpenEMM)", () => {
  const emailEngine = new CleanRoomEmailEngine("MOCK", "test-key", "notifications.onyx.dev")

  test("should generate RFC 8058 one-click unsubscribe and CAN-SPAM compliance headers", () => {
    const headers = emailEngine.buildComplianceHeaders("developer@example.com")
    expect(headers["List-Unsubscribe"]).toContain("https://notifications.onyx.dev/api/email/unsubscribe")
    expect(headers["List-Unsubscribe"]).toContain("mailto:optout@notifications.onyx.dev")
    expect(headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click")
    expect(headers["List-Id"]).toBe("<onyx-dev-platform.notifications.onyx.dev>")
    expect(headers["X-Entity-Ref-ID"]).toBeDefined()
  })

  test("should render developer welcome email template with dark mode styling", () => {
    const template = emailEngine.renderTemplate("DEVELOPER_WELCOME", {
      name: "Alex",
      url: "https://studio.onyx.dev",
    })
    expect(template.subject).toContain("Welcome to Onyx")
    expect(template.text).toContain("Hello Alex,")
    expect(template.html).toContain("#0B0F17") // Onyx deep charcoal/dark theme
    expect(template.html).toContain("Open Onyx Studio")
  })

  test("should render security alert template with critical diagnostic highlights", () => {
    const template = emailEngine.renderTemplate("SECURITY_ALERT", {
      name: "Security Lead",
      summary: "Unauthorized scraper pattern intercepted",
      details: "Attempted use of meta.ai cookie scraper blocked.",
    })
    expect(template.subject).toContain("🚨 [Security Alert]")
    expect(template.html).toContain("#EF4444")
    expect(template.text).toContain("Unauthorized scraper pattern intercepted")
  })

  test("should render legal audit report notification", () => {
    const template = emailEngine.renderTemplate("LICENSE_AUDIT_REPORT", {
      name: "Compliance Officer",
      summary: "40 audited repositories: 0 AGPL copyleft violations.",
    })
    expect(template.subject).toContain("📜 [Legal Audit]")
    expect(template.html).toContain("#10B981") // Emerald green
    expect(template.text).toContain("100% Commercial-Safe")
  })

  test("should dispatch emails and record delivery metadata with zero viral dependencies", async () => {
    emailEngine.clearSentMessages()
    const result = await emailEngine.dispatchEmail({
      to: [{ email: "dev@onyx.dev", name: "Lead Engineer" }],
      from: "alerts@notifications.onyx.dev",
      subject: "Test Dispatch",
      html: "<p>Test message</p>",
    })

    expect(result.status).toBe("DELIVERED")
    expect(result.provider).toBe("MOCK")
    expect(result.recipientCount).toBe(1)
    expect(result.complianceHeaders["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click")
    expect(emailEngine.getSentMessages().length).toBe(1)
  })
})
