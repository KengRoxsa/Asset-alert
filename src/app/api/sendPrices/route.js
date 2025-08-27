import axios from "axios";
import { fetchStockPrices, fetchCryptoPrices, fetchGoldPrice } from "../../../lib/priceAPI";

const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

// Define the list of assets to fetch
const stocksToFetch = ["AAPL", "GOOGL", "MSFT"];
const cryptosToFetch = ["bitcoin", "ethereum", "dogecoin"];

export async function GET() {
  try {
    // Fetch prices
    const stocks = await fetchStockPrices(stocksToFetch);
    const crypto = await fetchCryptoPrices(cryptosToFetch);
    const gold = await fetchGoldPrice();

    // Create message
    let msg = `**ราคาสินทรัพย์ล่าสุด**\n\n`;
    msg += `💰 **Gold (XAU/USD):** ${gold.price} ${gold.currency}\n\n`;
    msg += `**Crypto:**\n`;
    Object.entries(crypto).forEach(([id, val]) => {
      msg += `💸 ${id}: ${val.usd} USD\n`;
    });
    msg += `\n**Stocks:**\n`;
    stocks.forEach(s => {
      msg += `📈 ${s.symbol}: ${s.price} ${s.currency}\n`;
    });

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