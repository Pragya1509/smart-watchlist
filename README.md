# Smart Market Watchlist

A stock watchlist that doesn't just show prices — it tells you what's actually changed since the last time you looked, and why it might matter.

## The problem

Most watchlists are static price tickers. You have to sit and stare at them to notice anything meaningful. This app flips that: check in whenever you want, and it surfaces exactly what changed while you were away — RSI crossing into overbought/oversold territory, price crossing its 20-day average or VWAP, unusual volume, or a self-learned volatility spike specific to that stock.

## Core features

- **Watchlist management** — add/remove NSE stocks (e.g. `RELIANCE.NS`, `TCS.NS`), persisted per user account.
- **Live market data** — price, volume, and a set of technical indicators refreshed on a schedule.
- **"Since you last checked" feed** — a real, timestamp-driven diff, not a static list. Every meaningful change that happened since your last visit is surfaced when you return; it clears once you've seen it.
- **Chartink integration** — one click from any stock card to its live chart on Chartink.
- **Stale/error-aware UI** — if the upstream data provider is rate-limited or down, the app shows the last known good data with an honest "temporarily unavailable" badge instead of hiding everything behind an error.
- **Synthetic-data fallback** — if a symbol has never successfully fetched real data (e.g. Yahoo is rate-limited on first add), the app shows a clearly-labeled seeded synthetic baseline instead of a permanently blank card. It's disclosed to the user, not silently faked, and never used to generate real "meaningful change" alerts.

## Indicators computed

| Indicator | What it tells you |
|---|---|
| RSI (14-day) | Momentum — flags when a stock has moved unusually far, unusually fast (overbought >70, oversold <30) |
| MA20 (20-day moving average) | Short-term trend direction — price above/below its recent average |
| VWAP (20-day) | Volume-weighted "fair value" — whether the price is trading rich or cheap relative to where most volume traded |
| Stochastic Oscillator (%K/%D) | Momentum relative to the recent trading range |
| Volume vs. 10-day average / vs. yesterday | Flags unusual trading activity |
| Self-learned Z-score | How unusual today's move is *for this specific stock*, based on its own recent snapshot history — not a fixed threshold applied to every stock equally |

## Architecture

```
Frontend (React)  ──►  Backend (Express + MongoDB)  ──►  Yahoo Finance (yahoo-finance2)
                              │
                              ├─ Cron poller (every 5 min): dedupes symbols across ALL
                              │   users, so 100 users watching the same stock costs one
                              │   upstream fetch, not 100.
                              │
                              ├─ Request queue: spaces all outbound Yahoo calls at least
                              │   1.5s apart with retry/backoff on rate limits, instead of
                              │   firing them concurrently.
                              │
                              ├─ Snapshot collection: stores every fetched data point,
                              │   so the UI always has something to show, even if the
                              │   upstream provider is temporarily unavailable.
                              │
                              └─ ChangeEvent collection: append-only log of every
                                  meaningful change detected, timestamped. The "since
                                  you last checked" feature is just a query against
                                  this log filtered by the user's last-viewed timestamp.
```

**How state persists across sessions/devices:** everything lives in MongoDB, keyed by user account — watchlist membership and last-viewed timestamps are not stored client-side, so the experience is consistent across devices.

**How stale/delayed/conflicting data is handled:** the UI always shows the last known good snapshot, tagged with its age. If a live fetch fails, the error is classified (rate-limited vs. genuinely invalid symbol) and shown honestly rather than as a generic failure. If a symbol has never had a successful real fetch, a clearly-labeled synthetic baseline is shown instead of nothing.

**How it scales:** the poller fetches each distinct symbol once per cycle regardless of how many users are watching it, decoupling upstream API load from user count. Outbound requests are queued and spaced to stay under third-party rate limits as the watchlist grows.

## Known limitations

- Market data comes from Yahoo Finance's unofficial, unauthenticated endpoint (via `yahoo-finance2`) — there's no official rate limit documentation or paid tier, so it can throttle under sustained testing. The app is built to degrade gracefully when this happens (see above) rather than fail.
- NSE (India) symbol coverage on most alternative free-tier providers is limited, which is why Yahoo remains the primary source for now.

## Instructions to run

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas connection string)

### Setup (run once, from repo root)
```bash
npm install
```

### Backend
```bash
cd backend
# create a .env file with:
#   MONGO_URI=<your MongoDB connection string>
#   JWT_SECRET=<any secret string>
node server.js
```
Server runs on `http://localhost:5000`. (Uses the root `node_modules` — there's no separate `backend/package.json`.)

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:5173`.

### Optional: seed demo data
If you want the dashboard to show data without waiting on a live fetch:
```bash
cd backend
node seed.js
```

## Tech stack

- **Frontend:** React
- **Backend:** Node.js, Express, node-cron
- **Database:** MongoDB / Mongoose
- **Market data:** yahoo-finance2
