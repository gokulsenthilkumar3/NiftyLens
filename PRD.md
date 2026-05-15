# NiftyLens — Product Requirements Document (PRD)

## 1. Overview

**Product Name:** NiftyLens  
**Tagline:** India’s sharpest stock market dashboard.  
**Type:** Real-Time Finance Web Application  
**Stack:** Next.js · TypeScript · Python FastAPI · Supabase · TradingView Lightweight Charts  
**Target Users:** Indian retail investors, swing traders, F&O traders, portfolio managers  

---

## 2. Problem Statement

Indian retail investors are scattered across Screener.in, Moneycontrol, Zerodha Kite, and NSE India — no single tool combines real-time prices, technical indicators, F&O option chain, portfolio tracking, and smart alerts in one clean interface. NiftyLens is that unified dashboard.

---

## 3. Goals & Success Metrics

| Goal | Metric | Target |
|------|--------|--------|
| User growth | Registered users | 1,000 in 3 months |
| Engagement | Daily Active Users | 30% of registered |
| Revenue | MRR | ₹75,000 in 6 months |
| Data freshness | Price update latency | < 1 second |

---

## 4. Features

### 4.1 Core (MVP)
- [ ] Live NSE/BSE price feed (WebSocket)
- [ ] Candlestick chart (1m, 5m, 15m, 1h, 1D, 1W)
- [ ] Technical indicators: RSI, MACD, Bollinger Bands, EMA
- [ ] Stock search and watchlist (save up to 20 stocks free)
- [ ] Index overview: Nifty 50, Bank Nifty, Sensex, Nifty IT
- [ ] F&O Option Chain viewer (live CE/PE data)
- [ ] Price alert: email/Telegram when stock crosses target

### 4.2 Growth (Post-MVP)
- [ ] Portfolio tracker (P&L, XIRR, sector allocation)
- [ ] Screener: filter stocks by RSI < 30, MACD crossover, etc.
- [ ] Sector heatmap (like Finviz for India)
- [ ] IPO tracker and GMP calendar
- [ ] AI-powered trade setup detection (breakout, reversal patterns)
- [ ] Broker integration (Zerodha Kite / Angel One API)

---

## 5. Architecture

```
┌────────────────────────────────────────────────────────┐
│              DATA SOURCES                              │
│  NSE India API · Upstox API · Angel One SmartAPI        │
│  Yahoo Finance (yfinance) · NSEPy                       │
└───────────────────────┬────────────────────────────────┘
                       │
           ┌─────────┴─────────┐
           │                   │
           ▼                   ▼
┌───────────────────┐  ┌───────────────────┐
│  Python FastAPI         │  │  WebSocket Feed         │
│  Data Pipeline          │  │  (live price stream)    │
│  — OHLCV aggregation   │  │  — Upstox WS           │
│  — indicator engine    │  │  — SSE fallback         │
│  — screener queries    │  └───────────────────┘
└──────────┬────────┘
           │
           ▼
┌──────────────────────────────┐
│   Supabase                    │
│   — PostgreSQL (portfolios,   │
│     watchlists, alerts)       │
│   — Realtime (alert triggers) │
│   — Edge Functions (alerts)   │
└──────────────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│   Next.js 14 Frontend         │
│   TradingView Lightweight     │
│   Charts · Tailwind CSS       │
│   Zustand (watchlist state)   │
└──────────────────────────────┘
```

---

## 6. Database Schema

```sql
users (id uuid PK, email, broker varchar, created_at)

watchlists (
  id uuid PK,
  user_id uuid FK,
  name varchar(100),
  symbols text[]      -- ["RELIANCE", "TCS", "INFY"]
)

alerts (
  id uuid PK,
  user_id uuid FK,
  symbol varchar(20),
  condition varchar(20),   -- above | below | crossover
  target_price numeric,
  channel varchar(20),     -- email | telegram
  triggered_at timestamptz,
  is_active boolean
)

portfolios (
  id uuid PK,
  user_id uuid FK,
  symbol varchar(20),
  quantity integer,
  avg_buy_price numeric,
  buy_date date
)
```

---

## 7. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Charts | TradingView Lightweight Charts v4 |
| State | Zustand |
| Backend | Python FastAPI (data pipeline) |
| Real-time | Upstox WebSocket API |
| Indicators | pandas-ta (Python) |
| Database | Supabase PostgreSQL |
| Alerts | Supabase Edge Functions → Telegram Bot |
| Deployment | Vercel (frontend) · Render (Python API) |

---

## 8. Monetization

| Tier | Price | Features |
|------|-------|----------|
| Free | ₹0 | 1 watchlist (20 stocks), basic charts, 3 alerts |
| Pro | ₹299/mo | Unlimited watchlists, F&O chain, 50 alerts, portfolio tracker |
| Trader | ₹799/mo | AI screener, broker integration, export, priority support |

---

## 9. Milestones

| Week | Deliverable |
|------|-------------|
| 1–2 | Live price feed + candlestick chart |
| 3–4 | Technical indicators (RSI, MACD, BB) |
| 5–6 | Watchlist + Supabase auth |
| 7–8 | F&O Option Chain viewer |
| 9–10 | Alert engine (Telegram + email) |
| 11–12 | Portfolio tracker + screener |
