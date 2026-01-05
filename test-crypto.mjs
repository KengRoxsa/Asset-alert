import { fetchCryptoPrices } from './src/lib/priceAPI.js';

async function testCrypto() {
    const coins = ['bitcoin', 'ethereum', 'dogecoin'];
    console.log('Testing Crypto Fetch for:', coins);

    try {
        const results = await fetchCryptoPrices(coins);
        console.log('Results:', JSON.stringify(results, null, 2));
    } catch (err) {
        console.error('Test Failed:', err);
    }
}

testCrypto();
