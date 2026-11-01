/**
 * Onyx Agent Lucifer — Quad-Cortex Core Types
 * Proprietary multi-modal reasoning, process reward modeling,
 * quantitative finance, CDF distribution synthesis, and formal math engine.
 */

// ==========================================
// 1. PROCESS REWARD MODEL (PRM) & VERIFICATION
// ==========================================

export type PRMStepStatus = 'verified' | 'backtracked' | 'hallucination_detected' | 'pending';

export interface PRMStep {
  stepIndex: number;
  text: string;
  score: number; // 0.0 - 1.0 (probability of validity)
  confidence: number;
  status: PRMStepStatus;
  rationale: string;
  astChecksPassed?: boolean;
}

export interface PRMEvaluation {
  traceId: string;
  overallScore: number;
  verifiedSteps: number;
  totalSteps: number;
  canProceed: boolean;
  criticalErrors: string[];
  steps: PRMStep[];
  backtrackHistory: { stepIndex: number; originalText: string; correctedText: string; reason: string }[];
}

// ==========================================
// 2. CDF AUGMENTATION & SYNTHESIS
// ==========================================

export interface CDFPoint {
  x: number;
  cdf: number; // Cumulative probability 0.0 - 1.0
}

export interface CDFDistribution {
  featureName: string;
  sampleCount: number;
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  quantiles: {
    p10: number;
    p25: number;
    p50: number; // Median
    p75: number;
    p90: number;
    p99: number;
  };
  curve: CDFPoint[];
}

export interface SyntheticSample {
  sampleId: string;
  values: Record<string, number>;
  uniformQuantiles: Record<string, number>;
  compositeLikelihood: number;
}

// ==========================================
// 3. QUANTITATIVE FINANCE & ALGORITHMIC ENGINE
// ==========================================

export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MACDResult {
  macd: number;
  signal: number;
  histogram: number;
}

export interface BollingerBands {
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
}

export interface TechnicalIndicators {
  currentPrice: number;
  rsi14: number;
  macd: MACDResult;
  bollingerBands: BollingerBands;
  ema20: number;
  sma50: number;
  atr14: number;
  stochasticK: number;
  stochasticD: number;
  trendSignal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
}

export interface TradeOrder {
  id: string;
  timestamp: number;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  pl?: number;
  plPercent?: number;
}

export interface BacktestResult {
  strategyName: string;
  initialCapital: number;
  finalEquity: number;
  netProfit: number;
  netProfitPercent: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number; // 0.0 - 1.0
  profitFactor: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdownPercent: number;
  valueAtRisk95: number;
  trades: TradeOrder[];
  equityCurve: { timestamp: number; equity: number }[];
}

// ==========================================
// 4. FORMAL MATHEMATICS & LOGIC SOLVER
// ==========================================

export type MathDomain =
  | 'arithmetic'
  | 'algebra'
  | 'calculus'
  | 'number_theory'
  | 'geometry'
  | 'combinatorics'
  | 'olympiad_competition';

export interface ProofStep {
  step: number;
  statement: string;
  justification: string;
  formulaLatex?: string;
  verified: boolean;
  confidence: number;
}

export interface MathProblemSolution {
  problemId: string;
  problem: string;
  domain: MathDomain;
  finalAnswer: string;
  steps: ProofStep[];
  theoremsUsed: string[];
  totalSteps: number;
  verifiedProof: boolean;
  formalVerificationStatus: 'FORMALLY_PROVEN' | 'EMPIRICALLY_VERIFIED' | 'NEEDS_REVIEW';
}
