# Gold Proxy Vercel - WebSocket API

Real-time gold and currency price API using Haremaltin's WebSocket connection.

## 🚀 Quick Start

### Available Endpoints

#### 1. WebSocket-Based Gold Prices (Recommended)
```
GET /api/gold-prices-ws
```

Returns real-time gold and currency prices via WebSocket connection.

**Example Response:**
```json
{
  "data": {
    "ALTIN": {
      "code": "ALTIN",
      "alis": "6700.440",
      "satis": "6734.630",
      "tarih": "20-01-2026 21:26:24",
      "dir": {"alis_dir": "up", "satis_dir": "up"},
      "dusuk": "6586.110",
      "yuksek": "6739.020",
      "kapanis": "6304.020"
    },
    "CEYREK_YENI": {...},
    "USDTRY": {...},
    "EURTRY": {...}
  },
  "meta": {
    "time": 1768933584856
  }
}
```

#### 2. Labor Costs (İşçilik)
```
GET /api/gold-prices-iscilik
```

Returns labor costs for gold products.

**Example Response:**
```json
{
  "tl": {
    "CEYREK_YENI_alis": "1.6300",
    "CEYREK_YENI_satis": "1.6350",
    ...
  },
  "has": {...}
}
```

## 📊 Available Price Codes

### Gold Products
- `ALTIN` - Has Altın (Pure Gold per gram)
- `CEYREK_YENI` / `CEYREK_ESKI` - Quarter Gold (New/Old)
- `YARIM_YENI` / `YARIM_ESKI` - Half Gold (New/Old)
- `TEK_YENI` / `TEK_ESKI` - Full Gold (New/Old)
- `ATA_YENI` / `ATA_ESKI` - Ata Gold (New/Old)
- `GREMESE_YENI` / `GREMESE_ESKI` - Gremse Gold (New/Old)
- `ATA5_YENI` / `ATA5_ESKI` - 5 Ata Gold (New/Old)
- `KULCEALTIN` - Gold Bar
- `ONS` - Ounce

### Currencies
- `USDTRY` - USD/TRY
- `EURTRY` - EUR/TRY
- `GBPTRY` - GBP/TRY
- And many more...

## 🛠️ Development

### Install Dependencies
```bash
npm install
```

### Test WebSocket Connection
```bash
node test-websocket.js
```

### Deploy to Vercel
```bash
vercel deploy
```

## 📖 Documentation

See [WEBSOCKET_GUIDE.md](./WEBSOCKET_GUIDE.md) for detailed documentation on:
- WebSocket connection details
- Data structure
- Usage examples
- Migration guide

## 🔧 Technical Details

- **WebSocket URL**: `wss://hrmsocketonly.haremaltin.com/socket.io/`
- **Event**: `price_changed`
- **Protocol**: Socket.IO v4.x
- **Authentication**: None required
- **Cache**: 60 seconds (configurable)

## ⚠️ Important Notes

1. **Old Endpoint Deprecated**: The old `/tmp/altin.json` endpoint returns 404
2. **On-Demand Connection**: Each API call creates a new WebSocket connection
3. **Timeout**: 10 seconds maximum wait time
4. **CORS**: Enabled for all origins

## 📝 License

Private project

## 🤝 Contributing

This is a private project for proxying Haremaltin data.
