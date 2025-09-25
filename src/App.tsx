import { useMemo, useState } from 'react'
import './App.css'

type SparklineChartProps = {
  data: number[]
  width?: number
  height?: number
  yMin: number
  yMax: number
  unitLabel: string
}

function SparklineChart({ data, width = 420, height = 240, yMin, yMax, unitLabel }: SparklineChartProps) {
  const marginLeft = 56
  const marginRight = 8
  const marginTop = 10
  const marginBottom = 36
  const chartWidth = width - marginLeft - marginRight
  const chartHeight = height - marginTop - marginBottom

  const xForIndex = (index: number) => {
    if (data.length <= 1) return marginLeft
    const t = index / (data.length - 1)
    return marginLeft + t * chartWidth
  }

  const yForValue = (value: number) => {
    const clamped = Math.max(Math.min(value, yMax), yMin)
    const t = (clamped - yMin) / (yMax - yMin)
    return marginTop + (1 - t) * chartHeight
  }

  const yTicks = [yMax, (yMin + yMax) / 2, yMin]
  const xTickLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '22:00']
  const xTickPositions = [0, 4, 8, 12, 16, 20, 22]

  return (
    <svg width={width} height={height} role="img" aria-label="sparkline chart">
      <defs>
        <clipPath id="clip">
          <rect x={marginLeft} y={marginTop} width={chartWidth} height={chartHeight} rx="6" />
        </clipPath>
      </defs>

      {/* Axes */}
      <g>
        {/* Y axis line */}
        <line x1={marginLeft} x2={marginLeft} y1={marginTop} y2={marginTop + chartHeight} stroke="#d1d5db" />
        {yTicks.map((tick, i) => (
          <g key={`y-${i}`}>
            <line
              x1={marginLeft}
              x2={marginLeft + chartWidth}
              y1={yForValue(tick)}
              y2={yForValue(tick)}
              stroke="#f0f0f0"
            />
            <text x={marginLeft - 8} y={yForValue(tick) + 4} textAnchor="end" fontSize="12" fill="#6b7280">
              {tick.toFixed(1)}
            </text>
            <text x={marginLeft - 8} y={yForValue(tick) - 12} textAnchor="end" fontSize="12" fill="#6b7280">
              {i === 0 ? unitLabel : ''}
            </text>
          </g>
        ))}

        {/* X axis labels */}
        {xTickLabels.map((label, i) => {
          const fraction = xTickPositions[i] / 24
          const x = marginLeft + fraction * chartWidth
          return (
            <text key={`x-${label}`} x={x} y={marginTop + chartHeight + 22} textAnchor="middle" fontSize="12" fill="#6b7280">
              {label}
            </text>
          )
        })}
      </g>

      {/* Data points */}
      <g clipPath="url(#clip)">
        {data.map((v, i) => (
          <circle key={i} cx={xForIndex(i)} cy={yForValue(v)} r={4} fill="#111827" />
        ))}
        {/* baseline for visual clarity */}
        <line x1={marginLeft} x2={marginLeft + chartWidth} y1={yForValue((yMin + yMax) / 2)} y2={yForValue((yMin + yMax) / 2)} stroke="#e5e7eb" />
      </g>
    </svg>
  )
}

type SensorCardProps = {
  title: string
  unit: string
  data: number[]
  yMin: number
  yMax: number
}

function SensorCard({ title, unit, data, yMin, yMax }: SensorCardProps) {
  const current = useMemo(() => data[data.length - 1], [data])

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">{title}</div>
        <div className="card-subtitle">Current: {current.toFixed(1)} {unit} | 24hr average</div>
      </div>
      <SparklineChart data={data} yMin={yMin} yMax={yMax} unitLabel={unit} />
    </div>
  )
}

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="brand">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
            <path d="M3 12c2.5 0 2.5-6 5-6s2.5 12 5 12 2.5-6 5-6" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>Sensor Monitoring Dashboard</span>
        </div>
        <nav className="nav">
          <a>Live Data</a>
          <a>Historical</a>
          <a>Alerts</a>
          <a>Settings</a>
        </nav>
      </div>
      <div className="header-right">
        <button className="icon-btn" aria-label="notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 3a6 6 0 0 0-6 6v3.5L4 15v1h16v-1l-2-2.5V9a6 6 0 0 0-6-6Z" fill="none" stroke="#111827" strokeWidth="1.6" />
          </svg>
        </button>
        <button className="icon-btn" aria-label="settings">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm9 4a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" fill="none" stroke="#111827" strokeWidth="1.6" />
          </svg>
        </button>
        <div className="avatar" aria-hidden />
      </div>
    </header>
  )
}

