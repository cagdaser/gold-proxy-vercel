const express = require('express');
const { connect } = require('puppeteer-real-browser');

const app = express();
const PORT = process.env.PORT || 3000;

// Cache için
let cachedPriceData = null;
let lastFetchTime = null;
const CACHE_DURATION = 30 * 1000; // 30 saniye

// Mobil proxy configuration
const PROXY_CONFIG = process.env.PROXY_URL ? {
    host: process.env.PROXY_HOST || 'vrlpb0mka.localto.net',
    port: process.env.PROXY_PORT || '4468',
    username: process.env.PROXY_USERNAME || 'AgOBUXaQ',
    password: process.env.PROXY_PASSWORD || '9kIb2mCg'
} : null;

async function fetchGoldPrices() {
    console.log('🔄 Fetching gold prices...');

    const connectOptions = {
        headless: 'new', // Production headless (newer Chromium mode)
        turnstile: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        connectOption: {
            defaultViewport: null
        }
    };

    // Proxy varsa ekle
    if (PROXY_CONFIG) {
        connectOptions.proxy = PROXY_CONFIG;
    }

    const { browser, page } = await connect(connectOptions);

    try {
        // WebSocket intercept için CDP
        const client = await page.target().createCDPSession();
        await client.send('Network.enable');

        let priceData = null;

        // WebSocket mesajlarını yakala
        client.on('Network.webSocketFrameReceived', ({ response }) => {
            try {
                const data = response.payloadData;
                const match = data.match(/\["price_changed",({.+})\]/);
                if (match) {
                    priceData = JSON.parse(match[1]);
                }
            } catch (e) {
                // Ignore parsing errors
            }
        });

        // Haremaltin'e git
        await page.goto('https://www.haremaltin.com/', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // WebSocket verisini bekle (max 30 saniye)
        for (let i = 0; i < 30 && !priceData; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (!priceData) {
            throw new Error('Price data not received within timeout');
        }

        console.log('✅ Gold prices fetched successfully');
        return priceData;

    } finally {
        await browser.close();
    }
}

// API endpoint
app.get('/api/gold-prices', async (req, res) => {
    try {
        const now = Date.now();

        // Cache kontrolü
        if (cachedPriceData && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
            console.log('📦 Returning cached data');
            return res.json({
                source: 'cache',
                cached_at: new Date(lastFetchTime).toISOString(),
                data: cachedPriceData
            });
        }

        // Yeni veri çek
        const priceData = await fetchGoldPrices();

        // Cache'e kaydet
        cachedPriceData = priceData;
        lastFetchTime = now;

        res.json({
            source: 'live',
            fetched_at: new Date(now).toISOString(),
            data: priceData
        });

    } catch (error) {
        console.error('❌ Error:', error.message);

        // Cache varsa onu dön
        if (cachedPriceData) {
            return res.json({
                source: 'cache_fallback',
                error: error.message,
                data: cachedPriceData
            });
        }

        res.status(503).json({
            error: 'Failed to fetch gold prices',
            message: error.message
        });
    }
});

//Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        cache_age: lastFetchTime ? (Date.now() - lastFetchTime) / 1000 : null
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Gold Price API running on port ${PORT}`);
    console.log(`📡 Proxy: ${PROXY_CONFIG ? 'Enabled' : 'Disabled'}`);
});
