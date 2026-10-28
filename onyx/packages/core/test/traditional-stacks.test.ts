import { describe, expect, test } from "bun:test"
import { TraditionalTechStackRegistry } from "../src/stacks/traditional-stacks"

describe("Traditional Tech Stacks Integration in Onyx", () => {
  test("should register all 10 major traditional enterprise tech stacks", () => {
    const stacks = TraditionalTechStackRegistry.getAllStacks()
    expect(stacks.length).toBeGreaterThanOrEqual(10)

    const ids = stacks.map((s) => s.id)
    expect(ids).toContain("java-spring")
    expect(ids).toContain("python-backend")
    expect(ids).toContain("dotnet-csharp")
    expect(ids).toContain("node-typescript")
    expect(ids).toContain("golang-microservices")
    expect(ids).toContain("cpp-systems")
    expect(ids).toContain("rust-systems")
    expect(ids).toContain("php-laravel")
    expect(ids).toContain("ruby-rails")
    expect(ids).toContain("sql-relational")
  })

  test("should identify stack by file extension and provide compiler/test commands", () => {
    // Java
    const javaStack = TraditionalTechStackRegistry.getByExtension(".java")
    expect(javaStack?.id).toBe("java-spring")
    expect(javaStack?.buildCommand).toBe("mvn clean compile")
    expect(javaStack?.defaultLspServer).toBe("jdtls")

    // Python
    const pythonStack = TraditionalTechStackRegistry.getByExtension(".py")
    expect(pythonStack?.id).toBe("python-backend")
    expect(pythonStack?.testCommand).toBe("pytest")

    // C#
    const csharpStack = TraditionalTechStackRegistry.getByExtension(".cs")
    expect(csharpStack?.id).toBe("dotnet-csharp")
    expect(csharpStack?.defaultLspServer).toBe("OmniSharp")

    // C++
    const cppStack = TraditionalTechStackRegistry.getByExtension(".cpp")
    expect(cppStack?.id).toBe("cpp-systems")
    expect(cppStack?.defaultLspServer).toBe("clangd")

    // Rust
    const rustStack = TraditionalTechStackRegistry.getByExtension(".rs")
    expect(rustStack?.id).toBe("rust-systems")
    expect(rustStack?.buildCommand).toBe("cargo check")
  })

  test("should ensure every traditional stack has native Tree-Sitter AST parser support", () => {
    const stacks = TraditionalTechStackRegistry.getAllStacks()
    for (const stack of stacks) {
      expect(stack.hasTreeSitterSupport).toBe(true)
      expect(stack.commercialReadiness).toBe("PRODUCTION_READY")
    }
  })
})
