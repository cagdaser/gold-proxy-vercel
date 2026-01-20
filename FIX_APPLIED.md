# Quick Fix Applied ✅

## Problem
The old `api/gold-prices.js` was still using the deprecated HTTP endpoint that returns 404.

## Solution
Updated `api/gold-prices.js` to use WebSocket connection, same as `api/gold-prices-ws.js`.

## Next Steps
```bash
git add .
git commit -m "fix: update default endpoint to use WebSocket"
git push
```

Vercel will automatically redeploy and the error will be fixed!

## Available Endpoints After Deploy

All these will work:
- `/` → WebSocket-based prices
- `/api/gold-prices` → WebSocket-based prices  
- `/api/gold-prices-ws` → WebSocket-based prices
- `/api/gold-prices-iscilik` → Labor costs
