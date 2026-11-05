export interface SecretRule {
  id: string;
  name: string;
  pattern: RegExp;
  tokenPrefix: string;
}

export interface DetectedSecret {
  ruleId: string;
  ruleName: string;
  matchedValue: string;
  entropy: number;
  startIndex: number;
  endIndex: number;
  pseudonymToken: string;
}

export interface RedactionResult {
  sanitizedText: string;
  secretsCount: number;
  detections: DetectedSecret[];
  tokenMap: Map<string, string>; // pseudonymToken -> originalValue
}
