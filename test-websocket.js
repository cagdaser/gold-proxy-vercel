// Test script for WebSocket connection
import { io } from 'socket.io-client';

console.log('🔌 Connecting to Haremaltin WebSocket...');

const socket = io('wss://hrmsocketonly.haremaltin.com', {
    path: '/socket.io/',
    transports: ['websocket'],
});

socket.on('connect', () => {
    console.log('✅ Connected successfully!');
    console.log('⏳ Waiting for price_changed event...');
});

socket.on('price_changed', (data) => {
    console.log('\n📊 Price data received!');
    console.log('─'.repeat(50));

    // Debug: Show the actual data structure
    console.log('\n🔍 Data type:', typeof data);
    console.log('🔍 Data keys:', Object.keys(data));
    console.log('\n🔍 Full data (first 1000 chars):');
    console.log(JSON.stringify(data, null, 2).substring(0, 1000));

    // Try to find the prices
    let prices, meta;

    if (data && data.data && data.data.data) {
        prices = data.data.data;
        meta = data.data.meta;
    } else if (data && data.data) {
        prices = data.data;
        meta = data.meta;
    } else if (typeof data === 'object') {
        prices = data;
    }

    if (prices && typeof prices === 'object') {
        console.log('\n⏰ Timestamp:', meta?.tarih || 'N/A');
        console.log('\n💰 Sample Prices:');
        console.log(`   ALTIN (Gram): ${prices.ALTIN?.alis} / ${prices.ALTIN?.satis}`);
        console.log(`   CEYREK_YENI: ${prices.CEYREK_YENI?.alis} / ${prices.CEYREK_YENI?.satis}`);
        console.log(`   USD/TRY: ${prices.USDTRY?.alis} / ${prices.USDTRY?.satis}`);
        console.log(`   EUR/TRY: ${prices.EURTRY?.alis} / ${prices.EURTRY?.satis}`);

        console.log('\n📋 All available codes:');
        console.log(`   ${Object.keys(prices).join(', ')}`);

        console.log('\n✅ Test successful! Disconnecting...');
        socket.disconnect();
        process.exit(0);
    } else {
        console.error('❌ Could not parse price data');
        console.error('Prices value:', prices);
        socket.disconnect();
        process.exit(1);
    }
});

socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
});

socket.on('error', (error) => {
    console.error('❌ Socket error:', error.message);
    process.exit(1);
});

// Timeout after 15 seconds
setTimeout(() => {
    console.error('❌ Timeout: No data received within 15 seconds');
    socket.disconnect();
    process.exit(1);
}, 15000);
