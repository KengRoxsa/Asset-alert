"use server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function fetchGoldPrice() {
  // Launch Chromium ผ่าน sparticuz
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(), // จะดาวน์โหลด binary ให้เอง
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();
    await page.goto(process.env.GOLD_PRICE_URL, { waitUntil: "networkidle2" });

    // รอให้ element ราคาปรากฏ
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
