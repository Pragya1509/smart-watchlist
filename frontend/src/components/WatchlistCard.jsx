function Sparkline({ data }) {
  if (!data || data.length < 2) return null;
  const width = 100;
  const height = 30;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
  const trendUp = data[data.length - 1] >= data[0];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkline">
      <polyline
        points={points}
        fill="none"
        stroke={trendUp ? "#3ecf8e" : "#ff4d4f"}
        strokeWidth="2"
      />
    </svg>
  );
}

// Chartink stock pages: https://chartink.com/stocks/reliance.html (lowercase, no .NS)
function chartLinkFor(symbol) {
  const base = symbol.replace(/\.NS$/i, "").toLowerCase();
  return `https://chartink.com/stocks/${base}.html`;
}

export default function WatchlistCard({ item, onRemove }) {
  const {
    symbol,
    snapshot,
    isStale,
    staleMinutes,
    changesSinceLastView,
    changePercent,
    lastError,
    sparkline,
  } = item;

  return (
    <div className="card">
      <div className="card-header">
        <h3>{symbol}</h3>
        <button onClick={() => onRemove(item.id)}>✕</button>
      </div>

      {lastError && !snapshot && (
        <p className="stale" style={{ color: "#ff4d4f" }}>{lastError}</p>
      )}

      {snapshot ? (
        <>
          <div className="price-row">
            <p className="price">₹{snapshot.price?.toFixed(2)}</p>
            {changePercent != null && (
              <span className={`change-badge ${changePercent >= 0 ? "up" : "down"}`}>
                {changePercent >= 0 ? "▲" : "▼"} {Math.abs(changePercent).toFixed(2)}%
              </span>
            )}
          </div>

          <Sparkline data={sparkline} />

          <div className="indicator-grid">
            <p className={`zone-tag ${snapshot.rsiZone || "neutral"}`}>
              RSI {snapshot.rsi?.toFixed(1) ?? "—"} · {snapshot.rsiZone ?? "neutral"}
            </p>

            {snapshot.aboveMA20 != null && (
              <p className={`ma-tag ${snapshot.aboveMA20 ? "up" : "down"}`}>
                {snapshot.aboveMA20 ? "▲ above" : "▼ below"} MA20
              </p>
            )}

            {item.isSimulated && (
                <p className="stale" style={{ color: "#faad14" }}>
                    ⚠ Live feed unavailable — showing simulated data for demo purposes
                </p>
            )}

            {snapshot.vwap != null && (
              <p className={`ma-tag ${snapshot.aboveVWAP ? "up" : "down"}`}>
                {snapshot.aboveVWAP ? "▲ above" : "▼ below"} VWAP (₹{snapshot.vwap.toFixed(2)})
              </p>
            )}

            {snapshot.stochK != null && (
              <p className={`zone-tag ${snapshot.stochZone || "neutral"}`}>
                Stoch %K {snapshot.stochK.toFixed(1)} · {snapshot.stochZone ?? "neutral"}
              </p>
            )}

            {snapshot.volumeVsPrevDay != null && (
              <p className="volume-tag">
                Vol {snapshot.volumeVsPrevDay.toFixed(2)}x vs yesterday
              </p>
            )}
          </div>

          <a href={chartLinkFor(symbol)} target="_blank" rel="noreferrer" className="chart-link">
            View full chart →
          </a>

          {isStale && <p className="stale">⚠ data is {staleMinutes} min old</p>}
          {lastError && <p className="stale" style={{ color: "#faad14" }}>⚠ {lastError}</p>}
        </>
      ) : (
        !lastError && <p className="stale">Fetching first snapshot…</p>
      )}

      {changesSinceLastView?.length > 0 && (
        <div className="changes">
          <p className="changes-title">Since you last checked</p>
          {changesSinceLastView.map((ev) => (
            <div key={ev._id} className={`event ${ev.severity}`}>
              {ev.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}