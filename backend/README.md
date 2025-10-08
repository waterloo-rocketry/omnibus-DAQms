# Mock DAQ Backend Server

A Node.js SocketIO server that emits DAQ/Fake test data for frontend development.

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start
```

## Technical Details

### Server Configuration
- **Technology**: Node.js with socket.io
- **Port**: 8081
- **CORS**: Enabled for all origins

### SocketIO Events

**Server → Client**: `message`

```json
{
  "channel": "DAQ/Fake",
  "timestamp": 1234567890.123,
  "payload": {
    "timestamp": 1234567890.123,
    "data": {
      "Fake0": [0.123, 0.456, 0.789, /* ... 25 random floats 0-1 */],
      "Fake1": [0.234, 0.567, 0.890, /* ... 25 random floats 0-1 */],
      "Fake2": [0.345, 0.678, 0.901, /* ... 25 random floats 0-1 */],
      "Fake3": [0.456, 0.789, 0.012, /* ... 25 random floats 0-1 */],
      "Fake4": [0.567, 0.890, 0.123, /* ... 25 random floats 0-1 */],
      "Fake5": [0.678, 0.901, 0.234, /* ... 25 random floats 0-1 */],
      "Fake6": [0.789, 0.012, 0.345, /* ... 25 random floats 0-1 */],
      "Fake7": [0.890, 0.123, 0.456, /* ... 25 random floats 0-1 */]
    },
    "relative_timestamps_nanoseconds": [0, 1000000, 2000000, /* ... 25 values, increment by 1000000 */],
    "sample_rate": 1000,
    "message_format_version": 2
  }
}
```

### Emission Behavior
- **Rate**: 40 Hz (emit every 25ms)
- **Data**: 8 channels (Fake0-Fake7)
- **Samples**: 25 per channel per message
- **Values**: Random floats between 0-1
- **Timestamps**: Unix timestamp in seconds (e.g., `Date.now() / 1000`)
- **Relative timestamps**: Array of 25 integers starting at 0, incrementing by 1000000 (1ms in nanoseconds)

## Testing

You can test the server using a SocketIO client or the browser console:

```javascript
// In browser console (after loading socket.io-client)
const socket = io('http://localhost:8081');
socket.on('message', (data) => {
  console.log('Received DAQ data:', data);
});
```

## Connection Logging

The server logs when clients connect and disconnect:
- `Client connected: <socket-id>`
- `Client disconnected: <socket-id>`
