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
      const data = await res.json();
      if (res.ok) {
        setGoldPrice({ price: data.price, currency: data.currency });
      } else {
        console.error("Error fetching gold price:", data.error);
      }
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

