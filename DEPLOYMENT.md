# Deployment Guide

## 🚀 Vercel Deployment (Recommended)

### Option 1: GitHub Integration (Automatic)

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Import your repository: `gold-proxy-vercel`

2. **Configure Project**:
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: (leave empty)
   - Output Directory: (leave empty)

3. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically deploy on every push to `main`

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

## 📡 After Deployment

Your API will be available at:
```
https://your-project.vercel.app/api/gold-prices-ws
https://your-project.vercel.app/api/gold-prices-iscilik
```

### Test the Deployment

```bash
# Test WebSocket endpoint
curl https://your-project.vercel.app/api/gold-prices-ws

# Test labor costs endpoint
curl https://your-project.vercel.app/api/gold-prices-iscilik
```

## 🔄 How It Works

### Serverless Architecture

```
User Request → Vercel Function → WebSocket Connect → Get Data → Return
    ↓              ↓                    ↓               ↓          ↓
  ~0ms          ~100ms              ~500ms          ~1000ms    ~1200ms
```

**Each request:**
1. Triggers a new serverless function instance
2. Connects to Haremaltin WebSocket
3. Waits for first `price_changed` event
4. Returns data with 60s cache
5. Function terminates

**Benefits:**
- ✅ No server maintenance
- ✅ Auto-scaling
- ✅ Free tier available
- ✅ Global CDN

**Limitations:**
- ⚠️ 1-2 second response time
- ⚠️ Not real-time (use polling or direct WebSocket for real-time)

## 🔧 Alternative: Persistent Connection

For better performance, you can run a persistent server:

### Requirements
- VPS or dedicated server
- Node.js runtime
- PM2 or similar process manager

### Setup

```bash
# Install dependencies
npm install express

# Run the persistent server
node example-persistent-server.js

# Or with PM2
pm2 start example-persistent-server.js --name gold-prices
pm2 save
pm2 startup
```

**Benefits:**
- ✅ Instant responses (<10ms)
- ✅ True real-time updates
- ✅ Lower latency

**Drawbacks:**
- ❌ Requires dedicated server
- ❌ Manual scaling
- ❌ Server maintenance needed

## 📊 Performance Comparison

| Metric | Serverless (Vercel) | Persistent Server |
|--------|---------------------|-------------------|
| Response Time | 1-2 seconds | <10ms |
| Setup | Easy | Medium |
| Cost | Free tier | $5-20/month |
| Maintenance | None | Regular |
| Scaling | Automatic | Manual |
| Real-time | No (polling) | Yes |

## 🎯 Recommendation

**Use Serverless (Current Setup)** if:
- You're okay with 1-2 second response time
- You want zero maintenance
- You're using free tier
- You don't need real-time updates

**Use Persistent Server** if:
- You need instant responses
- You need true real-time updates
- You have budget for VPS
- You can handle server maintenance

## 🔍 Monitoring

### Check Deployment Status

```bash
# Vercel CLI
vercel ls

# Check logs
vercel logs
```

### Test Endpoints

```bash
# Get gold prices
curl -X GET https://your-domain.vercel.app/api/gold-prices-ws

# Check response time
time curl https://your-domain.vercel.app/api/gold-prices-ws
```

## 🐛 Troubleshooting

### Function Timeout
If you see timeout errors, the WebSocket might be slow. The current timeout is 10 seconds.

### No Data Received
Check if Haremaltin's WebSocket is accessible:
```bash
node test-websocket.js
```

### CORS Issues
CORS is already configured in the API. If you still have issues, check your request headers.

## 📝 Environment Variables (Optional)

Create `.env.local` for local development:
```env
WEBSOCKET_URL=wss://hrmsocketonly.haremaltin.com
WEBSOCKET_TIMEOUT=10000
CACHE_DURATION=60
```

Then update `vercel.json` to use environment variables in production.
