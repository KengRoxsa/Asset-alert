"use client";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [stocks, setStocks] = useState(() => {
    try {
      const saved = localStorage.getItem("stocks");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error parsing stocks from localStorage", error);
      return ["AAPL", "^GSPC", "XAUUSD=X"];
    }
  });
  const [crypto, setCrypto] = useState(() => {
    try {
      const saved = localStorage.getItem("crypto");
      return saved ? JSON.parse(saved) : ["bitcoin", "ethereum", "dogecoin"];
    } catch (error) {
      console.error("Error parsing crypto from localStorage", error);
      return ["bitcoin", "ethereum", "dogecoin"];
    }
  });
  const [stockQuery, setStockQuery] = useState("");
  const [cryptoQuery, setCryptoQuery] = useState("");
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const [cryptoSuggestions, setCryptoSuggestions] = useState([]);
  const [prices, setPrices] = useState(null);
  const [goldPrice, setGoldPrice] = useState({ price: null, currency: null }); // New state for gold price

  useEffect(() => {
    localStorage.setItem("stocks", JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem("crypto", JSON.stringify(crypto));
  }, [crypto]);

  // Fetch gold price from API
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

  // Fetch prices from API
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
    fetchGoldPrice(); // Fetch gold price on mount
  }, []);

  // ---- Stock search autocomplete ----
  useEffect(() => {
    const fetchStockSuggestions = async () => {
      if (!stockQuery) return setStockSuggestions([]);
      try {
        const res = await fetch(`/api/search?type=stock&query=${encodeURIComponent(stockQuery)}`);
        const data = await res.json();
        setStockSuggestions(data);
      } catch {
        setStockSuggestions([]);
      }
    };
    const debounce = setTimeout(fetchStockSuggestions, 300); // Debounce to avoid too many requests
    return () => clearTimeout(debounce);
  }, [stockQuery]);

  // ---- Crypto search autocomplete ----
  useEffect(() => {
    const fetchCryptoSuggestions = async () => {
      if (!cryptoQuery) return setCryptoSuggestions([]);
      try {
        const res = await fetch(`/api/search?type=crypto&query=${encodeURIComponent(cryptoQuery)}`);
        const data = await res.json();
        setCryptoSuggestions(data);
      } catch {
        setCryptoSuggestions([]);
      }
    };
    const debounce = setTimeout(fetchCryptoSuggestions, 300); // Debounce to avoid too many requests
    return () => clearTimeout(debounce);
  }, [cryptoQuery]);

  const addStock = (symbol) => {
    if (symbol && !stocks.includes(symbol)) setStocks([...stocks, symbol]);
    setStockQuery("");
    setStockSuggestions([]);
  };

  const addCrypto = (id) => {
    if (id && !crypto.includes(id)) setCrypto([...crypto, id]);
    setCryptoQuery("");
    setCryptoSuggestions([]);
  };

  const removeStock = (symbol) => setStocks(stocks.filter(s => s !== symbol));
  const removeCrypto = (id) => setCrypto(crypto.filter(c => c !== id));

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-black">Price Dashboard</h1>

      {/* ---- Stocks / Commodities ---- */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-black">Stocks / Commodities</h2>
        <div className="relative mb-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search stock symbol, e.g., XAUUSD=X"
              value={stockQuery}
              onChange={e => setStockQuery(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <button
              onClick={() => addStock(stockQuery)}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              Add
            </button>
          </div>
          {stockSuggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border rounded mt-1 w-full max-h-60 overflow-auto shadow">
              {stockSuggestions.map(s => (
                <li
                  key={s.symbol}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-black"
                  onClick={() => addStock(s.symbol)}
                >
                  <span className="font-bold">{s.symbol}</span> - {s.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {stocks.map(s => (
            <span key={s} className="bg-white border text-black px-3 py-1 rounded flex items-center gap-2 shadow-sm">
              {s}
              <button onClick={() => removeStock(s)} className="font-bold text-red-500">x</button>
            </span>
          ))}
        </div>
      </div>

      {/* ---- Crypto ---- */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-black">Crypto</h2>
        <div className="relative mb-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search crypto id, e.g., bitcoin"
              value={cryptoQuery}
              onChange={e => setCryptoQuery(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <button
              onClick={() => addCrypto(cryptoQuery)}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              Add
            </button>
          </div>
          {cryptoSuggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border rounded mt-1 w-full max-h-60 overflow-auto shadow">
              {cryptoSuggestions.map(c => (
                <li
                  key={c.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-black"
                  onClick={() => addCrypto(c.id)}
                >
                  <span className="font-bold">{c.id}</span> - {c.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {crypto.map(c => (
            <span key={c} className="bg-white border text-black px-3 py-1 rounded flex items-center gap-2 shadow-sm">
              {c}
              <button onClick={() => removeCrypto(c)} className="font-bold text-red-500">x</button>
            </span>
          ))}
        </div>
      </div>

      {/* ---- Prices ---- */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-black">Prices</h2>
        <button
          onClick={() => {
            fetchPrices();
            fetchGoldPrice(); // Also refresh gold price
          }}
          className="mb-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          Refresh Prices
        </button>

        {/* Stock Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Gold Price Card */}
          {goldPrice.price && (
            <div className="bg-white border shadow rounded p-4 text-black">
              <div className="text-lg font-bold">Gold (XAU/USD)</div>
              <div className="text-sm">{goldPrice.currency}</div>
              <div className="text-2xl font-semibold">{goldPrice.price}</div>
            </div>
          )}
          {prices?.stocks?.map(s => (
            <div key={s.symbol} className="bg-white border shadow rounded p-4 text-black">
              <div className="text-lg font-bold">{s.symbol}</div>
              <div className="text-sm">{s.currency}</div>
              <div className="text-2xl font-semibold">{s.price}</div>
            </div>
          ))}
        </div>

        {/* Crypto Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prices?.crypto && Object.entries(prices.crypto).map(([id, val]) => (
            <div key={id} className="bg-white border shadow rounded p-4 text-black">
              <div className="text-lg font-bold">{id}</div>
              <div className="text-2xl font-semibold">{val.usd} USD</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}