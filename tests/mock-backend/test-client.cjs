const { io } = require('socket.io-client')
const parser = require('socket.io-msgpack-parser')

const socket = io('http://localhost:6767', {
    parser,
    transports: ['websocket'],
})

const receivedChannels = new Set()

socket.on('connect', () => {
    console.log('Connected to server')
    console.log('Listening for DAQ/Fake and CAN/Parsley/MockInjector messages...\n')
})

// Listen for channel-based events (matches omnibus-ts protocol)
socket.onAny((event, timestamp, payload) => {
    if (event.startsWith('DAQ/')) {
        receivedChannels.add('DAQ')
        console.log(`Channel: ${event}`)
        console.log(`Timestamp: ${timestamp}`)
        console.log(`Sample Rate: ${payload.sample_rate}`)
        console.log(`Message Format Version: ${payload.message_format_version}`)
        console.log(`Channels: ${Object.keys(payload.data).join(', ')}`)
        console.log(`Samples per channel: ${payload.data.Fake0.length}`)
        console.log(
            `First 3 samples from Fake0: [${payload.data.Fake0.slice(0, 3)
                .map((v) => v.toFixed(3))
                .join(', ')}]`
        )
        console.log(
            `Relative timestamps (first 3): [${payload.relative_timestamps.slice(0, 3).join(', ')}]`
        )
    } else if (event.startsWith('CAN/Parsley/')) {
        receivedChannels.add('CAN/Parsley')
        console.log(`Channel: ${event}`)
        console.log(`Timestamp: ${timestamp}`)
        console.log(`Board: ${payload.board_type_id}/${payload.board_inst_id}`)
        console.log(`Message: ${payload.msg_type}/${payload.msg_metadata}`)
        console.log(`Payload time: ${payload.data.time}s`)
        console.log(`Value: ${payload.data.value}`)
    } else {
        return
    }

    if (receivedChannels.size === 2) {
        console.log('\nTest successful! Received DAQ and CAN/Parsley messages.')
        console.log('Disconnecting...')
        socket.disconnect()
        process.exit(0)
    }
})

socket.on('disconnect', () => {
    console.log('Disconnected from server')
})

socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message)
    process.exit(1)
})

// Timeout after 5 seconds
setTimeout(() => {
    console.error('Test timeout - no messages received')
    socket.disconnect()
    process.exit(1)
}, 5000)
