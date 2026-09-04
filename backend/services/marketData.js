const yahooFinance = require("yahoo-finance2").default;

// --- simple global queue so we never fire concurrent/rapid requests at Yahoo ---
let queue = Promise.resolve();
const MIN_GAP_MS = 1500;

function enqueue(fn) {
  const run = queue.then(() => fn());
  queue = run.catch(() => {}).then(() => new Promise((r) => setTimeout(r, MIN_GAP_MS)));
  return run;
}

async function withRetry(fn, retries = 3, delayMs = 8000) {
  return enqueue(async () => {
    try {
      return await fn();
    } catch (err) {
      if (retries > 0 && err.message.includes("Too Many Requests")) {
        await new Promise((r) => setTimeout(r, delayMs));
        return withRetryInner(fn, retries - 1, delayMs * 2);
      }
      throw err;
    }
  });
}

// inner retry that does NOT re-enqueue (avoids double spacing on retries)
async function withRetryInner(fn, retries, delayMs) {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0 && err.message.includes("Too Many Requests")) {
      await new Promise((r) => setTimeout(r, delayMs));
      return withRetryInner(fn, retries - 1, delayMs * 2);
    }
    throw err;
  }
}

// Fetch last ~60 days of OHLCV bars — needed for RSI, MA20, VWAP, and Stochastic.
// This is now the ONLY Yahoo call per symbol — price/volume/avgVolume are derived
// from the bars themselves instead of a separate /quote call, halving our request count.
async function getHistoricalBars(symbol) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 60);

  const result = await withRetry(() =>
    yahooFinance.chart(symbol, {
      period1: start,
      period2: end,
      interval: "1d",
    })
  );

  return result.quotes
    .filter((q) => q.close != null && q.high != null && q.low != null)
    .map((q) => ({
      date: q.date,
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume,
    }));
}

// Derive current price/volume/avgVolume10Day from the bars instead of a separate
// quote endpoint call. Saves a full Yahoo request per symbol per fetch.
function deriveQuoteFromBars(bars) {
  const last = bars[bars.length - 1];
  const last10 = bars.slice(-10);
  const avgVolume10Day =
    last10.length > 0
      ? last10.reduce((s, b) => s + (b.volume || 0), 0) / last10.length
      : null;

  return {
    price: last.close,
    volume: last.volume,
    avgVolume10Day,
  };
}

// Kept for backward compatibility with anything that only needs price history
async function getHistoricalCloses(symbol) {
  const bars = await getHistoricalBars(symbol);
  return bars.map((b) => b.close);
}

module.exports = { getHistoricalBars, deriveQuoteFromBars, getHistoricalCloses };