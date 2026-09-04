const express = require("express");
const auth = require("../middleware/auth");
const WatchlistItem = require("../models/WatchlistItem");
const Snapshot = require("../models/Snapshot");
const ChangeEvent = require("../models/ChangeEvent");
const { processSymbol } = require("../services/changeDetector");

const router = express.Router();

// Turn a raw error into a friendly, honest message for the UI
function friendlyError(e) {
  if (e.message.includes("Too Many Requests")) {
    return "Temporarily unavailable — showing last known data";
  }
  return "Invalid symbol — check spelling (e.g. RELIANCE.NS)";
}

// Add symbol
router.post("/", auth, async (req, res) => {
  try {
    const { symbol } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const clean = symbol.toUpperCase().trim();

    const item = await WatchlistItem.create({ user: req.userId, symbol: clean });

    processSymbol(clean)
      .then(async () => {
        await WatchlistItem.updateOne({ _id: item._id }, { lastError: null });
      })
      .catch(async (e) => {
        console.error(`Failed to fetch ${clean}:`, e.message);
        await WatchlistItem.updateOne({ _id: item._id }, { lastError: friendlyError(e) });
      });

    res.json(item);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "Already in watchlist" });
    res.status(500).json({ error: err.message });
  }
});

// Get watchlist with latest snapshot + change % + sparkline + events since last view.
// IMPORTANT: this does NOT update lastViewedAt anymore — that only happens via
// POST /mark-viewed, so events stay visible across the whole session until the
// user explicitly "checks" them (matches "return later and see what changed").
router.get("/", auth, async (req, res) => {
  try {
    const items = await WatchlistItem.find({ user: req.userId });

    const result = await Promise.all(
      items.map(async (item) => {
        const snapshots = await Snapshot.find({ symbol: item.symbol })
          .sort({ fetchedAt: -1 })
          .limit(15);
        const latestSnapshot = snapshots[0] || null;
        const prevSnapshot = snapshots[1] || null;

        const changePercent =
          prevSnapshot && latestSnapshot
            ? ((latestSnapshot.price - prevSnapshot.price) / prevSnapshot.price) * 100
            : null;

        const sparkline = snapshots.map((s) => s.price).reverse();

        const eventsSinceLastView = await ChangeEvent.find({
          symbol: item.symbol,
          createdAt: { $gt: item.lastViewedAt },
        }).sort({ createdAt: -1 });

        const staleMinutes = latestSnapshot
          ? Math.round((Date.now() - new Date(latestSnapshot.fetchedAt)) / 60000)
          : null;

        return {
            id: item._id,
            symbol: item.symbol,
            snapshot: latestSnapshot,
            changePercent,
            sparkline,
            isStale: staleMinutes !== null && staleMinutes > 10,
            staleMinutes,
            changesSinceLastView: eventsSinceLastView,
            lastError: item.lastError || null,
            isSimulated: latestSnapshot?.simulated || false,
        };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Explicitly mark everything as viewed "now". Call this once when the user
// opens/focuses the dashboard — NOT on every auto-poll — so events accumulate
// across the whole time they're away and only clear when they actually look.
router.post("/mark-viewed", auth, async (req, res) => {
  try {
    await WatchlistItem.updateMany({ user: req.userId }, { lastViewedAt: new Date() });
    res.json({ done: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Manual refresh (skip waiting for the 5-min cron)
router.post("/refresh", auth, async (req, res) => {
  const items = await WatchlistItem.find({ user: req.userId });

  for (const i of items) {
    try {
      await processSymbol(i.symbol);
      await WatchlistItem.updateOne({ _id: i._id }, { lastError: null });
    } catch (e) {
      await WatchlistItem.updateOne({ _id: i._id }, { lastError: friendlyError(e) });
    }
  }

  res.json({ done: true });
});

router.delete("/:id", auth, async (req, res) => {
  try {
    await WatchlistItem.deleteOne({ _id: req.params.id, user: req.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;