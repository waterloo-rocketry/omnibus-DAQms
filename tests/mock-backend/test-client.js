const io = require('socket.io-client')

const socket = io('http://localhost:8081')

let messageCount = 0

socket.on('connect', () => {
    console.log('✅ Connected to server')
    console.log('Listening for messages...\n')
})

socket.on('message', (data) => {
    messageCount++

    if (messageCount <= 3) {
        console.log(`\n📨 Message #${messageCount}:`)
        console.log(`Channel: ${data.channel}`)
        console.log(`Timestamp: ${data.timestamp}`)
        console.log(`Sample Rate: ${data.payload.sample_rate}`)
        console.log(
            `Message Format Version: ${data.payload.message_format_version}`
        )
        console.log(`Channels: ${Object.keys(data.payload.data).join(', ')}`)
        console.log(`Samples per channel: ${data.payload.data.Fake0.length}`)
        console.log(
            `First 3 samples from Fake0: [${data.payload.data.Fake0.slice(0, 3)
                .map((v) => v.toFixed(3))
                .join(', ')}]`
        )
        console.log(
            `Relative timestamps (first 3): [${data.payload.relative_timestamps_nanoseconds.slice(0, 3).join(', ')}]`
        )
    }

    if (messageCount === 3) {
        console.log('\n✅ Test successful! Received 3 messages.')
        console.log('Disconnecting...')
        socket.disconnect()
        process.exit(0)
    }
})

socket.on('disconnect', () => {
    console.log('Disconnected from server')
})

socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message)
    process.exit(1)
})

// Timeout after 5 seconds
setTimeout(() => {
    console.error('❌ Test timeout - no messages received')
    socket.disconnect()
    process.exit(1)
}, 5000)
