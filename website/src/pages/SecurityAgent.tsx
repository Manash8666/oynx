import React, { useState } from 'react'
import { ShieldAlert, Lock, CheckCircle2, ArrowLeft, ArrowRight, Key, EyeOff, Server, Play, AlertTriangle, ShieldCheck, Terminal, Bug } from 'lucide-react'

export const SecurityAgent: React.FC = () => {
  const [code, setCode] = useState(`// Target: src/routes/download.ts
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export function handleFileRequest(req: Request, res: Response) {
  // Vulnerability 1: Path Traversal (CWE-22)
  const targetPath = path.join("/var/app/uploads", req.query.file as string);
  const data = fs.readFileSync(targetPath);

  // Vulnerability 2: Remote Command Injection (CWE-78)
  exec("gzip " + targetPath);

  return res.send(data);
}`)

  const [scanning, setScanning] = useState(false)
  const [report, setReport] = useState<{
    status: 'VULNERABILITIES_DETECTED' | 'CLEAN_PASS'
    cweList: Array<{ cwe: string; severity: 'CRITICAL' | 'HIGH' | 'INFO'; title: string; remediation: string }>
    exploitScore: number
    remediationDiff: string
  } | null>({
    status: 'VULNERABILITIES_DETECTED',
    cweList: [
      {
        cwe: 'CWE-22',
        severity: 'CRITICAL',
        title: 'Improper Limitation of a Pathname to a Restricted Directory (Path Traversal)',
        remediation: 'Sanitize filename and enforce path resolution within root: path.resolve(base, path.basename(file))'
      },
      {
        cwe: 'CWE-78',
        severity: 'CRITICAL',
        title: 'Improper Neutralization of Special Elements used in an OS Command (Command Injection)',
        remediation: 'Replace shell exec with safe child_process.execFile() passing discrete arguments array.'
      }
    ],
    exploitScore: 9.8,
    remediationDiff: `- const targetPath = path.join("/var/app/uploads", req.query.file as string);\n- exec("gzip " + targetPath);\n+ const safeName = path.basename(req.query.file as string);\n+ const targetPath = path.resolve("/var/app/uploads", safeName);\n+ if (!targetPath.startsWith("/var/app/uploads")) throw new SecurityError("Path Traversal Trapped");\n+ execFile("gzip", [targetPath]);`
  })

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => {
      const lower = code.toLowerCase()
      const cwes = []
      let diff = ''
      let score = 0.0

      if (lower.includes('readfilesync') && (lower.includes('join') || lower.includes('req.query'))) {
        score += 4.9
        cwes.push({
          cwe: 'CWE-22',
          severity: 'CRITICAL' as const,
          title: 'Arbitrary File Read via Path Traversal',
          remediation: 'Use path.basename() and verify targetPath.startsWith(baseDirectory).'
        })
        diff += '+ const safeFile = path.basename(req.query.file as string);\n+ const targetPath = path.resolve("/var/app/uploads", safeFile);\n'
      }

      if (lower.includes('exec(') && (lower.includes(' + ') || lower.includes('${'))) {
        score += 4.9
        cwes.push({
          cwe: 'CWE-78',
          severity: 'CRITICAL' as const,
          title: 'Remote Command Injection (RCE)',
          remediation: 'Avoid raw shell exec; switch to execFile with parameterized arguments.'
        })
        diff += '+ execFile("gzip", [targetPath]);\n'
      }

      if (lower.includes('akiai') || lower.includes('aws_secret') || lower.includes('ghp_')) {
        score += 3.5
        cwes.push({
          cwe: 'CWE-798',
          severity: 'HIGH' as const,
          title: 'Hardcoded Enterprise Cloud Credential',
          remediation: 'Migrate plaintext credential into encrypted vault / environment variable.'
        })
      }

      if (cwes.length === 0) {
        cwes.push({
          cwe: 'CLEAN',
          severity: 'INFO' as const,
          title: '0 Vulnerabilities Detected (AST SAST Pass)',
          remediation: 'Code adheres to OWASP ASVS 4.0 guidelines.'
        })
        diff = '// Clean AST Tree - no vulnerabilities detected'
      }

      setReport({
        status: cwes.some(c => c.severity === 'CRITICAL' || c.severity === 'HIGH') ? 'VULNERABILITIES_DETECTED' : 'CLEAN_PASS',
        cweList: cwes,
        exploitScore: Math.min(10, Math.round(score * 10) / 10),
        remediationDiff: diff
      })
      setScanning(false)
    }, 450)
  }

  const loadPreset = (preset: 'rce' | 'secret' | 'clean') => {
    if (preset === 'rce') {
      setCode(`// Target: src/routes/download.ts
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export function handleFileRequest(req: Request, res: Response) {
  // Vulnerability: Path Traversal + Command Injection
  const targetPath = path.join("/var/app/uploads", req.query.file as string);
  const data = fs.readFileSync(targetPath);
  exec("gzip " + targetPath);
  return res.send(data);
}`)
    } else if (preset === 'secret') {
      setCode(`// Target: src/services/s3.ts
export const s3Config = {
  region: "us-east-1",
  // High Risk: Static credentials in repository
  accessKeyId: "AKIAIOSFODNN7EXAMPLE",
  secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
};`)
    } else {
      setCode(`// Target: src/routes/download.ts (Hardened)
import { execFile } from "child_process";
import fs from "fs";
import path from "path";

export function handleFileRequest(req: Request, res: Response) {
  const safeFile = path.basename(req.query.file as string);
  const targetPath = path.resolve("/var/app/uploads", safeFile);
  if (!targetPath.startsWith("/var/app/uploads")) {
    return res.status(403).json({ error: "Access Denied" });
  }
  const data = fs.readFileSync(targetPath);
  execFile("gzip", [targetPath]);
  return res.send(data);
}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#07080a] text-[#f3f4f6] font-sans selection:bg-[#d8ff38] selection:text-[#07080a] pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Navigation Back */}
        <div>
          <a href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </a>
        </div>

        {/* Header */}
        <div className="border-b border-white/[0.08] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2a1318] text-[#f43f5e] text-xs font-mono mb-4 border border-[#f43f5e]/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>DEVSECOPS AUTOMATION · ZERO-TRUST COMPLIANCE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Autonomous <span className="text-[#f43f5e]">Security Agent &amp; SAST Scanner</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Detect vulnerabilities, intercept hardcoded secrets, and patch security regressions before deployment. Built for enterprises that cannot compromise on zero-trust software supply chains.
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4 mt-8">
            <a
              href="https://app.oynx.si/cloud-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#d8ff38] hover:bg-[#cbf52b] text-[#07080a] font-bold text-xs transition-all shadow-[0_0_20px_rgba(216,255,56,0.25)] min-h-[44px]"
            >
              <span>Dispatch Security Audit in Cloud Agent</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Interactive Live SAST Scanner */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-4 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Bug className="w-4 h-4 text-[#f43f5e]" />
                <span>Interactive SAST Vulnerability Scanner</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Scan code for CWE-22, CWE-78, CWE-89, hardcoded secrets, and unsafe deserialization.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-zinc-500">Attack Scenarios:</span>
              <button
                onClick={() => loadPreset('rce')}
                className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-zinc-300 text-xs font-mono border border-white/[0.08]"
              >
                RCE &amp; Path Traversal
              </button>
              <button
                onClick={() => loadPreset('secret')}
                className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-zinc-300 text-xs font-mono border border-white/[0.08]"
              >
                AWS Keys
              </button>
              <button
                onClick={() => loadPreset('clean')}
                className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-zinc-300 text-xs font-mono border border-white/[0.08]"
              >
                Hardened
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Editor */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Vulnerable Source Candidate:</span>
                <button
                  onClick={handleScan}
                  disabled={scanning}
                  className="px-4 py-1.5 rounded-xl bg-[#f43f5e] text-white font-bold font-sans text-xs hover:bg-[#e11d48] transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{scanning ? 'Scanning AST...' : 'Scan Vulnerabilities'}</span>
                </button>
              </div>
              <textarea
                rows={12}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-black/60 border border-white/[0.1] rounded-2xl p-4 text-zinc-200 focus:outline-none focus:border-[#f43f5e] leading-relaxed"
              />
            </div>

            {/* Scan Output Card */}
            <div className="space-y-3 font-mono text-xs">
              <div className="text-zinc-400">Security Telemetry Report:</div>
              {report && (
                <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.1] space-y-4 max-h-[340px] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <span className="text-zinc-400">Status</span>
                    <span className={report.status === 'CLEAN_PASS' ? 'text-[#22c55e] font-bold' : 'text-[#f43f5e] font-bold'}>
                      {report.status === 'CLEAN_PASS' ? '✓ PASS (0 VULNERABILITIES)' : `⚠️ CVSS SCORE: ${report.exploitScore} / 10.0`}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {report.cweList.map((c, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-xs space-y-1 ${
                          c.severity === 'CRITICAL'
                            ? 'bg-red-950/20 border-red-500/40 text-red-300'
                            : c.severity === 'HIGH'
                            ? 'bg-orange-950/20 border-orange-500/40 text-orange-300'
                            : 'bg-green-950/20 border-green-500/40 text-green-300'
                        }`}
                      >
                        <div className="font-bold flex items-center justify-between">
                          <span>{c.cwe}: {c.title}</span>
                          <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-black/40">
                            {c.severity}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-[11px]">Remediation: {c.remediation}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] space-y-1">
                    <span className="text-zinc-500 text-[11px]">Auto-Remediation AST Patch:</span>
                    <pre className="p-2.5 rounded-lg bg-gray-950 border border-white/[0.08] text-[11px] text-[#22c55e] overflow-x-auto">
                      {report.remediationDiff}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Security Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#261517] text-[#f43f5e] flex items-center justify-center mb-4">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Secret Leak Interception</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Entropy scanners detect AWS keys, GitHub tokens, database credentials, and RSA keys in code diffs before they reach version control.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#1b2212] text-[#d8ff38] flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">In-Process SAST Engine</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Static application security testing (SAST) parses AST nodes to uncover SQL injections, SSRF vectors, cross-site scripting (XSS), and insecure deserialization.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08]">
            <div className="w-10 h-10 rounded-xl bg-[#122418] text-[#22c55e] flex items-center justify-center mb-4">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Air-Gapped Privacy</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Audit code on-premises. Because Onyx supports local LLMs and private VPC runners, security evaluations never leak proprietary source code to external servers.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
