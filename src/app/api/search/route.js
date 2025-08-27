
import yahooFinance from "yahoo-finance2";
import { request } from "undici";

// --- Simple in-memory cache for CoinGecko coin list ---
let coinListCache = null;
let coinListLastFetch = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

async function getCoinList() {
  const now = Date.now();
  if (coinListCache && now - coinListLastFetch < CACHE_DURATION) {
    return coinListCache;
  }

  try {
    const { body } = await request("https://api.coingecko.com/api/v3/coins/list");
    const allCoins = await body.json();
    coinListCache = allCoins;
    coinListLastFetch = now;
    return coinListCache;
  } catch (error) {
    console.error("Failed to fetch CoinGecko coin list:", error);
    // Return stale cache if available, otherwise throw
    if (coinListCache) return coinListCache;
    throw error;
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("query");
    const type = url.searchParams.get("type"); // 'stock' or 'crypto'

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let suggestions = [];

    if (type === "stock") {
      const results = await yahooFinance.search(query);
      suggestions = results.quotes.slice(0, 5).map((q) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
      }));
    } else if (type === "crypto") {
      const allCoins = await getCoinList();
      const lowerCaseQuery = query.toLowerCase();
      suggestions = allCoins
        .filter(
          (c) =>
            c.id.toLowerCase().includes(lowerCaseQuery) ||
            c.symbol.toLowerCase().includes(lowerCaseQuery) ||
            c.name.toLowerCase().includes(lowerCaseQuery)
        )
        .slice(0, 5);
    } else {
      return new Response(JSON.stringify({ error: "Invalid type specified" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(suggestions, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
