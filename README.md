## Omnibus DAQms — Sensor Monitoring Dashboard

A React + TypeScript + Vite app that renders a clean sensor monitoring dashboard with inline SVG sparklines.

### Project structure

```text
omnibus-DAQms/
  ├─ public/
  │  └─ vite.svg
  ├─ src/
  │  ├─ assets/
  │  │  └─ react.svg
  │  ├─ App.css
  │  ├─ App.tsx            ← Dashboard UI (header, cards, charts, cookie bar)
  │  ├─ index.css
  │  └─ main.tsx           ← App bootstrapping
  ├─ index.html
  ├─ eslint.config.js
  ├─ vite.config.ts
  ├─ tsconfig*.json
  ├─ package.json
  └─ README.md
```

### Setup

- **Prerequisites**: Node 20+ and `pnpm` 10+.

```bash
pnpm i            # install dependencies
pnpm dev          # start dev server (http://localhost:5173 by default)
pnpm build        # type-check and build for production
pnpm preview      # preview production build locally
pnpm lint         # run eslint
```

### Changelog

- 2025-09-26: Dashboard implementation
  - Replaced template UI with a dashboard in `src/App.tsx`.
  - Added `Header`, `SensorCard`, and `SparklineChart` components (inline).
  - Included responsive layout and inline styles; added dismissible cookie banner.
  - Sample pressure data renders dot-based sparklines with labeled axes.
  - No new dependencies added; only `src/App.tsx` was edited.
