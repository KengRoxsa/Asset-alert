"use client";
import { useState, useEffect } from "react";
import usePriceFetching from "./hooks/usePriceFetching";
import StockSearch from "./components/StockSearch";
import CryptoSearch from "./components/CryptoSearch";
import PriceCard from "./components/PriceCard";

export default function HomePage() {
  const [stocks, setStocks] = useState([]);
  const [crypto, setCrypto] = useState(["bitcoin", "ethereum", "dogecoin"]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedStocks = localStorage.getItem("stocks");
      if (savedStocks) setStocks(JSON.parse(savedStocks));

      const savedCrypto = localStorage.getItem("crypto");
      if (savedCrypto) setCrypto(JSON.parse(savedCrypto));
    } catch (error) {
      console.error("Error hydrating from localStorage", error);
    }
  }, []);

  const { prices, goldPrice, fetchPrices, fetchGoldPrice } = usePriceFetching(stocks, crypto);

  useEffect(() => {
    if (stocks.length > 0) {
      localStorage.setItem("stocks", JSON.stringify(stocks));
    }
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem("crypto", JSON.stringify(crypto));
  }, [crypto]);

  const removeStock = (symbol) => setStocks(stocks.filter(s => s !== symbol));
  const removeCrypto = (id) => setCrypto(crypto.filter(c => c !== id));

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-black">Price Dashboard</h1>

      <StockSearch stocks={stocks} setStocks={setStocks} removeStock={removeStock} />
      <CryptoSearch crypto={crypto} setCrypto={setCrypto} removeCrypto={removeCrypto} />

      {/* ---- Prices ---- */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-black">Prices</h2>
        <button
          onClick={() => {
            fetchPrices();
            fetchGoldPrice();
          }}
          className="mb-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          Refresh Prices
        </button>

        {/* Gold Price Card */}
        {goldPrice.price && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <PriceCard symbol="XAU/USD" name="Gold" price={goldPrice.price} currency={goldPrice.currency} />
          </div>
        )}

        {/* Crypto Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {prices?.crypto && Object.entries(prices.crypto).map(([id, val]) => (
            <PriceCard key={id} symbol={id} name={id} price={`${val.usd} USD`} />
          ))}
        </div>

        {/* Stock Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {prices?.stocks?.map(s => (
            <PriceCard key={s.symbol} symbol={s.symbol} name={s.symbol} price={s.price} currency={s.currency} />
          ))}
        </div>
      </div>
    </div>
  );
}
