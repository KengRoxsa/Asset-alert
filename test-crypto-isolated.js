const { request } = require('undici');

const SYMBOL_MAP = {
    bitcoin: "BTCUSDT",
    ethereum: "ETHUSDT",
    dogecoin: "DOGEUSDT",
    binancecoin: "BNBUSDT",
    solana: "SOLUSDT",
    ripple: "XRPUSDT",
    cardano: "ADAUSDT",
};

async function fetchCryptoPrices(cryptos) {
    if (!cryptos || cryptos.length === 0) return {};

    const results = {};

    const promises = cryptos.map(async (id) => {
        try {
            const symbol = SYMBOL_MAP[id.toLowerCase()] || `${id.toUpperCase()}USDT`;
            console.log(`Fetching ${id} -> ${symbol}`);

            const { statusCode, body } = await request(
                `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
            );

            if (statusCode !== 200) {
                console.warn(`Binance fetch failed for ${id} (${symbol}): ${statusCode}`);
                return;
            }

            const data = await body.json();
            console.log(`Got data for ${id}:`, data);

            if (data && data.price) {
                results[id] = {
                    usd: parseFloat(data.price),
                };
            }
        } catch (err) {
            console.warn(`Error fetching ${id} from Binance:`, err.message);
        }
    });

    await Promise.all(promises);
    return results;
}

async function test() {
    console.log("Starting Test...");
    const res = await fetchCryptoPrices(["bitcoin", "ethereum", "dogecoin"]);
    console.log("Final Result:", JSON.stringify(res, null, 2));
}

test();
