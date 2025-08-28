import chromium from "@sparticuz/chromium";

import puppeteer from "puppeteer-core";

export async function fetchGoldPrice() {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(), // จะดาวน์โหลด binary ตอน build
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
