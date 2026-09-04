// Deterministic pseudo-random so the same symbol always gets a consistent baseline
function seedFromSymbol(symbol) {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = (hash << 5) - hash + symbol.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generates ~60 days of plausible OHLCV bars for a symbol via a seeded random walk.
function generateSyntheticBars(symbol) {
  const rand = mulberry32(seedFromSymbol(symbol));
  let price = 200 + rand() * 2800; // plausible NSE price range baseline

  const bars = [];
  const today = new Date();

  for (let i = 60; i >= 0; i--) {
    const dailyMove = (rand() - 0.48) * price * 0.02; // slight upward drift, ~2% daily vol
    price = Math.max(10, price + dailyMove);

    const open = price - dailyMove * (0.3 + rand() * 0.4);
    const high = Math.max(open, price) * (1 + rand() * 0.008);
    const low = Math.min(open, price) * (1 - rand() * 0.008);
    const volume = Math.round(500000 + rand() * 2000000);

    const date = new Date(today);
    date.setDate(today.getDate() - i);

    bars.push({ date, open, high, low, close: price, volume });
  }

  return bars;
}

module.exports = { generateSyntheticBars };