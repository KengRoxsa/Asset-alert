import { fetchStockPrices, fetchCryptoPrices } from "../../../lib/priceAPI";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const stocksParam = url.searchParams.get("stocks");
    const cryptoParam = url.searchParams.get("crypto");

    const stocks = stocksParam ? stocksParam.split(",") : [];
    const cryptos = cryptoParam ? cryptoParam.split(",") : [];

    const stockQuotes = await fetchStockPrices(stocks);
    const cryptoPrices = await fetchCryptoPrices(cryptos);

    const result = {
      stocks: stockQuotes,
      crypto: cryptoPrices,
    };

    return new Response(JSON.stringify(result, null, 2), {
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