# Onyx Platform Compliance & Regulatory Standards
**Project:** Onyx Open-Source AI IDE Platform (`onyx.dev`)  
**Official Repository:** [`https://github.com/Manash8666/oynx.git`](https://github.com/Manash8666/oynx.git)  
**Author & Copyright:** Copyright (C) 2026 Manash Dash / Onyx Contributors  
**Primary Open-Source License:** GNU Affero General Public License v3.0 (AGPL-3.0)  
**Commercial Dual-License:** Onyx Commercial Enterprise License (EULA)  

---

## 1. Open-Source AGPL-3.0 Compliance Framework

Onyx is proudly licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)** to protect open-source collaboration, foster community innovation, and prevent closed-source cloud exploitation:

1. **Section 13 (Remote Network Interaction):**  
   Any user or organization that modifies Onyx and provides it as a hosted network service (SaaS) must prominently offer all interacting users access to the corresponding source code of the modified version under AGPL-3.0 at no charge.
2. **Source Code Availability:**  
   The complete source code of the Onyx platform is publicly available at <https://github.com/Manash8666/oynx.git>.
3. **Patent & Copyright Protections:**  
   Contributions to Onyx are governed by Section 11 of AGPL-3.0, granting worldwide, royalty-free patent licenses for all contributors' submissions.

---

## 2. Commercial Dual-Licensing Architecture

Onyx employs the proven dual-licensing business model (pioneered by Grafana, Cal.com, Plausible, and Mastodon):

- **Community Core (AGPL-3.0):**  
  Free of charge for individual developers, open-source projects, and teams operating under open copyleft terms.
- **Enterprise Edition (Commercial EULA):**  
  Available for organizations that require:
  - Exemption from AGPL-3.0 Section 13 network copyleft obligations.
  - Closed-source proprietary on-premises or internal cloud deployment.
  - Enterprise Service Level Agreements (SLAs), dedicated support, and indemnification.
  - Custom security hardening, SAML/SSO integration, and compliance reporting.

For commercial enterprise licensing inquiries, consult [EULA.md](EULA.md) or contact `licensing@onyx.dev`.

---

## 3. AI Foundation Model & Acceptable Use Policy (AUP) Compliance

Onyx orchestrates open-weight foundation models and sanctioned cloud APIs under strict adherence to their respective commercial licenses and Acceptable Use Policies:

| Model / Runtime | License | Compliance Standard & AUP Requirements |
| :--- | :--- | :--- |
| **`Qwen 2.5 / 3 Series`** | Apache 2.0 | Full commercial rights for SaaS, code generation, and fine-tuning. Adheres to Alibaba Cloud AI Ethics Guidelines. |
| **`DeepSeek V3 / R1 / Coder`** | MIT / DeepSeek License | Permissive commercial code synthesis. Complies with Section 5 Acceptable Use Policy (no illegal acts, fraud, or rights violations). |
| **`Google Gemma`** | Gemma Terms | Permissive commercial development. Strict adherence to Google Gemma Prohibited Use Policy (safety, non-weaponry, no medical diagnosis liability). |
| **`NVIDIA Nemotron`** | Apache 2.0 / Open Model | Enterprise code generation and evaluation under NVIDIA Open Model terms. |
| **`Zhipu AI GLM-5`** | Apache 2.0 | Permitted agentic engineering and commercial SaaS serving. |
| **`OpenAI gpt-oss`** | Apache 2.0 | Open weights deployed locally or in private infrastructure. |
| **`Ollama Local Runtime`** | MIT | 100% offline local inference on developer hardware. Zero external data transmission. |

---

## 4. Privacy, Data Sovereignty & Telemetry Standards

Onyx is engineered with a **Zero-Telemetry Default Architecture**:

1. **Local-First Code Privacy:**  
   When running offline local inference (via Ollama or local ONNX/llama.cpp engines), **zero bytes of code, prompts, completions, or keystrokes leave the developer's device**.
2. **General Data Protection Regulation (GDPR - EU 2016/679):**  
   - Zero unauthorized collection of Personally Identifiable Information (PII).
   - Right to Erasure: Local caches, logs, and project memory can be purged with a single command (`onyx cache clean`).
   - Clean-Room Email Engine incorporates RFC 8058 one-click unsubscribe headers and automated consent verification.
3. **California Consumer Privacy Act (CCPA / CPRA):**  
   Onyx does not sell, share, or monetize user data or synthesized source code.
4. **CAN-SPAM Act Compliance:**  
   Transactional email dispatch engines include physical mailing addresses, opt-out headers, and delivery logging.

---

## 5. Cybersecurity & Risk Management Standards

Onyx implements automated security controls mapped to recognized cybersecurity frameworks:

- **NIST CSF 2.0 (National Institute of Standards and Technology):**  
  Built-in cybersecurity agent skills mapped to Identify, Protect, Detect, Respond, and Recover tiers.
- **OWASP Top 10 & API Security:**  
  Real-time AST code guards detect SQL injection (A03), broken authentication (A01), hardcoded credentials (T1552), and insecure deserialization prior to file commits.
- **PTY Terminal Process Guardian:**  
  Terminal operations run within isolated pseudoterminal sandboxes with automatic git-backed snapshots for instant rollback upon command failure.
- **LSP Type-Safety Gate:**  
  Language Server Protocol compilation checks run continuously in-process to catch type errors before patches touch disk.

---

## 6. Software Bill of Materials (SBOM) & Supply Chain Security

To ensure complete supply chain transparency and compliance with executive orders on cybersecurity:

- **CycloneDX Specification:**  
  Onyx generates machine-readable CycloneDX v1.5 JSON SBOMs using [`onyx/script/onyx-sbom.ts`](onyx/script/onyx-sbom.ts).
- **Automated Monorepo Legal Gate:**  
  Every release candidate passes `bun run check:legal`, scanning 36+ package manifests and 6,300+ source files to verify 0 prohibited dependencies and 100% license integrity.

---

## 7. Export Administration Regulations (EAR) & Cryptography

Onyx complies with United States Export Administration Regulations (15 CFR Part 730 et seq.) and international Wassenaar Arrangement standards:

- Onyx source code is publicly available under AGPL-3.0 and qualifies for publicly available encryption software treatment under EAR § 742.15(b).
- No proprietary cryptographic backdoors or export-controlled munitions algorithms are embedded in the platform.
