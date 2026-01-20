import { io } from 'socket.io-client';

// WebSocket bağlantısı ve veri alma fonksiyonu
async function fetchGoldPricesViaWebSocket() {
    return new Promise((resolve, reject) => {
        const WEBSOCKET_URL = 'wss://hrmsocketonly.haremaltin.com';
        const timeout = setTimeout(() => {
            socket.disconnect();
            reject(new Error('WebSocket connection timeout'));
        }, 10000); // 10 saniye timeout

        const socket = io(WEBSOCKET_URL, {
            path: '/socket.io/',
            transports: ['websocket'],
            reconnection: false, // Tek seferlik bağlantı
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

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const data = await fetchGoldPricesViaWebSocket();

        // Cache için header'lar
        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
        res.setHeader('X-Data-Source', 'haremaltin-websocket');

        return res.status(200).json(data);

    } catch (error) {
        console.error('WebSocket error:', error);
        return res.status(503).json({
            error: 'WebSocket connection failed',
            details: error.message,
            fallback: 'Try using /api/gold-prices-iscilik for labor costs'
        });
    }
}
