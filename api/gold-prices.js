// Vercel API - Gold Prices Proxy
// User-Agent rotasyonu ile (diğer headers basit)

// User-Agent havuzu
const USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export default async function handler(req, res) {
    const HAREMALTIN_URL = 'https://canlipiyasalar.haremaltin.com/tmp/altin.json?dil_kodu=tr';

    // CORS
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
                'Accept': 'application/json',
                'User-Agent': userAgent,
                'Accept-Language': 'tr-TR,tr;q=0.9',
            },
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // 20 dakika cache
        res.setHeader('Cache-Control', 'public, s-maxage=1200, stale-while-revalidate=1500');
        res.setHeader('X-Data-Source', 'haremaltin-via-vercel');
        return res.status(200).json(data);

    } catch (error) {
        return res.status(503).json({
            error: 'API temporarily unavailable',
            details: error.message,
        });
    }
}
