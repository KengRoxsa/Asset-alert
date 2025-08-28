// lib/priceAPI.js
import yahooFinance from "yahoo-finance2";
import { request } from "undici";
import axios from "axios"; // Added axios

/**
 * ดึงราคาหุ้น
 */
export async function fetchStockPrices(stocks) {
  if (!stocks || stocks.length === 0) return [];
  let stockQuotes = await yahooFinance.quote(stocks);
  if (!Array.isArray(stockQuotes)) stockQuotes = [stockQuotes];
  return stockQuotes.map((q) => ({
    symbol: q.symbol,
    price: q.regularMarketPrice,
    currency: q.currency,
  }));
}

/**
 * ดึงราคา crypto
 */
export async function fetchCryptoPrices(cryptos) {
  if (!cryptos || cryptos.length === 0) return {};
  const { body } = await request(
    `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
      cryptos.join(",")
    )}&vs_currencies=usd`
  );
  return await body.json();
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