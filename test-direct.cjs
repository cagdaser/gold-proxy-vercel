// Direct browser test - no server
const { connect } = require('puppeteer-real-browser');

async function testDirectBrowser() {
    console.log('🚀 Starting direct browser test (no proxy)...\n');
    
    const { browser, page } = await connect({
        headless: false, // SEE THE BROWSER
       turnstile: true,
        args: ['--start-maximized'],
        connectOption: {
            defaultViewport: null
        }
    });
    
    console.log('✅ Browser launched');
    
    // WebSocket intercept
    const client = await page.target().createCDPSession();
    await client.send('Network.enable');
    
    let priceData = null;
    let wsMessageCount = 0;
    
    client.on('Network.webSocketFrameReceived', ({ response }) => {
        wsMessageCount++;
        console.log(`📡 WS Message #${wsMessageCount}:`, response.payloadData.substring(0, 100));
        
        try {
            const data = response.payloadData;
            const match = data.match(/\["price_changed",({.+})\]/);
            if (match) {
                priceData = JSON.parse(match[1]);
                console.log('\n🎉 PRICE DATA CAPTURED!');
            }
        } catch (e) {
            // ignore
        }
    });
    
    console.log('📡 Navigating to Haremaltin...\n');
    await page.goto('https://www.haremaltin.com/', {
        waitUntil: 'networkidle2',
        timeout: 60000
    });
    
    console.log('✅ Page loaded, waiting for WebSocket data...\n');
    
    for (let i = 0; i < 60 && !priceData; i++) {
        await new Promise(r => setTimeout(r, 1000));
        process.stdout.write(`⏱️  ${i+1}s (${wsMessageCount} WS messages)...\r`);
    }
    
    if (priceData) {
        console.log('\n\n✅ SUCCESS! Price data received');
        console.log('Sample:', JSON.stringify(priceData.data.ALTIN, null, 2));
    } else {
        console.log(`\n\n❌ TIMEOUT after 60s. Received ${wsMessageCount} WebSocket messages but no price_changed event`);
    }
    
    console.log('\n⏸️  Keeping browser open for 10 seconds...');
    await new Promise(r => setTimeout(r, 10000));
    
    await browser.close();
}

testDirectBrowser().catch(console.error);
