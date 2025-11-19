const io = require('socket.io')(8081, {
    cors: { origin: '*' },
    parser: require('socket.io-msgpack-parser'),
})

function generateDaqMessage() {
    const timestamp = Date.now() / 1000
    const data = {}

    // Generate 8 channels with 25 samples each
    for (let i = 0; i < 8; i++) {
        data[`Fake${i}`] = Array.from({ length: 25 }, () => Math.random())
    }

    const relativeTimestamps = Array.from(
        { length: 25 },
        (_, i) => i * 1000000
    )

    return {
        timestamp: timestamp,
        data: data,
        relative_timestamps: relativeTimestamps,
        sample_rate: 1000,
        message_version: 2,
    }
}

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`)

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`)
    })
})

// Emit DAQ data at 40 Hz (every 25ms)
setInterval(() => {
    const payload = generateDaqMessage()
    io.emit('DAQ/Fake', payload.timestamp, payload)
}, 25)

console.log('Mock DAQ server running on port 8081')
console.log('Emitting "message" events at 40 Hz (every 25ms)')
console.log('Data format: 8 channels (Fake0-Fake7), 25 samples each')
