// Vercel API - Gold Prices Proxy (Güçlendirilmiş Versiyon)
// User-agent rotasyonu ve edge caching ile

// User-Agent havuzu - Gerçek browser user-agent'ları
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
];

// Rastgele user-agent seç
function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export default async function handler(req, res) {
    const HAREMALTIN_URL = 'https://canlipiyasalar.haremaltin.com/tmp/altin.json?dil_kodu=tr';

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const userAgent = getRandomUserAgent();

        const response = await fetch(HAREMALTIN_URL, {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'User-Agent': userAgent,
                'Referer': 'https://www.haremaltin.com/',
                'Origin': 'https://www.haremaltin.com',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site',
            },
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Cache 20 dakika (edge'de) - Next.js'ten 5 dk önce güncellenir
        res.setHeader('Cache-Control', 'public, s-maxage=1200, stale-while-revalidate=1500');
        res.setHeader('X-Data-Source', 'haremaltin-via-vercel');
        res.setHeader('X-User-Agent-Used', userAgent.substring(0, 50) + '...');

        return res.status(200).json(data);

    } catch (error) {
        console.error('Gold proxy error:', error.message);

        return res.status(503).json({
            error: 'API temporarily unavailable',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
