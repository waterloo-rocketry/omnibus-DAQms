const io = require('socket.io')(8081, {
  cors: { origin: "*" }
});

function generateDaqMessage() {
  const timestamp = Date.now() / 1000;
  const data = {};

  // Generate 8 channels with 25 samples each
  for (let i = 0; i < 8; i++) {
    data[`Fake${i}`] = Array.from({ length: 25 }, () => Math.random());
  }

  // Generate relative timestamps (25 samples, 1ms apart in nanoseconds)
  const relative_timestamps = Array.from({ length: 25 }, (_, i) => i * 1000000);

  return {
    channel: "DAQ/Fake",
    timestamp: timestamp,
    payload: {
      timestamp: timestamp,
      data: data,
      relative_timestamps_nanoseconds: relative_timestamps,
      sample_rate: 1000,
      message_format_version: 2
    }
  };
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Emit DAQ data at 40 Hz (every 25ms)
setInterval(() => {
  const message = generateDaqMessage();
  io.emit('message', message);
}, 25);

console.log('Mock DAQ server running on port 8081');
console.log('Emitting "message" events at 40 Hz (every 25ms)');
console.log('Data format: 8 channels (Fake0-Fake7), 25 samples each');
