const { Server } = require('socket.io')
const parser = require('socket.io-msgpack-parser')

const io = new Server(6767, {
    cors: { origin: '*' },
    parser,
})

function generateDaqPayload() {
    const timestamp = Date.now()
    const data = {}

    // Generate 8 channels with 25 samples each
    for (let i = 0; i < 8; i++) {
        data[`Fake${i}`] = Array.from({ length: 25 }, () => Math.random())
    }

    // Generate relative timestamps (25 samples, 1ms apart, in seconds)
    const relative_timestamps = Array.from(
        { length: 25 },
        (_, i) => (timestamp + i) / 1000
    )

    return {
        timestamp: timestamp / 1000,
        payload: {
            timestamp: timestamp / 1000,
            data: data,
            relative_timestamps: relative_timestamps,
            sample_rate: 1000,
            message_format_version: 3,
        },
    }
}

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`)

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`)
    })
})

// Emit DAQ data at 40 Hz (every 25ms) using channel-based events
// The omnibus-ts library listens via socket.onAny((event, timestamp, payload) => ...)
setInterval(() => {
    const { timestamp, payload } = generateDaqPayload()
    io.emit('DAQ/Fake', timestamp, payload)
}, 25)

console.log('Mock DAQ server running on port 6767 (msgpack parser)')
console.log('Emitting "DAQ/Fake" events at 40 Hz (every 25ms)')
console.log('Data format: 8 channels (Fake0-Fake7), 25 samples each')
