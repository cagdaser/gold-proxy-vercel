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
        const response = await fetch(HAREMALTIN_URL, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
                'Accept-Language': 'tr-TR,tr;q=0.9',
            },
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // 20 dakika cache (1200 saniye)
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
