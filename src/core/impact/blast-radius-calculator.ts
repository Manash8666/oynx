import { ImpactGraphTraversal } from './graph-traversal.js';
import type { DependencyGraphBuilder } from '../ast/graph-builder.js';
import type { BlastRadiusReport, ImpactSeverity } from './types.js';

export class BlastRadiusCalculator {
  private traversal: ImpactGraphTraversal;

  constructor(graphBuilder: DependencyGraphBuilder) {
    this.traversal = new ImpactGraphTraversal(graphBuilder);
  }

  public calculateImpact(
    sourceFilePath: string,
    symbolName: string,
    oldSignature: string,
    newSignature: string
  ): BlastRadiusReport {
    const { direct, transitive, tests } = this.traversal.findConsumers(sourceFilePath, symbolName);

    const isBreaking = this.detectBreakingChange(oldSignature, newSignature);
    const serviceFiles = new Set(
      [...direct, ...transitive]
        .map((c) => c.filePath)
        .filter((p) => p.includes('/service') || p.includes('/api') || p.includes('/server'))
    );

    // BRI Formula: min(100, (N_direct * 5) + (N_transitive * 2) + (N_services * 15))
    const rawBri = direct.length * 5 + transitive.length * 2 + serviceFiles.size * 15;
    const blastRadiusIndex = Math.min(100, rawBri);

    let severity: ImpactSeverity = 'LOW';
    if (isBreaking) {
      severity = 'CRITICAL_BREAKING';
    } else if (blastRadiusIndex > 60 || serviceFiles.size > 2) {
      severity = 'HIGH';
    } else if (blastRadiusIndex > 25) {
      severity = 'MEDIUM';
    }

    return {
      symbolName,
      sourceFilePath,
      directConsumers: direct,
      transitiveConsumers: transitive,
      dependentTests: tests,
      blastRadiusIndex,
      severity,
      isBreakingChange: isBreaking,
      breakingReason: isBreaking ? 'Signature parameter count or required types changed incompatibly' : undefined,
    };
  }

  public detectBreakingChange(oldSig: string, newSig: string): boolean {
    if (oldSig.trim() === newSig.trim()) return false;

    // Extract parameters
    const oldParams = this.extractParams(oldSig);
    const newParams = this.extractParams(newSig);

    // If new signature has more required parameters than old
    const oldRequired = oldParams.filter((p) => !p.includes('?') && !p.includes('=')).length;
    const newRequired = newParams.filter((p) => !p.includes('?') && !p.includes('=')).length;

    if (newRequired > oldRequired) {
      return true;
    }

    // If return types differ
    const oldReturn = this.extractReturnType(oldSig);
    const newReturn = this.extractReturnType(newSig);
    if (oldReturn && newReturn && oldReturn !== newReturn) {
      return true;
    }

    return false;
  }

  private extractParams(sig: string): string[] {
    const match = sig.match(/\(([^)]*)\)/);
    if (!match || !match[1].trim()) return [];
    return match[1].split(',').map((p) => p.trim());
  }

  private extractReturnType(sig: string): string | undefined {
    const match = sig.match(/\):\s*([^{;]+)/);
    return match ? match[1].trim() : undefined;
  }
}
