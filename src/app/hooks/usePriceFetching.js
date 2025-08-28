"use client";

import { useState, useEffect } from "react";

const usePriceFetching = (stocks, crypto) => {
  const [prices, setPrices] = useState(null);
  const [goldPrice, setGoldPrice] = useState({ price: null, currency: null });

  const fetchGoldPrice = async () => {
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
    }
  };

  const fetchPrices = async () => {
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
    }
  };

  useEffect(() => {
    fetchPrices();
    fetchGoldPrice();
  }, [stocks, crypto]); // Depend on stocks and crypto to refetch when they change

  return { prices, goldPrice, fetchPrices, fetchGoldPrice };
};

export default usePriceFetching;

