# Omnibus DAQms

Real-time data acquisition and monitoring dashboard with live WebSocket streaming.

## Quick Start

**Terminal 1 - Backend:**
```bash
cd tests/mock-backend
npm install  # First time only
npm start    # Runs on port 8081
```

**Terminal 2 - Frontend:**
```bash
npm install  # First time only
npm run dev  # Opens on http://localhost:5173
```

Navigate to `/live-data` to see 6 sensor channels updating in real-time.

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Socket.IO Client, Tailwind CSS, shadcn/ui, Recharts
**Backend:** Node.js, Socket.IO (port 8081)

## Architecture

```
Backend (ws://localhost:8081) → OmnibusContext → Dashboard → 6 LineGraph Charts
```

- `src/context/OmnibusContext.tsx` - WebSocket connection & state management
- `src/types/omnibus.ts` - TypeScript type definitions
- `src/components/SensorMonitoringDashboard.tsx` - Main dashboard
- `src/components/LineGraph.tsx` - Reusable chart component

**Data Flow:** Backend emits messages at 40 Hz → Context parses & buffers (100 points/channel) → Charts render live updates

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Lint code
```

**Project Structure:**
```
src/
├── components/       # UI components
├── context/          # OmnibusContext for WebSocket
├── types/            # TypeScript definitions
└── main.tsx          # Entry point
tests/
└── mock-backend/     # Mock data server
    └── server.js
```
