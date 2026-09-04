const mongoose = require("mongoose");

const snapshotSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  price: Number,
  volume: Number,
  rsi: Number,
  ma20: Number,
  aboveMA20: Boolean,
  rsiZone: { type: String, enum: ["oversold", "neutral", "overbought"] },
  vwap: Number,
  aboveVWAP: Boolean,
  stochK: Number,
  stochD: Number,
  stochZone: { type: String, enum: ["oversold", "neutral", "overbought"] },
  volumeVsPrevDay: Number,
  fetchedAt: { type: Date, default: Date.now },
  simulated: { type: Boolean, default: false },
});

module.exports = mongoose.model("Snapshot", snapshotSchema);