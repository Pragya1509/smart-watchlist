import { useEffect, useState, useMemo } from "react";
import api from "../api";
import WatchlistCard from "../components/WatchlistCard";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState("symbol");
  const [filterZone, setFilterZone] = useState("all");
  const { logout } = useAuth();

  // Just fetches live data — does NOT mark events as viewed.
  const load = async () => {
    try {
      const { data } = await api.get("/watchlist");
      setItems(data);
    } catch (err) {
      console.error("Failed to load watchlist:", err.message);
    }
  };

  useEffect(() => {
    (async () => {
      await load(); // shows everything that changed while you were away
      try {
        await api.post("/watchlist/mark-viewed"); // now mark it as seen
      } catch (err) {
        console.error("Failed to mark viewed:", err.message);
      }
    })();

    // auto-refresh live prices every 30s, but do NOT re-mark as viewed —
    // that would erase alerts before the user has a chance to see them
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const addSymbol = async (e) => {
    e.preventDefault();
    if (!symbol.trim()) return;
    const tickers = symbol.split(",").map((s) => s.trim()).filter(Boolean);
    for (const t of tickers) {
      try {
        await api.post("/watchlist", { symbol: t });
      } catch (err) {
        console.error(`Failed to add ${t}:`, err.response?.data?.error || err.message);
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    setSymbol("");
    load();
  };

  const removeItem = async (id) => {
    try {
      await api.delete(`/watchlist/${id}`);
      load();
    } catch (err) {
      console.error("Failed to remove:", err.message);
    }
  };

  const refreshNow = async () => {
    setRefreshing(true);
    try {
      await api.post("/watchlist/refresh");
      await load();
    } catch (err) {
      console.error("Failed to refresh:", err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const summary = useMemo(() => {
    const overbought = items.filter((i) => i.snapshot?.rsiZone === "overbought").length;
    const oversold = items.filter((i) => i.snapshot?.rsiZone === "oversold").length;
    const alerts = items.reduce((sum, i) => sum + (i.changesSinceLastView?.length || 0), 0);
    return { overbought, oversold, alerts, total: items.length };
  }, [items]);

  const visibleItems = useMemo(() => {
    let result = [...items];
    if (filterZone !== "all") {
      result = result.filter((i) => i.snapshot?.rsiZone === filterZone);
    }
    if (sortBy === "change") {
      result.sort((a, b) => (b.changePercent ?? -Infinity) - (a.changePercent ?? -Infinity));
    } else if (sortBy === "rsi") {
      result.sort((a, b) => (b.snapshot?.rsi ?? -Infinity) - (a.snapshot?.rsi ?? -Infinity));
    } else {
      result.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }
    return result;
  }, [items, sortBy, filterZone]);

  return (
    <div className="dashboard">
      <div className="top-bar">
        <h1>My Watchlist</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={refreshNow} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "Refresh now"}
          </button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="summary-bar">
        <span>{summary.total} stocks</span>
        <span className="up">{summary.overbought} overbought</span>
        <span className="down">{summary.oversold} oversold</span>
        <span className="alert">{summary.alerts} new alerts</span>
      </div>

      <form onSubmit={addSymbol} className="add-form">
        <input
          placeholder="e.g. RELIANCE.NS, TCS.NS"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <div className="controls-bar">
        <label>
          Sort by:{" "}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="symbol">Symbol</option>
            <option value="change">% Change</option>
            <option value="rsi">RSI</option>
          </select>
        </label>
        <label>
          Filter:{" "}
          <select value={filterZone} onChange={(e) => setFilterZone(e.target.value)}>
            <option value="all">All</option>
            <option value="overbought">Overbought</option>
            <option value="oversold">Oversold</option>
            <option value="neutral">Neutral</option>
          </select>
        </label>
      </div>

      <div className="grid">
        {visibleItems.map((item) => (
          <WatchlistCard key={item.id} item={item} onRemove={removeItem} />
        ))}
      </div>
    </div>
  );
}