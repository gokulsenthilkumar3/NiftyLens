import httpx
import asyncio
from typing import List, Dict

# NSEPy-compatible unofficial NSE endpoint
NSE_QUOTE_URL = "https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20200"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
    "Referer": "https://www.nseindia.com/market-data/live-equity-market",
}

async def fetch_nse_top200() -> List[Dict]:
    async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
        # Session cookie required by NSE
        await client.get("https://www.nseindia.com", headers=HEADERS)
        resp = await client.get(NSE_QUOTE_URL, headers=HEADERS)
        resp.raise_for_status()
        data = resp.json()

    records = []
    for item in data.get("data", []):
        try:
            records.append({
                "symbol": item["symbol"],
                "ltp": float(item["lastPrice"]),
                "open": float(item["open"]),
                "high": float(item["dayHigh"]),
                "low": float(item["dayLow"]),
                "volume": int(item["totalTradedVolume"]),
            })
        except (KeyError, ValueError):
            continue

    return records
