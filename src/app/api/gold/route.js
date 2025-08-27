import { fetchGoldPrice } from "../../../lib/priceAPI";

export async function GET() {
  try {
    const goldPrice = await fetchGoldPrice();
    return new Response(JSON.stringify(goldPrice), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}