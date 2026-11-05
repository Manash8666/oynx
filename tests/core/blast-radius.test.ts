import { describe, it, expect, beforeEach } from 'vitest';
import { DependencyGraphBuilder } from '../../src/core/ast/graph-builder.js';
import { BlastRadiusCalculator } from '../../src/core/impact/blast-radius-calculator.js';

describe('Semantic Blast-Radius & Dependency Impact Engine (Unique to Onyx)', () => {
  let graphBuilder: DependencyGraphBuilder;
  let calculator: BlastRadiusCalculator;

  beforeEach(() => {
    graphBuilder = new DependencyGraphBuilder();
    calculator = new BlastRadiusCalculator(graphBuilder);
  });

  it('should calculate direct, transitive, and test consumers of a modified symbol', () => {
    // File 1: Base auth interface & function
    const authCode = `
export interface UserSession {
  id: string;
}

export function validateSession(session: UserSession): boolean {
  return !!session.id;
}
`;
    // File 2: Direct consumer (API Route)
    const apiCode = `
import { validateSession, UserSession } from './auth.js';

export function handleRequest(session: UserSession): boolean {
  return validateSession(session);
}
`;
    // File 3: Transitive consumer (Controller)
    const controllerCode = `
import { handleRequest } from './api.js';

export function dispatch() {
  handleRequest({ id: "1" });
}
`;
    // File 4: Test file
    const testCode = `
import { validateSession } from './auth.js';

describe('auth test', () => {
  it('validates', () => {
    validateSession({ id: "1" });
  });
});
`;

    graphBuilder.addFile('src/auth.ts', authCode);
    graphBuilder.addFile('src/api.ts', apiCode);
    graphBuilder.addFile('src/controller.ts', controllerCode);
    graphBuilder.addFile('tests/auth.test.ts', testCode);

    const report = calculator.calculateImpact(
      'src/auth.ts',
      'validateSession',
      'export function validateSession(session: UserSession): boolean',
      'export function validateSession(session: UserSession): boolean'
    );

    expect(report.directConsumers.length).toBeGreaterThanOrEqual(1);
    expect(report.directConsumers.some((c) => c.filePath === 'src/api.ts')).toBe(true);
    expect(report.transitiveConsumers.some((c) => c.filePath === 'src/controller.ts')).toBe(true);
    expect(report.dependentTests.some((t) => t.filePath === 'tests/auth.test.ts')).toBe(true);
    expect(report.isBreakingChange).toBe(false);
  });

  it('should flag breaking change when signature adds required parameters or changes return type', () => {
    const oldSig = 'export function processPayment(amount: number): boolean';
    const newSigWithRequiredParam = 'export function processPayment(amount: number, currency: string): boolean';
    const newSigWithDifferentReturn = 'export function processPayment(amount: number): Promise<boolean>';

    expect(calculator.detectBreakingChange(oldSig, newSigWithRequiredParam)).toBe(true);
    expect(calculator.detectBreakingChange(oldSig, newSigWithDifferentReturn)).toBe(true);

    const nonBreakingSig = 'export function processPayment(amount: number, currency?: string): boolean';
    expect(calculator.detectBreakingChange(oldSig, nonBreakingSig)).toBe(false);
  });

  it('should calculate BRI and elevate severity to CRITICAL_BREAKING on breaking signature change', () => {
    graphBuilder.addFile(
      'src/user.ts',
      'export function getUser(id: string): string { return id; }'
    );
    graphBuilder.addFile(
      'src/service.ts',
      "import { getUser } from './user.js'; export function run() { getUser('1'); }"
    );

    const report = calculator.calculateImpact(
      'src/user.ts',
      'getUser',
      'export function getUser(id: string): string',
      'export function getUser(id: string, token: string): string' // Added required token
    );

    expect(report.isBreakingChange).toBe(true);
    expect(report.severity).toBe('CRITICAL_BREAKING');
    expect(report.breakingReason).toBeDefined();
  });
});
