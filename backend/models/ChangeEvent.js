const mongoose = require("mongoose");

const changeEventSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  type: { type: String, required: true }, // e.g. "ZSCORE_SPIKE", "RSI_CROSS", "MA20_CROSS", "VOLUME_SPIKE"
  message: String,
  severity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ChangeEvent", changeEventSchema);