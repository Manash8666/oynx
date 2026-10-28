import { describe, it, expect } from "bun:test"
import { parseDocumentNodes, analyzeLegalCompliance } from "../src/document-parser"

describe("Document & Legal Intelligence Engine (LlamaIndex-Inspired, MIT)", () => {
  it("should chunk source files into semantic AST nodes with line metadata", () => {
    const source = `function hello() {\n  return "world"\n}\n\nfunction goodbye() {\n  return "farewell"\n}`
    const nodes = parseDocumentNodes(source, { chunkSize: 50, language: "typescript" })
    
    expect(nodes.length).toBeGreaterThan(0)
    expect(nodes[0].metadata.startLine).toBeDefined()
    expect(nodes[0].content).toContain("hello")
  })

  it("should support recursive text splitting on paragraphs and newlines", () => {
    const text = `# Architecture Overview\n\nThis is paragraph one.\n\nThis is paragraph two detailing performance optimizations.`
    const nodes = parseDocumentNodes(text, { chunkSize: 40, language: "markdown" })
    
    expect(nodes.length).toBeGreaterThanOrEqual(2)
    expect(nodes[0].metadata.chunkIndex).toBe(0)
    expect(nodes[1].metadata.chunkIndex).toBe(1)
  })

  it("should flag copyleft AGPL licenses and terms of service risks in analyzed text", () => {
    const agplText = "This software is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0)."
    const assessment = analyzeLegalCompliance(agplText)
    
    expect(assessment.hasCopyleftRisk).toBe(true)
    expect(assessment.licenseDetected).toBe("AGPL-3.0")
    expect(assessment.recommendation).toContain("isolate")
  })

  it("should approve permissive MIT and Apache 2.0 licenses without copyleft warnings", () => {
    const mitText = "Permission is hereby granted, free of charge, to any person obtaining a copy of this software (MIT License)."
    const assessment = analyzeLegalCompliance(mitText)
    
    expect(assessment.hasCopyleftRisk).toBe(false)
    expect(assessment.licenseDetected).toBe("MIT")
    expect(assessment.isCommercialSafe).toBe(true)
  })

  it("should detect unauthorized scraping / TOS risk patterns", () => {
    const scraperText = "Extract cookies from the official web client to send free requests without an official API key for educational purposes only."
    const assessment = analyzeLegalCompliance(scraperText)
    
    expect(assessment.hasTOSViolationRisk).toBe(true)
    expect(assessment.recommendation).toContain("educational-only")
  })
})

