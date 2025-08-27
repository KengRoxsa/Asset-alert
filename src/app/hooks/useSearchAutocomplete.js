import { useState, useEffect } from "react";

const useSearchAutocomplete = (type) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query) return setSuggestions([]);
      try {
        const res = await fetch(`/api/search?type=${type}&query=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      }
    };
    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query, type]);

  return { query, setQuery, suggestions, setSuggestions };
};

export default useSearchAutocomplete;
