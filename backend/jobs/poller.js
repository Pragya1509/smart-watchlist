const cron = require("node-cron");
const WatchlistItem = require("../models/WatchlistItem");
const { processSymbol } = require("../services/changeDetector");

function startPoller() {
  // every 5 min — dedupe symbols across ALL users so we don't re-fetch the same stock per user
  cron.schedule("*/5 * * * *", async () => {
    const symbols = await WatchlistItem.distinct("symbol");
    console.log(`Polling ${symbols.length} unique symbols...`);
    for (const symbol of symbols) {
        try {
            await processSymbol(symbol);
        } catch (err) {
            console.error(`Failed to process ${symbol}:`, err.message);
        }
        await new Promise((r) => setTimeout(r, 2000)); 
    }
  });
}

module.exports = startPoller;