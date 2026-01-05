
import yahooFinance from "yahoo-finance2";
import { request } from "undici";

// --- Curated List for Search (High Stability) ---
const TOP_COINS = [
  { id: "bitcoin", symbol: "btc", name: "Bitcoin" },
  { id: "ethereum", symbol: "eth", name: "Ethereum" },
  { id: "dogecoin", symbol: "doge", name: "Dogecoin" },
  { id: "binancecoin", symbol: "bnb", name: "BNB" },
  { id: "solana", symbol: "sol", name: "Solana" },
  { id: "ripple", symbol: "xrp", name: "XRP" },
  { id: "cardano", symbol: "ada", name: "Cardano" },
  { id: "avalanche-2", symbol: "avax", name: "Avalanche" },
  { id: "polkadot", symbol: "dot", name: "Polkadot" },
  { id: "tron", symbol: "trx", name: "TRON" },
  { id: "chainlink", symbol: "link", name: "Chainlink" },
  { id: "matic-network", symbol: "matic", name: "Polygon" },
  { id: "shiba-inu", symbol: "shib", name: "Shiba Inu" },
  { id: "litecoin", symbol: "ltc", name: "Litecoin" },
  { id: "bitcoin-cash", symbol: "bch", name: "Bitcoin Cash" },
  { id: "uniswap", symbol: "uni", name: "Uniswap" },
  { id: "stellar", symbol: "xlm", name: "Stellar" },
  { id: "monero", symbol: "xmr", name: "Monero" },
  { id: "ethereum-classic", symbol: "etc", name: "Ethereum Classic" },
  { id: "cosmos", symbol: "atom", name: "Cosmos" },
  { id: "pepe", symbol: "pepe", name: "Pepe" },
  { id: "floki", symbol: "floki", name: "Floki" },
  { id: "notcoin", symbol: "not", name: "Notcoin" },
  { id: "near", symbol: "near", name: "NEAR Protocol" },
  { id: "aptos", symbol: "apt", name: "Aptos" },
];

async function getCoinList() {
  // Return static list immediately
  return TOP_COINS;
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
      try {
        const results = await yahooFinance.search(query, {
          quotesCount: 5,
          newsCount: 0,
        });

        if (!results.quotes || results.quotes.length === 0) {
          console.log(`Stock search empty for: ${query}`);
        }

        suggestions = results.quotes.map((q) => ({
          symbol: q.symbol,
          name: q.shortname || q.longname || q.symbol,
        }));
      } catch (stockErr) {
        console.error("Yahoo Finance Search Error:", stockErr.message);
        // Fallback or just return empty
        suggestions = [];
      }
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
