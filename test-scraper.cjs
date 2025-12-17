const puppeteer = require("puppeteer-core");

async function testFetch() {
    const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const url = "https://www.barchart.com/forex/quotes/%5EXAUUSD";

    console.log("Launching browser...");
    const browser = await puppeteer.launch({
        executablePath,
        headless: false, // Open browser so we can see what's happening
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    try {
        console.log("Opening new page...");
        const page = await browser.newPage();

        // Set user agent to look like a real browser
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

        console.log("Navigating to URL...");
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

        console.log("Waiting for selector...");
        await page.waitForSelector("div.page-title.symbol-header-info", { timeout: 30000 });

        console.log("Parsing price...");
        const priceText = await page.$eval(
            "div.page-title.symbol-header-info",
            el => el.innerText
        );
        console.log("Full text found:", priceText);

        const match = priceText.match(/([0-9,]+\.[0-9]{2})/);
        console.log("Extracted Price:", match ? match[0] : "Not found");

    } catch (err) {
        console.error("Error during test:", err);
    } finally {
        console.log("Closing browser in 5 seconds...");
        setTimeout(() => browser.close(), 5000);
    }
}

testFetch();
