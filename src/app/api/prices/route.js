import yahooFinance from "yahoo-finance2";
import { request } from "undici";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const stocksParam = url.searchParams.get("stocks"); // ตัวอย่าง: AAPL,XAUUSD=X
    const cryptoParam = url.searchParams.get("crypto"); // ตัวอย่าง: bitcoin,ethereum

    // ---- Parse symbols ----
    const stocks = stocksParam ? stocksParam.split(",") : [];
    const cryptos = cryptoParam ? cryptoParam.split(",") : [];

    // ---- Fetch stocks/commodities from Yahoo Finance ----
    let stockQuotes = [];
    if (stocks.length > 0) {
      stockQuotes = await yahooFinance.quote(stocks);
      // ถ้า symbol เดียว yahooFinance.quote คืน object แทน array
      if (!Array.isArray(stockQuotes)) stockQuotes = [stockQuotes];
      stockQuotes = stockQuotes.map((q) => ({
        symbol: q.symbol,
        price: q.regularMarketPrice,
        currency: q.currency,
      }));
    }

    // ---- Fetch crypto from CoinGecko ----
    let cryptoPrices = {};
    if (cryptos.length > 0) {
      const { body } = await request(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
          cryptos.join(",")
        )}&vs_currencies=usd`
      );
      cryptoPrices = await body.json();
    }

    // ---- Return combined result ----
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
