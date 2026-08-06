const { Server } = require('socket.io')
const parser = require('socket.io-msgpack-parser')

const io = new Server(6767, {
    cors: { origin: '*' },
    parser,
})
const PARSLEY_TIME_MAX_MS = 2 ** 16
const parsleyTimeOrigin = Date.now()

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

function generateParsleyPayload(sensorIndex) {
    const now = Date.now()
    const timestamp = now / 1000
    const rollingTimeSeconds =
        ((now - parsleyTimeOrigin) % PARSLEY_TIME_MAX_MS) / 1000

    return {
        timestamp,
        payload: {
            board_type_id: 'INJECTOR',
            board_inst_id: 'mock-injector',
            msg_prio: 'MEDIUM',
            msg_type: 'SENSOR_ANALOG16',
            msg_metadata: `SENSOR_PT_CHANNEL_${sensorIndex + 1}`,
            data: {
                time: rollingTimeSeconds,
                value: Math.random(),
            },
            parsley: 'mock-parsley',
            message_format_version: 2,
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

// Emit four INJECTOR SENSOR_ANALOG16 series at 10 Hz.
setInterval(() => {
    for (let sensorIndex = 0; sensorIndex < 4; sensorIndex++) {
        const { timestamp, payload } = generateParsleyPayload(sensorIndex)
        io.emit('CAN/Parsley/MockInjector', timestamp, payload)
    }
}, 100)

console.log('Mock Omnibus server running on port 6767 (msgpack parser)')
console.log('Emitting "DAQ/Fake" events at 40 Hz (8 channels, 25 samples each)')
console.log(
    'Emitting "CAN/Parsley/MockInjector" events at 10 Hz (4 injector analog series)'
)
