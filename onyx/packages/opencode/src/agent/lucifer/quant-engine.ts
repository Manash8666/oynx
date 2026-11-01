/**
 * Onyx Agent Lucifer — Quantitative Finance & Algorithmic Trading Engine
 * Pure TypeScript implementation of TA-Lib indicators, statistical risk metrics,
 * portfolio valuation, and event-driven backtesting.
 */

import {
  OHLCV,
  TechnicalIndicators,
  MACDResult,
  BollingerBands,
  BacktestResult,
  TradeOrder,
} from './types';

export class LuciferQuantEngine {
  /**
   * Simple Moving Average (SMA)
   */
  public calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        sma.push(NaN);
      } else {
        const slice = prices.slice(i - period + 1, i + 1);
        const sum = slice.reduce((a, b) => a + b, 0);
        sma.push(Number((sum / period).toFixed(4)));
      }
    }
    return sma;
  }

  /**
   * Exponential Moving Average (EMA)
   */
  public calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = [];
    const k = 2 / (period + 1);

    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        ema.push(NaN);
      } else if (i === period - 1) {
        const slice = prices.slice(0, period);
        const sma = slice.reduce((a, b) => a + b, 0) / period;
        ema.push(Number(sma.toFixed(4)));
      } else {
        const prevEMA = ema[i - 1];
        const currentEMA = prices[i] * k + prevEMA * (1 - k);
        ema.push(Number(currentEMA.toFixed(4)));
      }
    }
    return ema;
  }

  /**
   * Relative Strength Index (RSI - 14 period default)
   */
  public calculateRSI(prices: number[], period: number = 14): number[] {
    const rsi: number[] = [];
    if (prices.length <= period) return prices.map(() => 50);

    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      gains.push(diff > 0 ? diff : 0);
      losses.push(diff < 0 ? Math.abs(diff) : 0);
    }

    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = 0; i < period; i++) {
      rsi.push(NaN);
    }

    const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(Number((100 - 100 / (1 + firstRS)).toFixed(2)));

    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(Number((100 - 100 / (1 + rs)).toFixed(2)));
      }
    }

    return rsi;
  }

  /**
   * Moving Average Convergence Divergence (MACD)
   */
  public calculateMACD(
    prices: number[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
  ): MACDResult[] {
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);

    const macdLine: number[] = [];
    for (let i = 0; i < prices.length; i++) {
      if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
        macdLine.push(NaN);
      } else {
        macdLine.push(fastEMA[i] - slowEMA[i]);
      }
    }

    // Filter valid MACD entries for signal line calculation
    const validMACDIndex = macdLine.findIndex((v) => !isNaN(v));
    const validMACD = macdLine.slice(validMACDIndex);
    const signalLineRaw = this.calculateEMA(validMACD, signalPeriod);

    const results: MACDResult[] = [];
    for (let i = 0; i < prices.length; i++) {
      if (i < validMACDIndex) {
        results.push({ macd: 0, signal: 0, histogram: 0 });
      } else {
        const offset = i - validMACDIndex;
        const macdVal = Number((macdLine[i] || 0).toFixed(4));
        const signalVal = Number((signalLineRaw[offset] || 0).toFixed(4));
        const hist = Number((macdVal - signalVal).toFixed(4));
        results.push({
          macd: macdVal,
          signal: signalVal,
          histogram: hist,
        });
      }
    }

    return results;
  }

  /**
   * Bollinger Bands (20 period, 2 stdDev default)
   */
  public calculateBollingerBands(
    prices: number[],
    period: number = 20,
    nbDev: number = 2
  ): BollingerBands[] {
    const sma = this.calculateSMA(prices, period);
    const results: BollingerBands[] = [];

    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1 || isNaN(sma[i])) {
        results.push({
          upper: prices[i],
          middle: prices[i],
          lower: prices[i],
          bandwidth: 0,
        });
      } else {
        const slice = prices.slice(i - period + 1, i + 1);
        const mean = sma[i];
        const variance =
          slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);

        const upper = Number((mean + nbDev * stdDev).toFixed(4));
        const lower = Number((mean - nbDev * stdDev).toFixed(4));
        const bandwidth = Number(((upper - lower) / mean).toFixed(4));

        results.push({
          upper,
          middle: mean,
          lower,
          bandwidth,
        });
      }
    }

    return results;
  }

  /**
   * Average True Range (ATR - 14 period default)
   */
  public calculateATR(candles: OHLCV[], period: number = 14): number[] {
    if (candles.length === 0) return [];
    const trueRanges: number[] = [candles[0].high - candles[0].low];

    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;

      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
    }

    const atr: number[] = [];
    let avg = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = 0; i < period - 1; i++) {
      atr.push(NaN);
    }
    atr.push(Number(avg.toFixed(4)));

    for (let i = period; i < trueRanges.length; i++) {
      avg = (avg * (period - 1) + trueRanges[i]) / period;
      atr.push(Number(avg.toFixed(4)));
    }

    return atr;
  }

  /**
   * Extract comprehensive technical snapshot for the most recent candle
   */
  public analyzeTechnicalSnapshot(candles: OHLCV[]): TechnicalIndicators {
    if (!candles || candles.length < 50) {
      throw new Error('At least 50 historical candles required for technical indicators');
    }

    const closes = candles.map((c) => c.close);
    const currentPrice = closes[closes.length - 1];

    const rsiArr = this.calculateRSI(closes, 14);
    const macdArr = this.calculateMACD(closes, 12, 26, 9);
    const bbArr = this.calculateBollingerBands(closes, 20, 2);
    const ema20Arr = this.calculateEMA(closes, 20);
    const sma50Arr = this.calculateSMA(closes, 50);
    const atrArr = this.calculateATR(candles, 14);

    const lastIdx = closes.length - 1;
    const rsi14 = rsiArr[lastIdx] || 50;
    const macd = macdArr[lastIdx] || { macd: 0, signal: 0, histogram: 0 };
    const bollingerBands = bbArr[lastIdx] || { upper: currentPrice, middle: currentPrice, lower: currentPrice, bandwidth: 0 };
    const ema20 = ema20Arr[lastIdx] || currentPrice;
    const sma50 = sma50Arr[lastIdx] || currentPrice;
    const atr14 = atrArr[lastIdx] || 1.0;

    // Stochastic %K calculation
    const stochPeriod = 14;
    const stochSlice = candles.slice(lastIdx - stochPeriod + 1, lastIdx + 1);
    const lowestLow = Math.min(...stochSlice.map((c) => c.low));
    const highestHigh = Math.max(...stochSlice.map((c) => c.high));
    const stochasticK =
      highestHigh !== lowestLow
        ? Number((((currentPrice - lowestLow) / (highestHigh - lowestLow)) * 100).toFixed(2))
        : 50;
    const stochasticD = stochasticK; // simplified single-bar snapshot

    // Signal scoring model
    let score = 0;
    if (rsi14 < 30) score += 2;
    else if (rsi14 > 70) score -= 2;

    if (macd.histogram > 0 && macd.macd > macd.signal) score += 2;
    else if (macd.histogram < 0 && macd.macd < macd.signal) score -= 2;

    if (currentPrice > ema20 && ema20 > sma50) score += 2;
    else if (currentPrice < ema20 && ema20 < sma50) score -= 2;

    let trendSignal: TechnicalIndicators['trendSignal'] = 'NEUTRAL';
    if (score >= 4) trendSignal = 'STRONG_BUY';
    else if (score >= 2) trendSignal = 'BUY';
    else if (score <= -4) trendSignal = 'STRONG_SELL';
    else if (score <= -2) trendSignal = 'SELL';

    return {
      currentPrice,
      rsi14,
      macd,
      bollingerBands,
      ema20,
      sma50,
      atr14,
      stochasticK,
      stochasticD,
      trendSignal,
    };
  }

  /**
   * Algorithmic Backtesting Engine
   * Evaluates a trend-following mean-reversion strategy over historical candles
   */
  public runBacktest(
    candles: OHLCV[],
    initialCapital: number = 100000,
    strategyName: string = 'Lucifer Adaptive Momentum & RSI'
  ): BacktestResult {
    const closes = candles.map((c) => c.close);
    const rsiArr = this.calculateRSI(closes, 14);
    const macdArr = this.calculateMACD(closes, 12, 26, 9);
    const ema20Arr = this.calculateEMA(closes, 20);

    let capital = initialCapital;
    let position = 0; // shares held
    let entryPrice = 0;

    const trades: TradeOrder[] = [];
    const equityCurve: { timestamp: number; equity: number }[] = [];
    let tradeCounter = 1;

    for (let i = 30; i < candles.length; i++) {
      const candle = candles[i];
      const rsi = rsiArr[i];
      const macd = macdArr[i];
      const ema20 = ema20Arr[i];

      // Buy condition: RSI oversold recovery or bullish MACD crossover above EMA20
      const buySignal = position === 0 && (rsi < 35 || (macd.histogram > 0 && candle.close > ema20));

      // Sell condition: RSI overbought or bearish MACD crossover
      const sellSignal = position > 0 && (rsi > 68 || macd.histogram < -0.5);

      if (buySignal && capital > candle.close) {
        const qty = Math.floor((capital * 0.95) / candle.close);
        const cost = qty * candle.close;
        capital -= cost;
        position = qty;
        entryPrice = candle.close;

        trades.push({
          id: `TRD_${tradeCounter++}`,
          timestamp: candle.timestamp,
          type: 'BUY',
          price: candle.close,
          quantity: qty,
        });
      } else if (sellSignal && position > 0) {
        const proceeds = position * candle.close;
        const pl = proceeds - position * entryPrice;
        const plPercent = (pl / (position * entryPrice)) * 100;
        capital += proceeds;

        trades.push({
          id: `TRD_${tradeCounter++}`,
          timestamp: candle.timestamp,
          type: 'SELL',
          price: candle.close,
          quantity: position,
          pl: Number(pl.toFixed(2)),
          plPercent: Number(plPercent.toFixed(2)),
        });

        position = 0;
        entryPrice = 0;
      }

      const currentEquity = capital + position * candle.close;
      equityCurve.push({
        timestamp: candle.timestamp,
        equity: Number(currentEquity.toFixed(2)),
      });
    }

    // Close remaining position at last candle
    if (position > 0) {
      const lastCandle = candles[candles.length - 1];
      const proceeds = position * lastCandle.close;
      const pl = proceeds - position * entryPrice;
      const plPercent = (pl / (position * entryPrice)) * 100;
      capital += proceeds;

      trades.push({
        id: `TRD_${tradeCounter++}`,
        timestamp: lastCandle.timestamp,
        type: 'SELL',
        price: lastCandle.close,
        quantity: position,
        pl: Number(pl.toFixed(2)),
        plPercent: Number(plPercent.toFixed(2)),
      });
    }

    const finalEquity = Number(capital.toFixed(2));
    const netProfit = Number((finalEquity - initialCapital).toFixed(2));
    const netProfitPercent = Number(((netProfit / initialCapital) * 100).toFixed(2));

    const closedTrades = trades.filter((t) => t.type === 'SELL');
    const winningTrades = closedTrades.filter((t) => (t.pl || 0) > 0).length;
    const losingTrades = closedTrades.filter((t) => (t.pl || 0) <= 0).length;
    const winRate = closedTrades.length > 0 ? Number((winningTrades / closedTrades.length).toFixed(3)) : 0;

    const grossGains = closedTrades.filter((t) => (t.pl || 0) > 0).reduce((acc, t) => acc + (t.pl || 0), 0);
    const grossLosses = Math.abs(
      closedTrades.filter((t) => (t.pl || 0) < 0).reduce((acc, t) => acc + (t.pl || 0), 0)
    );
    const profitFactor = grossLosses > 0 ? Number((grossGains / grossLosses).toFixed(2)) : grossGains > 0 ? 99.0 : 1.0;

    // Calculate Max Drawdown
    let peak = initialCapital;
    let maxDrawdown = 0;

    for (const pt of equityCurve) {
      if (pt.equity > peak) peak = pt.equity;
      const dd = ((peak - pt.equity) / peak) * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }

    // Daily returns for Sharpe and Sortino
    const dailyReturns: number[] = [];
    for (let i = 1; i < equityCurve.length; i++) {
      const prev = equityCurve[i - 1].equity;
      const curr = equityCurve[i].equity;
      dailyReturns.push((curr - prev) / prev);
    }

    const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / (dailyReturns.length || 1);
    const returnVariance =
      dailyReturns.reduce((acc, r) => acc + Math.pow(r - avgReturn, 2), 0) / (dailyReturns.length || 1);
    const returnStdDev = Math.sqrt(returnVariance);

    const downsideVariance =
      dailyReturns.filter((r) => r < 0).reduce((acc, r) => acc + Math.pow(r, 2), 0) /
      (dailyReturns.length || 1);
    const downsideStdDev = Math.sqrt(downsideVariance);

    const annualizedFactor = Math.sqrt(252);
    const riskFreeDaily = 0.04 / 252; // 4% risk-free rate assumption

    const sharpeRatio =
      returnStdDev > 0 ? Number((((avgReturn - riskFreeDaily) / returnStdDev) * annualizedFactor).toFixed(2)) : 1.5;
    const sortinoRatio =
      downsideStdDev > 0 ? Number((((avgReturn - riskFreeDaily) / downsideStdDev) * annualizedFactor).toFixed(2)) : 2.0;

    // Parametric 95% 1-day Value at Risk (VaR)
    const var95 = Number((initialCapital * (1.645 * returnStdDev - avgReturn)).toFixed(2));

    return {
      strategyName,
      initialCapital,
      finalEquity,
      netProfit,
      netProfitPercent,
      totalTrades: closedTrades.length,
      winningTrades,
      losingTrades,
      winRate,
      profitFactor,
      sharpeRatio,
      sortinoRatio,
      maxDrawdownPercent: Number(maxDrawdown.toFixed(2)),
      valueAtRisk95: Math.max(0, var95),
      trades,
      equityCurve,
    };
  }
}
