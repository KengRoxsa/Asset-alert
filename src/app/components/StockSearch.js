import React from "react";
import useSearchAutocomplete from "../hooks/useSearchAutocomplete";

const StockSearch = ({ stocks, setStocks, removeStock }) => {
  const { query, setQuery, suggestions, setSuggestions } = useSearchAutocomplete("stock");

  const addStock = (symbol) => {
    if (symbol && !stocks.includes(symbol)) setStocks([...stocks, symbol]);
    setQuery("");
    setSuggestions([]);
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2 text-black">Stocks / Commodities</h2>
      <div className="relative mb-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search stock symbol, e.g., XAUUSD=X"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <button
            onClick={() => addStock(query)}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            Add
          </button>
        </div>
        {suggestions.length > 0 && (
          <ul className="absolute z-10 bg-white border rounded mt-1 w-full max-h-60 overflow-auto shadow">
            {suggestions.map(s => (
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
  );
};

export default StockSearch;
