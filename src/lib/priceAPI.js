// lib/priceAPI.js
import yahooFinance from "yahoo-finance2";
import { request } from "undici";
import chromium from "@sparticuz/chromium"; // Changed import
import puppeteer from "puppeteer-core";

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
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(), // <-- แก้ตรงนี้
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();
    await page.goto(process.env.GOLD_PRICE_URL, { waitUntil: "networkidle2" });

    await page.waitForFunction(() => {
      const el = document.querySelector("span.last-change.ng-binding");
      return el && el.textContent.trim() !== "";
    }, { timeout: 15000 });

    const priceText = await page.$eval(
      "span.last-change.ng-binding",
      el => el.textContent.trim()
    );

    return { price: parseFloat(priceText.replace(/,/g, "")), currency: "USD" };
  } finally {
    await browser.close();
  }
}
