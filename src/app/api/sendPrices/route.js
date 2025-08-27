import axios from "axios";
import { fetchPrices, fetchGoldPrice } from "@/lib/usePriceFetching"; // หรือ path ของคุณจริง

const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

export async function GET() {
  try {
    // ดึงราคาสินทรัพย์
    const { stocks, crypto } = await fetchPrices();
    const gold = await fetchGoldPrice();

    // สร้างข้อความ
    let msg = `💰 Gold (XAU/USD): ${gold.price} ${gold.currency}\n`;
    Object.entries(crypto).forEach(([id, val]) => {
      msg += `💸 ${id}: ${val.usd} USD\n`;
    });
    stocks.forEach(s => {
      msg += `📈 ${s.symbol}: ${s.price} ${s.currency}\n`;
    });

    // ส่งข้อความเข้า Discord
    await axios.post(DISCORD_WEBHOOK, { content: msg });

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
