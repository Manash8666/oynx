/**
 * Onyx Agent Lucifer — Empirical CDF Augmentation & Distribution Synthesizer
 * Computes Empirical Cumulative Distribution Functions (ECDF), quantile transformations,
 * and inverse CDF sampling for realistic synthetic feature generation.
 */

import { CDFDistribution, CDFPoint, SyntheticSample } from './types';

export class LuciferCDFSynthesizer {
  /**
   * Fits an empirical Cumulative Distribution Function (ECDF) to a 1D numerical array
   */
  public fitDistribution(featureName: string, rawValues: number[]): CDFDistribution {
    if (!rawValues || rawValues.length === 0) {
      throw new Error(`Cannot fit CDF on empty dataset for feature '${featureName}'`);
    }

    const sorted = [...rawValues].sort((a, b) => a - b);
    const n = sorted.length;

    const min = sorted[0];
    const max = sorted[n - 1];
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;

    const variance =
      sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n > 1 ? n - 1 : 1);
    const stdDev = Math.sqrt(variance);

    // Quantile helper
    const getQuantile = (q: number): number => {
      const idx = (n - 1) * q;
      const lo = Math.floor(idx);
      const hi = Math.ceil(idx);
      if (lo === hi) return sorted[lo];
      return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
    };

    const quantiles = {
      p10: Number(getQuantile(0.1).toFixed(4)),
      p25: Number(getQuantile(0.25).toFixed(4)),
      p50: Number(getQuantile(0.5).toFixed(4)),
      p75: Number(getQuantile(0.75).toFixed(4)),
      p90: Number(getQuantile(0.9).toFixed(4)),
      p99: Number(getQuantile(0.99).toFixed(4)),
    };

    // Construct a condensed 50-point CDF curve for efficient lookup and visualization
    const steps = Math.min(50, n);
    const curve: CDFPoint[] = [];

    for (let i = 0; i < steps; i++) {
      const p = i / (steps - 1);
      const val = getQuantile(p);
      curve.push({
        x: Number(val.toFixed(4)),
        cdf: Number(p.toFixed(4)),
      });
    }

    return {
      featureName,
      sampleCount: n,
      min: Number(min.toFixed(4)),
      max: Number(max.toFixed(4)),
      mean: Number(mean.toFixed(4)),
      stdDev: Number(stdDev.toFixed(4)),
      quantiles,
      curve,
    };
  }

  /**
   * Inverse CDF lookup: Given a probability u in [0, 1], returns the estimated value x
   */
  public sampleInverseCDF(dist: CDFDistribution, u: number): number {
    const clampedU = Math.max(0, Math.min(1, u));
    const curve = dist.curve;

    if (curve.length === 0) return dist.mean;
    if (clampedU <= curve[0].cdf) return curve[0].x;
    if (clampedU >= curve[curve.length - 1].cdf) return curve[curve.length - 1].x;

    // Linear interpolation between curve points
    for (let i = 0; i < curve.length - 1; i++) {
      if (clampedU >= curve[i].cdf && clampedU <= curve[i + 1].cdf) {
        const span = curve[i + 1].cdf - curve[i].cdf;
        if (span === 0) return curve[i].x;
        const weight = (clampedU - curve[i].cdf) / span;
        return curve[i].x + weight * (curve[i + 1].x - curve[i].x);
      }
    }

    return dist.mean;
  }

  /**
   * Generates synthetic multi-feature samples using inverse CDF transformation
   * Preserves individual feature marginal distributions
   */
  public generateSyntheticSamples(
    distributions: Record<string, CDFDistribution>,
    sampleCount: number = 10,
    seed?: number
  ): SyntheticSample[] {
    const samples: SyntheticSample[] = [];
    let state = seed ?? 42;

    // Deterministic linear congruential generator for reproducible synthesis
    const nextRandom = (): number => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };

    for (let i = 0; i < sampleCount; i++) {
      const values: Record<string, number> = {};
      const uniformQuantiles: Record<string, number> = {};
      let likelihoodAccum = 1.0;

      for (const [feat, dist] of Object.entries(distributions)) {
        const u = nextRandom();
        uniformQuantiles[feat] = Number(u.toFixed(4));
        const val = this.sampleInverseCDF(dist, u);
        values[feat] = Number(val.toFixed(4));

        // Density estimate using normal kernel approximation
        const z = dist.stdDev > 0 ? (val - dist.mean) / dist.stdDev : 0;
        const pdf = Math.exp(-0.5 * z * z) / (Math.sqrt(2 * Math.PI) * (dist.stdDev || 1));
        likelihoodAccum *= Math.max(0.001, pdf);
      }

      samples.push({
        sampleId: `syn_${(i + 1).toString().padStart(4, '0')}`,
        values,
        uniformQuantiles,
        compositeLikelihood: Number(likelihoodAccum.toFixed(6)),
      });
    }

    return samples;
  }
}
