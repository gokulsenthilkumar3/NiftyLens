'use client'
import { useEffect, useState, useCallback } from 'react'
import { StockPrice } from '@/types/stock'
import { supabase } from '@/lib/supabase'

const REFRESH_MS = 2000 // 2s polling fallback

export function useLivePrices() {
  const [prices, setPrices] = useState<StockPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrices = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('price_cache')
      .select('symbol, ltp, open, high, low, volume, updated_at')
      .order('symbol')
      .limit(200)

    if (err) {
      setError(err.message)
      return
    }

    const mapped: StockPrice[] = (data ?? []).map((row) => ({
      symbol: row.symbol,
      ltp: row.ltp,
      open: row.open,
      high: row.high,
      low: row.low,
      volume: row.volume,
      change: row.ltp - row.open,
      changePercent: ((row.ltp - row.open) / row.open) * 100,
      updatedAt: row.updated_at,
    }))

    setPrices(mapped)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPrices()

    // Supabase Realtime subscription on price_cache
    const channel = supabase
      .channel('price_cache_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'price_cache' },
        (payload) => {
          const updated = payload.new as any
          setPrices((prev) =>
            prev.map((s) =>
              s.symbol === updated.symbol
                ? {
                    ...s,
                    ltp: updated.ltp,
                    high: updated.high,
                    low: updated.low,
                    volume: updated.volume,
                    change: updated.ltp - s.open,
                    changePercent: ((updated.ltp - s.open) / s.open) * 100,
                    updatedAt: updated.updated_at,
                  }
                : s
            )
          )
        }
      )
      .subscribe()

    // Polling fallback (handles cold-start / WS drop)
    const interval = setInterval(fetchPrices, REFRESH_MS)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [fetchPrices])

  return { prices, loading, error }
}
