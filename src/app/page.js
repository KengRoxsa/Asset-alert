"use client";
import { useState, useEffect, Suspense } from "react";
import usePriceFetching from "./hooks/usePriceFetching";
import StockSearch from "./components/StockSearch";
import CryptoSearch from "./components/CryptoSearch";
import PriceCard from "./components/PriceCard";
import DiscordNotifier from "./components/DiscordNotifier";

export default function HomePage() {
  const [stocks, setStocks] = useState([]);
  const [crypto, setCrypto] = useState(["bitcoin", "ethereum", "dogecoin"]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedStocks = localStorage.getItem("stocks");
      if (savedStocks) setStocks(JSON.parse(savedStocks));

      const savedCrypto = localStorage.getItem("crypto");
      if (savedCrypto) setCrypto(JSON.parse(savedCrypto));
    } catch (error) {
      console.error("Error hydrating from localStorage", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const { prices, goldPrice, loading, loadingGold, fetchPrices, fetchGoldPrice } = usePriceFetching(
    isHydrated ? stocks : [],
    isHydrated ? crypto : []
  );

  useEffect(() => {
    if (isHydrated && stocks.length > 0) {
      localStorage.setItem("stocks", JSON.stringify(stocks));
    }
  }, [stocks, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("crypto", JSON.stringify(crypto));
    }
  }, [crypto, isHydrated]);

  const removeStock = (symbol) => setStocks(stocks.filter(s => s !== symbol));
  const removeCrypto = (id) => setCrypto(crypto.filter(c => c !== id));

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-black">Price Dashboard</h1>

      <StockSearch stocks={stocks} setStocks={setStocks} removeStock={removeStock} />
      <CryptoSearch crypto={crypto} setCrypto={setCrypto} removeCrypto={removeCrypto} />

      {/* ---- Prices ---- */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-black">Prices</h2>
          <button
            onClick={() => {
              fetchPrices();
              fetchGoldPrice();
            }}
            disabled={loading || loadingGold}
            className={`bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-opacity ${(loading || loadingGold) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading || loadingGold ? "Refreshing..." : "Refresh Prices"}
          </button>
        </div>

        {/* Gold Price Card */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-700">Gold Market</span>
            {loadingGold && <span className="text-xs text-indigo-500 animate-pulse">(Scraping gold price...)</span>}
          </div>
          {goldPrice.price ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PriceCard symbol="XAU/USD" name="Gold" price={goldPrice.price.toLocaleString()} currency={goldPrice.currency} />
            </div>
          ) : loadingGold ? (
            <div className="text-gray-400 italic text-sm animate-pulse">Launching browser... please wait</div>
          ) : (
            <div className="text-gray-400 italic text-sm">No gold price data</div>
          )}
        </div>

        {/* Assets & Crypto */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-medium text-gray-700">Stock & Crypto Market</span>
            {loading && <span className="text-xs text-indigo-500 animate-pulse">(Updating prices...)</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Crypto Cards */}
            {prices?.crypto && Object.entries(prices.crypto).map(([id, val]) => (
              <PriceCard key={id} symbol={id} name={id.toUpperCase()} price={`${val.usd?.toLocaleString() || "0"} USD`} />
            ))}

            {/* Stock Cards */}
            {prices?.stocks?.map(s => (
              <PriceCard key={s.symbol} symbol={s.symbol} name={s.symbol} price={s.price?.toLocaleString() || "N/A"} currency={s.currency} />
            ))}
          </div>

          {!loading && !prices?.crypto && (!prices?.stocks || prices.stocks.length === 0) && (
            <div className="text-gray-400 italic text-sm">Add some assets to see prices</div>
          )}
        </div>
      </div>

      <Suspense fallback={<div>Loading components...</div>}>
        <DiscordNotifier stocks={stocks} crypto={crypto} />
      </Suspense>
    </div>
  );
}
