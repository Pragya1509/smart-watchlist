const mongoose = require("mongoose");

const watchlistItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symbol: { type: String, required: true, uppercase: true, trim: true },
  lastError: { type: String, default: null },
  lastViewedAt: { type: Date, default: () => new Date(0) },
}, { timestamps: true });

watchlistItemSchema.index({ user: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model("WatchlistItem", watchlistItemSchema);