export type ImpactSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL_BREAKING';

export interface ImpactedConsumer {
  filePath: string;
  symbolName: string;
  isTestFile: boolean;
  depth: number;
}

export interface BlastRadiusReport {
  symbolName: string;
  sourceFilePath: string;
  directConsumers: ImpactedConsumer[];
  transitiveConsumers: ImpactedConsumer[];
  dependentTests: ImpactedConsumer[];
  blastRadiusIndex: number; // 0 - 100
  severity: ImpactSeverity;
  isBreakingChange: boolean;
  breakingReason?: string;
}
