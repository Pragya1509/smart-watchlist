function calcRSI(closes, period = 14) {
  if (closes.length < period + 1) return null;
  const slice = closes.slice(-(period + 1));
  let gains = 0, losses = 0;
  for (let i = 1; i < slice.length; i++) {
    const diff = slice[i] - slice[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calcMA(closes, period = 20) {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function rsiZone(rsi) {
  if (rsi == null) return "neutral";
  if (rsi < 30) return "oversold";
  if (rsi > 70) return "overbought";
  return "neutral";
}

// self-learned volatility z-score from OUR OWN recent snapshots (not daily history)
function calcZScore(recentPrices, latestPrice) {
  if (recentPrices.length < 5) return 0;
  const mean = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
  const variance =
    recentPrices.reduce((sum, p) => sum + (p - mean) ** 2, 0) / recentPrices.length;
  const std = Math.sqrt(variance);
  if (std === 0) return 0;
  return (latestPrice - mean) / std;
}

// VWAP: cumulative (typical price * volume) / cumulative volume over the given bars
// bars: [{ high, low, close, volume }]
function calcVWAP(bars) {
  if (!bars || bars.length === 0) return null;
  let cumPV = 0, cumVol = 0;
  for (const b of bars) {
    if (b.high == null || b.low == null || b.close == null || b.volume == null) continue;
    const typicalPrice = (b.high + b.low + b.close) / 3;
    cumPV += typicalPrice * b.volume;
    cumVol += b.volume;
  }
  if (cumVol === 0) return null;
  return cumPV / cumVol;
}

// Stochastic Oscillator: %K (fast, smoothed) and %D (signal line)
function calcStochastic(bars, period = 14, smoothK = 3, smoothD = 3) {
  if (!bars || bars.length < period) return { k: null, d: null };
  const kValues = [];
  for (let i = period - 1; i < bars.length; i++) {
    const window = bars.slice(i - period + 1, i + 1);
    const highs = window.map((b) => b.high);
    const lows = window.map((b) => b.low);
    const highestHigh = Math.max(...highs);
    const lowestLow = Math.min(...lows);
    const close = bars[i].close;
    const k =
      highestHigh === lowestLow
        ? 50
        : ((close - lowestLow) / (highestHigh - lowestLow)) * 100;
    kValues.push(k);
  }
  const smoothedK =
    kValues.slice(-smoothK).reduce((a, b) => a + b, 0) / Math.min(smoothK, kValues.length);
  const dValues = kValues.slice(-smoothD);
  const smoothedD = dValues.reduce((a, b) => a + b, 0) / dValues.length;
  return { k: smoothedK, d: smoothedD };
}

module.exports = { calcRSI, calcMA, rsiZone, calcZScore, calcVWAP, calcStochastic };