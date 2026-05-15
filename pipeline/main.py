from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import logging

from pipeline.fetcher import fetch_nse_top200
from pipeline.writer import upsert_price_cache

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

POLL_INTERVAL = 2  # seconds

async def price_loop():
    while True:
        try:
            prices = await fetch_nse_top200()
            if prices:
                await upsert_price_cache(prices)
                logger.info(f"Updated {len(prices)} symbols")
        except Exception as e:
            logger.error(f"Fetch error: {e}")
        await asyncio.sleep(POLL_INTERVAL)

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(price_loop())
    yield
    task.cancel()

app = FastAPI(title="NiftyLens Data Pipeline", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/prices")
async def get_prices():
    """Direct endpoint — fallback if Supabase realtime is unavailable"""
    prices = await fetch_nse_top200()
    return prices
