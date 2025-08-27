import React from "react";
import useSearchAutocomplete from "../hooks/useSearchAutocomplete";

const CryptoSearch = ({ crypto, setCrypto, removeCrypto }) => {
  const { query, setQuery, suggestions, setSuggestions } = useSearchAutocomplete("crypto");

  const addCrypto = (id) => {
    if (id && !crypto.includes(id)) setCrypto([...crypto, id]);
    setQuery("");
    setSuggestions([]);
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2 text-black">Crypto</h2>
      <div className="relative mb-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search crypto id, e.g., bitcoin"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <button
            onClick={() => addCrypto(query)}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            Add
          </button>
        </div>
        {suggestions.length > 0 && (
          <ul className="absolute z-10 bg-white border rounded mt-1 w-full max-h-60 overflow-auto shadow">
            {suggestions.map(c => (
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
  );
};

export default CryptoSearch;
