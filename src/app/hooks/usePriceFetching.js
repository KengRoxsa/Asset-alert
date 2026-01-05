"use client";

import { useState, useEffect } from "react";

const usePriceFetching = (stocks, crypto) => {
  const [prices, setPrices] = useState(null);
  const [goldPrice, setGoldPrice] = useState({ price: null, currency: null });
  const [loading, setLoading] = useState(false);
  const [loadingGold, setLoadingGold] = useState(false);

  const fetchGoldPrice = async () => {
    setLoadingGold(true);
    try {
      const res = await fetch("/api/gold");
      if (!res.ok) {
        const text = await res.text();
        if (res.status === 429) {
          console.warn("Rate limited (429) while fetching gold price:", text);
          // Optional: handle rate limit UI
        } else {
          console.error(`Error fetching gold price (${res.status}):`, text);
        }
        return; // Exit early
      }
      const data = await res.json();
      setGoldPrice({ price: data.price, currency: data.currency });
    } catch (err) {
      console.error("Error fetching gold price:", err);
    } finally {
      setLoadingGold(false);
    }
  };

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const stockQueryParam = stocks.join(",");
      const cryptoQueryParam = crypto.join(",");
      const res = await fetch(
        `/api/prices?stocks=${encodeURIComponent(stockQueryParam)}&crypto=${encodeURIComponent(cryptoQueryParam)}`
      );

      if (!res.ok) {
        const text = await res.text();
        if (res.status === 429) {
          console.warn("Rate limited (429) while fetching prices:", text);
        } else {
          console.error(`Error fetching prices (${res.status}):`, text);
        }
        return; // Exit early
      }

      const data = await res.json();
      setPrices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we have something to fetch or it's the first client render
    fetchPrices();
    fetchGoldPrice();
  }, [stocks, crypto]);

  return { prices, goldPrice, loading, loadingGold, fetchPrices, fetchGoldPrice };
};

export default usePriceFetching;

