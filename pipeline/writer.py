import os
from supabase import create_client, Client
from typing import List, Dict
from datetime import datetime, timezone

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

_client: Client | None = None

def get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client

async def upsert_price_cache(prices: List[Dict]) -> None:
    client = get_client()
    rows = [
        {
            **price,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        for price in prices
    ]
    # Upsert in batches of 100
    for i in range(0, len(rows), 100):
        client.table("price_cache").upsert(
            rows[i:i+100],
            on_conflict="symbol"
        ).execute()
