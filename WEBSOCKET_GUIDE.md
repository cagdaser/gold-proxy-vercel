# Haremaltin WebSocket API Guide

## Overview

Haremaltin uses a WebSocket connection for real-time gold and currency price updates. This guide documents how to connect and use their WebSocket API.

## Connection Details

- **WebSocket URL**: `wss://hrmsocketonly.haremaltin.com`
- **Path**: `/socket.io/`
- **Protocol**: Socket.IO v4.x
- **Authentication**: None required
- **Transport**: WebSocket

## Event Structure

### Event Name
`price_changed`

### Data Format

```json
{
  "data": {
    "ALTIN": {
      "alis": 6703.72,
      "satis": 6737.99,
      "code": "ALTIN",
      "dir": {
        "alis_dir": "down",
        "satis_dir": "down"
      },
      "dusuk": 6586.11,
      "yuksek": 6738.18,
      "tarih": "20-01-2026 21:16:10",
      "kapanis": 6304.02
    },
    "CEYREK_YENI": {
      "alis": 10927,
      "satis": 11022,
      "code": "CEYREK_YENI"
    },
    "USDTRY": { ... },
    "EURTRY": { ... }
  },
  "meta": {
    "tarih": "20-01-2026 21:16:10",
    "time": 1768932970642
  }
}
```

## Available Price Codes

### Gold Products
- `ALTIN` - Has Altın (Pure Gold)
- `CEYREK_YENI` - Yeni Çeyrek Altın (New Quarter Gold)
- `CEYREK_ESKI` - Eski Çeyrek Altın (Old Quarter Gold)
- `YARIM_YENI` - Yeni Yarım Altın (New Half Gold)
- `YARIM_ESKI` - Eski Yarım Altın (Old Half Gold)
- `TEK_YENI` - Yeni Tam Altın (New Full Gold)
- `TEK_ESKI` - Eski Tam Altın (Old Full Gold)
- `ATA_YENI` - Yeni Ata Altın (New Ata Gold)
- `ATA_ESKI` - Eski Ata Altın (Old Ata Gold)
- `GREMESE_YENI` - Yeni Gremse Altın
- `GREMESE_ESKI` - Eski Gremse Altın
- `ATA5_YENI` - Yeni 5'li Ata
- `ATA5_ESKI` - Eski 5'li Ata
- `KULCEALTIN` - Külçe Altın (Gold Bar)
- `ONS` - Ons (Ounce)

### Currencies
- `USDTRY` - Dolar/TL
- `EURTRY` - Euro/TL
- `GBPTRY` - Sterlin/TL

## Field Descriptions

- `alis` - Buy price (Alış fiyatı)
- `satis` - Sell price (Satış fiyatı)
- `code` - Product code
- `dir` - Price direction (up/down)
- `dusuk` - Day's low price
- `yuksek` - Day's high price
- `tarih` - Timestamp
- `kapanis` - Previous day's closing price

## Usage Examples

### Node.js with Socket.IO Client

```javascript
import { io } from 'socket.io-client';

const socket = io('wss://hrmsocketonly.haremaltin.com', {
    path: '/socket.io/',
    transports: ['websocket']
});

socket.on('connect', () => {
    console.log('Connected to Haremaltin WebSocket');
});

socket.on('price_changed', (data) => {
    console.log('Gold prices updated:', data.data);
    
    // Access specific prices
    const gramAltin = data.data.ALTIN;
    console.log(`Gram Altın: ${gramAltin.alis} / ${gramAltin.satis}`);
});

socket.on('disconnect', () => {
    console.log('Disconnected from Haremaltin WebSocket');
});
```

### Browser JavaScript

```html
<script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
<script>
const socket = io('wss://hrmsocketonly.haremaltin.com', {
    path: '/socket.io/',
    transports: ['websocket']
});

socket.on('price_changed', (data) => {
    const prices = data.data;
    document.getElementById('gram-altin').textContent = 
        `${prices.ALTIN.alis} / ${prices.ALTIN.satis}`;
});
</script>
```

## API Endpoints

### WebSocket-Based Endpoint
```
GET /api/gold-prices-ws
```

Returns the latest gold prices fetched via WebSocket connection.

**Response:**
```json
{
  "data": { ... },
  "meta": { ... }
}
```

### Labor Costs Endpoint
```
GET /api/gold-prices-iscilik
```

Returns labor costs for gold products (still available via HTTP).

**Response:**
```json
{
  "tl": {
    "CEYREK_YENI_alis": "1.6300",
    "CEYREK_YENI_satis": "1.6350",
    ...
  },
  "has": { ... }
}
```

## Migration from Old Endpoint

### Old Endpoint (Deprecated)
```
https://canlipiyasalar.haremaltin.com/tmp/altin.json?dil_kodu=tr
```
**Status**: 404 Not Found ❌

### New WebSocket Endpoint
```
/api/gold-prices-ws
```
**Status**: Active ✅

### Changes Required

1. **Update API URL**:
   ```javascript
   // Old
   const response = await fetch('/api/gold-prices');
   
   // New
   const response = await fetch('/api/gold-prices-ws');
   ```

2. **Data Structure**: The data structure remains similar, but now includes `meta` object with timestamp.

3. **Real-time Updates**: For real-time updates, connect directly to the WebSocket instead of polling the API.

## Performance Considerations

- **On-Demand Connection**: Each API call creates a new WebSocket connection
- **Timeout**: 10 seconds maximum wait time
- **Cache**: Responses are cached for 60 seconds
- **Recommended**: For high-frequency updates, use direct WebSocket connection instead of HTTP API

## Error Handling

```javascript
try {
    const response = await fetch('/api/gold-prices-ws');
    if (!response.ok) {
        throw new Error('API request failed');
    }
    const data = await response.json();
} catch (error) {
    console.error('Failed to fetch gold prices:', error);
    // Fallback to labor costs endpoint
    const fallback = await fetch('/api/gold-prices-iscilik');
}
```

## Support

For issues or questions, check:
- Original website: https://www.haremaltin.com/
- Socket.IO documentation: https://socket.io/docs/v4/