function App() {
  const [showCookie, setShowCookie] = useState(true)

  // Sample pressure data (hourly)
  const sampleDataA = [1013.2, 1013.0, 1012.8, 1012.6, 1012.9, 1013.6, 1014.2, 1014.9, 1014.3, 1013.9, 1013.6, 1013.2, 1013.1, 1013.8, 1014.4, 1014.1, 1013.7, 1013.4, 1013.1, 1013.0, 1012.9, 1013.1, 1013.2]
  const sampleDataB = [1013.1, 1012.9, 1012.7, 1012.5, 1012.7, 1013.4, 1013.9, 1014.6, 1014.0, 1013.7, 1013.4, 1013.1, 1013.0, 1013.7, 1014.3, 1014.0, 1013.6, 1013.3, 1013.0, 1012.9, 1012.8, 1013.0, 1013.1]
  const sampleDataC = [1013.0, 1012.8, 1012.6, 1012.4, 1012.6, 1013.3, 1013.8, 1014.5, 1013.9, 1013.6, 1013.3, 1013.0, 1012.9, 1013.6, 1014.2, 1013.9, 1013.5, 1013.2, 1012.9, 1012.8, 1012.7, 1012.9, 1013.0]

  return (
    <div className="page">
      <Header />
      <main className="container">
        <div className="page-title">Sensor Monitoring Dashboard</div>
        <div className="page-subtitle">Real-time monitoring of environmental and operational sensors</div>

        <section className="grid">
          <SensorCard title="Pressure Sensor" unit="hPa" data={sampleDataA} yMin={1011.5} yMax={1016.7} />
          <SensorCard title="Pressure Sensor" unit="hPa" data={sampleDataB} yMin={1011.5} yMax={1016.7} />
          <SensorCard title="Pressure Sensor" unit="hPa" data={sampleDataC} yMin={1011.5} yMax={1016.7} />
        </section>

        <section className="grid secondary">
          <SensorCard title="Pressure Sensor" unit="hPa" data={sampleDataB} yMin={1011.5} yMax={1016.7} />
          <SensorCard title="Pressure Sensor" unit="hPa" data={sampleDataA} yMin={1011.5} yMax={1016.7} />
        </section>
      </main>

      {showCookie && (
        <div className="cookie">
          <div className="cookie-text">
            This website uses cookies, pixel tags, and local storage for performance, personalization, and marketing purposes. Our use of some cookies may be considered a sale, sharing for behavioral advertising, or targeted advertising. For more, see our <a href="#">privacy policy</a>.
          </div>
          <div className="cookie-actions">
            <button className="btn-secondary" onClick={() => setShowCookie(false)}>Opt out</button>
          </div>
        </div>
      )}

      <style>{`
        :root { --border:#e5e7eb; --text:#111827; --muted:#6b7280; --bg:#ffffff; --card:#ffffff; }
        * { box-sizing: border-box; }
        body { margin: 0; }
        .page { background: var(--bg); color: var(--text); min-height: 100vh; }
        .container { max-width: 1180px; margin: 0 auto; padding: 28px 16px 80px; }

        .header { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 16px; border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.9); backdrop-filter: saturate(180%) blur(8px); }
        .header-left { display: flex; align-items: center; gap: 20px; }
        .brand { display: flex; align-items: center; gap: 8px; font-weight: 600; }
        .nav { display: flex; align-items: center; gap: 16px; color: var(--muted); }
        .nav a { cursor: default; }
        .header-right { display: flex; align-items: center; gap: 8px; }
        .icon-btn { border: 1px solid var(--border); background: #fff; border-radius: 8px; width: 34px; height: 34px; display: grid; place-items: center; }
        .avatar { width: 28px; height: 28px; background: #111827; border-radius: 999px; }

        .page-title { font-size: 32px; font-weight: 700; letter-spacing: -0.02em; margin-top: 24px; }
        .page-subtitle { color: var(--muted); margin-top: 8px; margin-bottom: 22px; }

        .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
        .grid.secondary { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 16px; }

        .card { border: 1px solid var(--border); background: var(--card); border-radius: 14px; padding: 16px; box-shadow: 0 1px 0 rgba(0,0,0,0.04); }
        .card-header { margin-bottom: 8px; }
        .card-title { font-weight: 600; }
        .card-subtitle { color: var(--muted); font-size: 14px; margin-top: 4px; }

        .cookie { position: fixed; bottom: 0; left: 0; right: 0; display: flex; gap: 16px; align-items: center; justify-content: center; padding: 14px 18px; border-top: 1px solid var(--border); background: #fff; color: #111827; }
        .cookie-text { font-size: 12px; color: #374151; max-width: 980px; }
        .cookie-actions { display: flex; gap: 8px; }
        .btn-secondary { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: #fff; }

        @media (max-width: 1100px) {
          .grid { grid-template-columns: 1fr; }
          .grid.secondary { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}

export default App
