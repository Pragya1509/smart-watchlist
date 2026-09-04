// Run once with: node seed.js
// Populates realistic-looking snapshots + change events so your demo
// works even if Yahoo Finance is rate-limited or down.
// This does NOT replace live data — processSymbol() will still overwrite
// these with real prices whenever Yahoo succeeds. It just guarantees
// there's always something to show.

require("dotenv").config();
const mongoose = require("mongoose");
const Snapshot = require("./models/Snapshot");
const ChangeEvent = require("./models/ChangeEvent");

const MOCK_STOCKS = [
  { symbol: "RELIANCE.NS", price: 2945.6, rsi: 58.2, ma20: 2910.3, aboveMA20: true, rsiZone: "neutral" },
  { symbol: "TCS.NS", price: 4102.15, rsi: 71.4, ma20: 4050.8, aboveMA20: true, rsiZone: "overbought" },
  { symbol: "HUL.NS", price: 2510.9, rsi: 34.1, ma20: 2540.2, aboveMA20: false, rsiZone: "oversold" },
  { symbol: "IRCTC.NS", price: 785.3, rsi: 49.8, ma20: 790.1, aboveMA20: false, rsiZone: "neutral" },
  { symbol: "TCS", price: 4098.0, rsi: 70.1, ma20: 4045.0, aboveMA20: true, rsiZone: "overbought" },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for seeding");

  for (const stock of MOCK_STOCKS) {
    // create two snapshots (older + latest) so changePercent has something to compute
    const olderPrice = stock.price * (1 - (Math.random() * 0.02 - 0.01));

    await Snapshot.create({
      symbol: stock.symbol,
      price: olderPrice,
      volume: 1_200_000,
      rsi: stock.rsi - 3,
      ma20: stock.ma20,
      aboveMA20: stock.aboveMA20,
      rsiZone: stock.rsiZone,
      fetchedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
    });

    await Snapshot.create({
      symbol: stock.symbol,
      price: stock.price,
      volume: 1_450_000,
      rsi: stock.rsi,
      ma20: stock.ma20,
      aboveMA20: stock.aboveMA20,
      rsiZone: stock.rsiZone,
      fetchedAt: new Date(), // now
    });

    await ChangeEvent.create({
      symbol: stock.symbol,
      type: stock.rsiZone === "overbought" ? "RSI_CROSS" : "MA20_CROSS",
      severity: "medium",
      message:
        stock.rsiZone === "overbought"
          ? `${stock.symbol} RSI entered overbought territory (RSI ${stock.rsi.toFixed(1)}).`
          : `${stock.symbol} crossed ${stock.aboveMA20 ? "above" : "below"} its 20-day average.`,
    });

    console.log(`Seeded ${stock.symbol}`);
  }

  console.log("Done seeding. You can now demo even with Yahoo down.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});