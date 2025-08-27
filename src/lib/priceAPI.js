
import yahooFinance from "yahoo-finance2";
import { request } from "undici";
import puppeteer from "puppeteer";

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

export async function fetchCryptoPrices(cryptos) {
  if (!cryptos || cryptos.length === 0) return {};
  const { body } = await request(
    `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
      cryptos.join(",")
    )}&vs_currencies=usd`
  );
  return await body.json();
}

export async function fetchGoldPrice() {
  const url = process.env.GOLD_PRICE_URL;
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  );
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.waitForFunction(
    () => {
      const el = document.querySelector("span.last-change.ng-binding");
      return el && el.textContent.trim() !== "";
    },
    { timeout: 15000 }
  );
  const priceText = await page.$eval(
    "span.last-change.ng-binding",
    (el) => el.textContent.trim()
  );
  await browser.close();
  const price = parseFloat(priceText.replace(/,/g, ""));
  return { price, currency: "USD" };
}
