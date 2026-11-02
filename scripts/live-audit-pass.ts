import { spawn } from "child_process";

async function main() {
  console.log("=== Onyx Zero-Trust Live End-to-End Simulation ===");

  const server = spawn("bun", ["run", "onyx-dev-server.ts"], { stdio: "pipe" });
  await new Promise((r) => setTimeout(r, 1500));

  const endpoints = [
    { name: "Health Check", url: "http://localhost:3000/api/health", method: "GET", expected: 200 },
    { name: "API v1 Version", url: "http://localhost:3000/api/v1/version", method: "GET", expected: 200 },
    { name: "API v1 Auth Status", url: "http://localhost:3000/api/v1/auth/status", method: "GET", expected: 200 },
    { name: "API v1 Auth Login", url: "http://localhost:3000/api/v1/auth/login", method: "POST", expected: 200, body: { email: "audit-bot@example.com" } },
    { name: "Models Catalog", url: "http://localhost:3000/api/models", method: "GET", expected: 200 },
    { name: "Free Models ($0/1M)", url: "http://localhost:3000/api/models/free", method: "GET", expected: 200 },
    { name: "BYOAI Test Endpoint", url: "http://localhost:3000/api/byoai/test", method: "POST", expected: 200, body: { type: "local", provider: "ollama" } },
    { name: "Tech Stacks Catalog", url: "http://localhost:3000/api/stacks", method: "GET", expected: 200 },
    { name: "Security Skills Catalog", url: "http://localhost:3000/api/security/skills", method: "GET", expected: 200 },
    { name: "Security Code Evaluator", url: "http://localhost:3000/api/security/evaluate", method: "POST", expected: 200, body: { code: "eval(1)" } },
    { name: "Legal Audit Report", url: "http://localhost:3000/api/legal/audit-report", method: "GET", expected: 200 },
    { name: "MotionSites Templates", url: "http://localhost:3000/api/motionsites/templates", method: "GET", expected: 200 },
    { name: "Circuit Breaker Telemetry", url: "http://localhost:3000/api/throttler/status", method: "GET", expected: 200 },
    { name: "Contract 404 Trap", url: "http://localhost:3000/api/non-existent-route-contract-test", method: "GET", expected: 404 },
    { name: "UI Route [/]", url: "http://localhost:3000/", method: "GET", expected: 200 },
    { name: "UI Route [/login]", url: "http://localhost:3000/login", method: "GET", expected: 200 },
    { name: "UI Route [/dashboard]", url: "http://localhost:3000/dashboard", method: "GET", expected: 200 },
    { name: "UI Route [/settings]", url: "http://localhost:3000/settings", method: "GET", expected: 200 },
  ];

  let passCount = 0;
  let failCount = 0;

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: { "Content-Type": "application/json" },
        body: ep.body ? JSON.stringify(ep.body) : undefined,
      });

      const pass = res.status === ep.expected;
      if (pass) passCount++;
      else failCount++;

      console.log(
        `[${pass ? "PASS" : "FAIL"}] ${ep.name.padEnd(26)} | ${ep.method} ${ep.url.padEnd(52)} | HTTP ${res.status} (Expected ${ep.expected})`
      );
    } catch (e: any) {
      failCount++;
      console.log(`[FAIL] ${ep.name.padEnd(26)} | Error: ${e.message}`);
    }
  }

  console.log(`\nSimulation Summary: ${passCount} Passed, ${failCount} Failed.`);
  server.kill();
  process.exit(failCount === 0 ? 0 : 1);
}

main();
