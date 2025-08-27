import puppeteer from "puppeteer";

export async function GET() {
  const url = "https://www.barchart.com/forex/quotes/^XAUUSD";

  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // จำลอง browser header
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2" });

    // รอ element ราคาหลัก render (Angular)
    await page.waitForFunction(
      () => {
        const el = document.querySelector("span.last-change.ng-binding");
        return el && el.textContent.trim() !== "";
      },
      { timeout: 15000 }
    );

    // ดึงราคาทอง
    const priceText = await page.$eval(
      "span.last-change.ng-binding",
      el => el.textContent.trim()
    );

    await browser.close();

    const price = parseFloat(priceText.replace(/,/g, ""));
    return new Response(
      JSON.stringify({ price, currency: "USD" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
