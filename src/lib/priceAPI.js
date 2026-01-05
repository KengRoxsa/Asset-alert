// lib/priceAPI.js
// import yahooFinance from "yahoo-finance2"; // Removed unused import
import { request } from "undici";
import axios from "axios";

// Configure Yahoo Finance to use a browser-like User-Agent to avoid 429 blocks
// Removed setGlobalConfig as it was causing TypeError and we are using direct Axios for prices now.

/**
 * ดึงราคาหุ้น
 */
export async function fetchStockPrices(stocks) {
  if (!stocks || stocks.length === 0) return [];

  const results = [];

  const promises = stocks.map(async (symbol) => {
    try {
      // Use Chart API which is currently more permissive than Quote API
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;

      const res = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
      });

      const meta = res.data?.chart?.result?.[0]?.meta;
      if (meta) {
        results.push({
          symbol: meta.symbol,
          price: meta.regularMarketPrice,
          currency: meta.currency,
        });
      }
    } catch (err) {
      console.warn(`Error fetching stock ${symbol} (Yahoo):`, err.message);
      // specific error logging if available
      if (err.response) {
        console.warn(`Yahoo Response (${symbol}):`, err.response.status, err.response.statusText);
      }
    }
  });

  await Promise.all(promises);
  return results;
}

// Map common names to Binance Symbols
const SYMBOL_MAP = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  dogecoin: "DOGEUSDT",
  binancecoin: "BNBUSDT",
  solana: "SOLUSDT",
  ripple: "XRPUSDT",
  cardano: "ADAUSDT",
};

/**
 * ดึงราคา crypto (Binance API)
 */
export async function fetchCryptoPrices(cryptos) {
  if (!cryptos || cryptos.length === 0) return {};

  const results = {};

  // Binance Public API is fast and has high limits, so we can fetch individually in parallel
  const promises = cryptos.map(async (id) => {
    try {
      // 1. Resolve Symbol
      const symbol = SYMBOL_MAP[id.toLowerCase()] || `${id.toUpperCase()}USDT`;

      // 2. Fetch from Binance
      const { statusCode, body } = await request(
        `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
      );

      if (statusCode !== 200) {
        console.warn(`Binance fetch failed for ${id} (${symbol}): ${statusCode}`);
        return;
      }

      const data = await body.json(); // { symbol: "BTCUSDT", price: "95000.00" }

      if (data && data.price) {
        results[id] = {
          usd: parseFloat(data.price),
        };
      }
    } catch (err) {
      console.warn(`Error fetching ${id} from Binance:`, err.message);
    }
  });

  await Promise.all(promises);
  return results;
}

/**
 * ดึงราคาทอง
 */
export async function fetchGoldPrice() {
  try {
    const response = await axios.get(process.env.GOLD_PRICE_URL);
    const data = response.data;
    // Assuming the API returns data like { "price": 1900.00, "currency": "USD" }
    return { price: data.price, currency: data.currency };
  } catch (error) {
    console.error("Error fetching gold price from API:", error);
    return { price: null, currency: null };
  }
}