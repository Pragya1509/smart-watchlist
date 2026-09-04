const Snapshot = require("../models/Snapshot");
const ChangeEvent = require("../models/ChangeEvent");
const { getHistoricalBars, deriveQuoteFromBars } = require("./marketData");
const { generateSyntheticBars } = require("./syntheticData");
const {
  calcRSI,
  calcMA,
  rsiZone,
  calcZScore,
  calcVWAP,
  calcStochastic,
} = require("./indicators");

function stochZoneOf(k) {
  if (k == null) return "neutral";
  if (k >= 80) return "overbought";
  if (k <= 20) return "oversold";
  return "neutral";
}

async function processSymbol(symbol) {
  const existingCount = await Snapshot.countDocuments({ symbol });

  let bars;
  let simulated = false;
  try {
    bars = await getHistoricalBars(symbol);
    if (!bars || bars.length === 0) throw new Error("Empty data");
  } catch (err) {
    // Live source failed. If we've never gotten real data for this symbol at all,
    // fall back to a seeded synthetic baseline so the card isn't permanently blank —
    // clearly flagged as simulated rather than silently faking a live feed.
    if (existingCount === 0) {
      bars = generateSyntheticBars(symbol);
      simulated = true;
    } else {
      throw err; // we have real history — let the caller show "last known data" instead
    }
  }

  const { price, volume, avgVolume10Day } = deriveQuoteFromBars(bars);

  const closes = bars.map((b) => b.close);
  const rsi = calcRSI(closes);
  const ma20 = calcMA(closes);
  const aboveMA20 = ma20 != null ? price > ma20 : null;
  const zone = rsiZone(rsi);

  // 20-day VWAP as a volume-weighted "fair value" baseline
  const vwap = calcVWAP(bars.slice(-20));
  const aboveVWAP = vwap != null ? price > vwap : null;

  const { k: stochK, d: stochD } = calcStochastic(bars);
  const stochZone = stochZoneOf(stochK);

  const prevBar = bars[bars.length - 2];
  const volumeVsPrevDay = prevBar && prevBar.volume ? volume / prevBar.volume : null;

  // last 20 of our own snapshots -> adaptive/self-learned volatility baseline
  const recent = await Snapshot.find({ symbol }).sort({ fetchedAt: -1 }).limit(20).lean();
  const recentPrices = recent.map((s) => s.price).reverse();
  const zScore = calcZScore(recentPrices, price);

  const prev = recent[0]; // most recent snapshot before this one

  const events = [];

  // Don't raise "meaningful change" alerts off simulated data — only real
  // market moves should trigger these.
  if (!simulated) {
    if (Math.abs(zScore) > 2) {
      events.push({
        symbol,
        type: "ZSCORE_SPIKE",
        severity: Math.abs(zScore) > 3 ? "high" : "medium",
        message: `${symbol} moved ${zScore > 0 ? "up" : "down"} ${Math.abs(zScore).toFixed(
          1
        )}σ from its recent average — unusual for this stock.`,
      });
    }

    if (prev && prev.rsiZone && prev.rsiZone !== zone && zone !== "neutral") {
      events.push({
        symbol,
        type: "RSI_CROSS",
        severity: "medium",
        message: `${symbol} RSI entered ${zone} territory (RSI ${rsi?.toFixed(1)}).`,
      });
    }

    if (prev && prev.aboveMA20 != null && aboveMA20 != null && prev.aboveMA20 !== aboveMA20) {
      events.push({
        symbol,
        type: "MA20_CROSS",
        severity: "medium",
        message: `${symbol} crossed ${aboveMA20 ? "above" : "below"} its 20-day average.`,
      });
    }

    if (prev && prev.aboveVWAP != null && aboveVWAP != null && prev.aboveVWAP !== aboveVWAP) {
      events.push({
        symbol,
        type: "VWAP_CROSS",
        severity: "low",
        message: `${symbol} crossed ${aboveVWAP ? "above" : "below"} its 20-day VWAP.`,
      });
    }

    if (prev && prev.stochZone && prev.stochZone !== stochZone && stochZone !== "neutral") {
      events.push({
        symbol,
        type: "STOCH_CROSS",
        severity: "low",
        message: `${symbol} stochastic entered ${stochZone} territory (%K ${stochK?.toFixed(1)}).`,
      });
    }

    if (avgVolume10Day && volume > avgVolume10Day * 2) {
      events.push({
        symbol,
        type: "VOLUME_SPIKE",
        severity: "high",
        message: `${symbol} volume is ${(volume / avgVolume10Day).toFixed(1)}x its 10-day average.`,
      });
    }
  }

  await Snapshot.create({
    symbol,
    price,
    volume,
    rsi,
    ma20,
    aboveMA20,
    rsiZone: zone,
    vwap,
    aboveVWAP,
    stochK,
    stochD,
    stochZone,
    volumeVsPrevDay,
    simulated,
  });

  if (events.length) await ChangeEvent.insertMany(events);

  return { price, rsi, ma20, zone, zScore, vwap, stochK, stochD, simulated };
}

module.exports = { processSymbol };