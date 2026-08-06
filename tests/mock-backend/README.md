# Mock Omnibus Backend Server

A Node.js SocketIO server that emits DAQ and Parsley test data for frontend development.

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
node server.cjs
```

## Technical Details

### Server Configuration

- **Technology**: Node.js with socket.io
- **Port**: 6767
- **CORS**: Enabled for all origins

### SocketIO Events

**Server → Client**: channel-based Socket.IO events, with timestamp and payload arguments.

```json
{
    "channel": "DAQ/Fake",
    "timestamp": 1234567890.123,
    "payload": {
        "timestamp": 1234567890.123,
        "data": {
            "Fake0": [0.123, 0.456, 0.789 /* ... 25 random floats 0-1 */],
            "Fake1": [0.234, 0.567, 0.89 /* ... 25 random floats 0-1 */],
            "Fake2": [0.345, 0.678, 0.901 /* ... 25 random floats 0-1 */],
            "Fake3": [0.456, 0.789, 0.012 /* ... 25 random floats 0-1 */],
            "Fake4": [0.567, 0.89, 0.123 /* ... 25 random floats 0-1 */],
            "Fake5": [0.678, 0.901, 0.234 /* ... 25 random floats 0-1 */],
            "Fake6": [0.789, 0.012, 0.345 /* ... 25 random floats 0-1 */],
            "Fake7": [0.89, 0.123, 0.456 /* ... 25 random floats 0-1 */]
        },
        "relative_timestamps": [
            1234567890.123,
            1234567890.124 /* ... 25 timestamps at 1ms intervals */
        ],
        "sample_rate": 1000,
        "message_format_version": 3
    }
}
```

**Server → Client**: `CAN/Parsley/MockInjector`

```json
{
    "timestamp": 1234567890.123,
    "payload": {
        "board_type_id": "INJECTOR",
        "board_inst_id": "mock-injector",
        "msg_prio": "MEDIUM",
        "msg_type": "SENSOR_ANALOG16",
        "msg_metadata": "SENSOR_PT_CHANNEL_1",
        "data": {
            "time": 12.345,
            "value": 0.42
        },
        "parsley": "mock-parsley",
        "message_format_version": 2
    }
}
```

### Emission Behavior

- **DAQ/Fake**: 40 Hz, 8 channels (Fake0-Fake7), and 25 random samples per channel.
- **CAN/Parsley/MockInjector**: 10 Hz, four `INJECTOR` / `SENSOR_ANALOG16` messages with metadata values `SENSOR_PT_CHANNEL_1` through `SENSOR_PT_CHANNEL_4`.
- **Values**: Random floats between 0-1.
- **Timestamps**: Unix timestamps in seconds (e.g., `Date.now() / 1000`).
- **Parsley payload time**: A wrapping unsigned 16-bit millisecond counter, divided by 1000 before being sent as seconds. It ranges from `0` through `65.535` and then wraps.

## Testing

### Terminal Test (Recommended)

In a separate terminal window:

```bash
# Make sure the server is running (npm start in another terminal)
# Then run the test client:
node test-client.cjs
```

This will connect, display the first 3 messages, and verify the server is working correctly.

### Browser Console Test

```javascript
// In browser console (after loading socket.io-client)
const socket = io('http://localhost:8081')
socket.on('message', (data) => {
    console.log('Received DAQ data:', data)
})
```

## Connection Logging

The server logs when clients connect and disconnect:

- `Client connected: <socket-id>`
- `Client disconnected: <socket-id>`
