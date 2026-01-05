const axios = require('axios');

async function testBatchAxios() {
    const symbols = 'AAPL,MSFT,TSLA';
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;

    console.log(`Testing Direct Axios Batch Fetch for: ${symbols}`);

    try {
        const res = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            }
        });

        console.log('Success! Status:', res.status);
        const quotes = res.data?.quoteResponse?.result;
        console.log('Found:', quotes.length, 'quotes');
        quotes.forEach(q => console.log(`${q.symbol}: ${q.regularMarketPrice}`));

    } catch (error) {
        console.error('Failed:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
}

testBatchAxios();
