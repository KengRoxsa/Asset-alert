"use server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function fetchGoldPrice() {
  let executablePath = await chromium.executablePath();

  // Fallback for local development
  if (process.env.LOCAL_CHROME_PATH) {
    executablePath = process.env.LOCAL_CHROME_PATH;
  } else if (process.platform === 'win32') {
    executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  } else if (!executablePath && process.env.NODE_ENV === 'development') {
    executablePath = "/usr/bin/google-chrome";
  }

  console.log("Launching Puppeteer with executable:", executablePath);

  if (!executablePath) {
    throw new Error(`No browser executable found for Puppeteer. Please set LOCAL_CHROME_PATH in .env.local`);
  }

  const isLocal = process.platform === 'win32' || process.env.LOCAL_CHROME_PATH;

  const browser = await puppeteer.launch({
    args: isLocal ? ["--no-sandbox", "--disable-setuid-sandbox"] : chromium.args,
    defaultViewport: isLocal ? null : chromium.defaultViewport,
    executablePath: executablePath,
    headless: isLocal ? true : chromium.headless,
  });

  try {
    const page = await browser.newPage();
    // Set user agent to look like a real browser
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    console.log("Navigating to URL...");
    await page.goto(process.env.GOLD_PRICE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });

    console.log("Waiting for selector...");
    await page.waitForSelector("div.page-title.symbol-header-info", { timeout: 15000 });

    console.log("Parsing price...");
    const priceText = await page.$eval(
      "div.page-title.symbol-header-info",
      el => {
        const text = el.innerText;
        // Match the first number format regular price (e.g. 2,654.32)
        const match = text.match(/([0-9,]+\.[0-9]{2})/);
        return match ? match[0] : null;
      }
    );
    console.log("Found price text:", priceText);

    if (!priceText) {
      throw new Error("Failed to parse gold price from page text");
    }

    return { price: parseFloat(priceText.replace(/,/g, "")), currency: "USD" };
  } catch (error) {
    console.error("Error fetching gold price:", error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}
