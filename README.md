# Onyx Code (`onyx.dev`)

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Repository](https://img.shields.io/badge/GitHub-Manash8666%2Foynx-181717.svg?logo=github)](https://github.com/Manash8666/oynx.git)

**Onyx** is a high-performance, legally compliant open-source AI IDE platform engineered from the ground up on Bun, TypeScript, and Ollama:
- **Local & Cloud Model Orchestration:** Ollama local offline runner (`qwen2.5-coder:1.5b`), DeepSeek (V3, R1, Coder), Qwen3, Gemma, Kimi K3, GLM-5, Nemotron, and gpt-oss.
- **Cinematic Web Builder & Creative Canvas:** MotionSites UI generation engine with 67+ prompt templates and Sketch.js kinetic canvas particle animation loops.
- **Cloudflare Vibe Sandbox:** Ephemeral sandboxed worker execution, edge AI gateway caching, and live streaming artifact previews.
- **Self-Improving Agents:** Adaptive project memory, continuous reflection loops, and autonomous multi-agent swarm coordinator.
- **Document & Legal Intelligence:** Clean-room document chunking, contract liability analysis, and automated CI/CD legal compliance gating.
- **Generative Media Studio:** Multimodal video, image, and audio generation tools.
- **Clean-Room Email Engine:** Permissive multi-provider transactional delivery (Resend/SendGrid/SES) with RFC 8058 one-click unsubscribe compliance.

For detailed architecture, design specifications, and setup instructions, please see [ONYX_PLATFORM.md](ONYX_PLATFORM.md).

## 📄 Licensing, Compliance & EULA
- **Open-Source Community:** Licensed under the **[GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE)**. Free to use, self-host, and inspect.
- **Enterprise Commercial EULA:** Closed-source enterprise licenses waiving copyleft requirements are governed by the **[End User License Agreement (EULA.md)](EULA.md)**.
- **Regulatory Compliances:** Detailed regulatory, privacy, EAR, and model AUP compliance standards are documented in **[COMPLIANCE.md](COMPLIANCE.md)**.
- **Customer Code Ownership:** Under both AGPL and EULA, the customer retains **100% exclusive copyright and ownership** of all generated and assisted code.

## Quickstart
```bash
# 1. Run Automated Legal Compliance Gate (0 Violations Verified)
cd onyx
bun run check:legal

# 2. Run Comprehensive Core Test Suite (100% Passing)
bun test packages/core/test/clean-room-legal-engine.test.ts \
         packages/core/test/clean-room-email-engine.test.ts \
         packages/core/test/cloudflare-vibe-sandbox.test.ts \
         packages/core/test/sketch-canvas-engine.test.ts \
         packages/core/test/cybersecurity-skills.test.ts \
         packages/core/test/gtm-growth-engine.test.ts

# 3. Launch Onyx Dev Server & Web Studio
bun run onyx-dev-server.ts
```
