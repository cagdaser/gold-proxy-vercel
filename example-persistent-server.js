// Sürekli çalışan WebSocket client (örnek)
// NOT: Bu Vercel'de ÇALIŞMAZ, ayrı bir sunucu gerektirir

import { io } from 'socket.io-client';
import express from 'express';

const app = express();
let latestPrices = null;
let lastUpdate = null;

// WebSocket bağlantısı kur
const socket = io('wss://hrmsocketonly.haremaltin.com', {
    path: '/socket.io/',
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: Infinity
});

socket.on('connect', () => {
    console.log('✅ WebSocket connected');
});

socket.on('price_changed', (data) => {
    if (data && data.data) {
        latestPrices = {
            data: data.data,
            meta: data.meta
        };
        lastUpdate = new Date();
        console.log('📊 Prices updated:', lastUpdate.toISOString());
    }
});

socket.on('disconnect', () => {
    console.log('❌ WebSocket disconnected, reconnecting...');
});

// API endpoint
app.get('/api/prices', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (!latestPrices) {
        return res.status(503).json({
            error: 'No data available yet',
            message: 'WebSocket is connecting...'
        });
    }

    res.json({
        ...latestPrices,
        cached_at: lastUpdate
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
