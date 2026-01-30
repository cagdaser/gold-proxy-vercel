import { io } from 'socket.io-client';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

// WebSocket bağlantısı ve veri alma fonksiyonu
async function fetchGoldPricesViaWebSocket() {
    return new Promise((resolve, reject) => {
        const WEBSOCKET_URL = 'wss://hrmsocketonly.haremaltin.com';

        // Proxy configuration from environment variables
        // Supports both HTTP and SOCKS proxies - auto-detected from URL protocol
        let proxyConfig = {};
        if (process.env.PROXY_URL) {
            const proxyUrl = process.env.PROXY_URL;
            const agent = proxyUrl.startsWith('socks')
                ? new SocksProxyAgent(proxyUrl)
                : new HttpsProxyAgent(proxyUrl);

            proxyConfig = {
                agent,
                transportOptions: {
                    polling: {
                        extraHeaders: {
                            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                            'Origin': 'https://www.haremaltin.com',
                            'Referer': 'https://www.haremaltin.com/'
                        }
                    }
                }
            };
        }

        const timeout = setTimeout(() => {
            socket.disconnect();
            reject(new Error('Connection timeout - Cloudflare may be blocking requests'));
        }, 15000); // 15 saniye timeout (increased from 10s)

        const socket = io(WEBSOCKET_URL, {
            path: '/socket.io/',
            transports: ['websocket'],
            reconnection: false, // Tek seferlik bağlantı
            extraHeaders: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                'Origin': 'https://www.haremaltin.com',
                'Referer': 'https://www.haremaltin.com/'
            },
            ...proxyConfig
        });

        socket.on('connect', () => {
            console.log('WebSocket connected');
        });

        socket.on('price_changed', (data) => {
            clearTimeout(timeout);
            socket.disconnect();

            // Data structure is: { meta: {...}, data: {...} }
            if (data && data.data) {
                resolve({
                    data: data.data,
                    meta: data.meta
                });
            } else {
                reject(new Error('Invalid data format received'));
            }
        });

        socket.on('connect_error', (error) => {
            clearTimeout(timeout);
            socket.disconnect();
            reject(new Error(`WebSocket connection error: ${error.message}`));
        });

        socket.on('error', (error) => {
            clearTimeout(timeout);
            socket.disconnect();
            reject(new Error(`WebSocket error: ${error.message}`));
        });
    });
}

// Retry wrapper with exponential backoff
async function fetchWithRetry(maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fetchGoldPricesViaWebSocket();
        } catch (error) {
            if (attempt === maxRetries) throw error;
            const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms delay`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const data = await fetchWithRetry();

        // Cache için header'lar
        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
        res.setHeader('X-Data-Source', 'haremaltin-websocket');

        return res.status(200).json(data);

    } catch (error) {
        console.error('WebSocket error:', error);

        const isCloudflareBlock = error.message.includes('timeout') ||
            error.message.includes('403') ||
            error.message.includes('websocket error');

        return res.status(503).json({
            error: 'WebSocket connection failed',
            details: error.message,
            cloudflare_blocked: isCloudflareBlock,
            suggestion: isCloudflareBlock ? 'Cloudflare protection may be blocking the connection. Try again in a few seconds.' : 'Unknown error occurred',
            fallback: 'Try using /api/gold-prices-iscilik for labor costs'
        });
    }
}
