import axios from "axios";
import { fetchStockPrices, fetchCryptoPrices } from "../../../lib/priceAPI";
import { fetchGoldPrice } from "../../../lib/fetchGoldServer";

export const maxDuration = 60;

const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

// Define the list of assets to fetch
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Security check (Optional but recommended for automated jobs)
    const secret = searchParams.get("secret");
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const stocksParam = searchParams.get("stocks");
    const cryptoParam = searchParams.get("crypto");

    // Use params if provided, otherwise fallback to defaults for automated alerts
    const stocksToFetch = stocksParam ? stocksParam.split(",") : (process.env.DEFAULT_STOCKS?.split(",") || ["AAPL", "GOOGL", "MSFT"]);
    const cryptosToFetch = cryptoParam ? cryptoParam.split(",") : (process.env.DEFAULT_CRYPTO?.split(",") || ["bitcoin", "ethereum", "dogecoin"]);

    // Fetch prices
    const stocks = stocksToFetch.length > 0 ? await fetchStockPrices(stocksToFetch) : [];
    const crypto = await fetchCryptoPrices(cryptosToFetch);
    const gold = await fetchGoldPrice();

    // Validation: Ensure we actually got result for what was requested
    const missingAssets = [];
    if (!gold.price) missingAssets.push("Gold");

    // Check if any requested crypto is missing in the response
    cryptosToFetch.forEach(id => {
      if (!crypto[id] || crypto[id].usd === undefined) {
        missingAssets.push(id.toUpperCase());
      }
    });

    // Check if any requested stock is missing
    stocksToFetch.forEach(sym => {
      if (!stocks.find(s => s.symbol === sym)) {
        missingAssets.push(sym);
      }
    });

    if (missingAssets.length > 0) {
      throw new Error(`Failed to fetch prices for: ${missingAssets.join(", ")}. Please try refreshing the dashboard first.`);
    }

    // Create message (Ultra-simple format: All in one line)
    let parts = [];
    if (gold.price) parts.push(`Gold: ${gold.price.toLocaleString()}`);
    Object.entries(crypto).forEach(([id, val]) => {
      parts.push(`${id.toUpperCase()}: ${val.usd.toLocaleString()}`);
    });
    stocks.forEach(s => {
      parts.push(`${s.symbol}: ${s.price?.toLocaleString() || "N/A"}`);
    });
    let msg = parts.join(" | ");

    // Send message to Discord
    if (DISCORD_WEBHOOK) {
      await axios.post(DISCORD_WEBHOOK, { content: msg });
    } else {
      console.warn("DISCORD_WEBHOOK_URL environment variable is not set. Skipping sending message to Discord.");
    }

    return new Response(JSON.stringify({ success: true, message: "Sent to Discord" }), {
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
