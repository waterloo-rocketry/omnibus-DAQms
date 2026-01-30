import { useMemo, useRef, useEffect, useReducer } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import D3Chart from '@/components/ui/d3Chart'
import type { DataPoint } from '@/types/omnibus'
import { useOmnibusStore } from '@/store/omnibusStore'
import { cn } from '@/lib/utils'

interface SensorModuleProps {
    channelName: string
    title?: string
    unit?: string
    maxDataPoints?: number
    timeWindowSeconds?: number
    minUpdateIntervalMs?: number
    titleColor?: string
}

const DEFAULT_MIN_UPDATE_INTERVAL_MS = 100 // 10 Hz max

// Utility: Format value to max 6 chars with 2 decimals
function formatValue(value: number): string {
    const str = value.toFixed(2)
    if (str.length <= 6) return str
    
    const parts = str.split('.')
    if (parts[0].length >= 6) {
        return parts[0].substring(0, 6)
    }
    return str.substring(0, 6)
}

// Utility: Calculate rate of change from recent data
function calculateRate(data: DataPoint[]): number | null {
    if (data.length < 2) return null
    
    const recent = data.slice(-10)
    if (recent.length < 2) return null
    
    const first = recent[0]
    const last = recent[recent.length - 1]
    const timeDiffSeconds = (last.timestamp - first.timestamp) / 1000
    
    if (timeDiffSeconds === 0) return null
    
    const valueDiff = last.value - first.value
    return valueDiff / timeDiffSeconds
}

// Utility: Remove stale data points outside time window
function filterStaleData(
    data: DataPoint[],
    cutoffTime: number
): DataPoint[] {
    if (data.length === 0 || data[0].timestamp > cutoffTime) {
        return data
    }
    
    // Find first valid index (early termination)
    let firstValidIdx = 0
    while (
        firstValidIdx < data.length &&
        data[firstValidIdx].timestamp <= cutoffTime
    ) {
        firstValidIdx++
    }
    
    return data.slice(firstValidIdx)
}

// Utility: Check if new point should be added based on time interval
function shouldAddPoint(
    newTimestamp: number,
    lastTimestamp: number | null,
    minInterval: number
): boolean {
    if (lastTimestamp === null) return true
    return (newTimestamp - lastTimestamp) >= minInterval
}

export function SensorModule({
    channelName,
    title,
    unit = '',
    maxDataPoints = 100,
    timeWindowSeconds = 30,
    minUpdateIntervalMs = DEFAULT_MIN_UPDATE_INTERVAL_MS,
    titleColor = 'text-teal-500',
}: SensorModuleProps) {
    const latestDataPoint = useOmnibusStore((state) => state.channels[channelName])
    const historyRef = useRef<DataPoint[]>([])
    const [, forceUpdate] = useReducer((x) => x + 1, 0)

    useEffect(() => {
        if (latestDataPoint === undefined) return

        const newPoint: DataPoint = {
            timestamp: latestDataPoint.timestamp,
            value: latestDataPoint.value,
        }

        // Time-bound filtering: Skip points that arrive too quickly
        const lastPoint = historyRef.current[historyRef.current.length - 1]
        const lastTimestamp = lastPoint?.timestamp ?? null
        
        if (!shouldAddPoint(newPoint.timestamp, lastTimestamp, minUpdateIntervalMs)) {
            return // Discard point - too soon after last update
        }

        // Remove stale data outside time window
        const cutoffTime = newPoint.timestamp - timeWindowSeconds * 1000
        const filtered = filterStaleData(historyRef.current, cutoffTime)
        
        // Add new point and enforce max length
        historyRef.current = [...filtered, newPoint].slice(-maxDataPoints)
        forceUpdate()
    }, [latestDataPoint, maxDataPoints, timeWindowSeconds, minUpdateIntervalMs])

    const data = historyRef.current

    const currentValue = useMemo(() => {
        if (data.length === 0) return null
        return data[data.length - 1].value
    }, [data])

    const rate = useMemo(() => calculateRate(data), [data])

    const displayTitle = useMemo(() => {
        return title || channelName
    }, [title, channelName])

    return (
        <Card className="h-full">
            <CardContent className="grid grid-rows-[auto_1fr] h-full p-4 gap-3">
                {/* Header: Title and Value on same row */}
                <div className="grid grid-cols-[2fr_1fr] gap-4 items-start">
                    <h3
                        className={cn(
                            'font-semibold text-sm leading-tight line-clamp-2',
                            titleColor
                        )}
                        title={displayTitle}
                    >
                        {displayTitle}
                    </h3>
                    
                    <div className="grid grid-rows-[auto] gap-0.5 justify-end text-right">
                        <div
                            className="text-4xl font-bold tabular-nums text-foreground"
                            title={currentValue !== null ? currentValue.toString() : 'No data'}
                        >
                            {currentValue !== null ? formatValue(currentValue) : '--'}
                        </div>
                    </div>
                </div>

                {/* Chart area */}
                <div className="relative min-h-[150px]">
                    {rate !== null && (
                        <div className="absolute top-2 left-2 z-10 bg-background/80 px-2 py-1 rounded text-xs font-mono border">
                            {rate >= 0 ? '+' : ''}
                            {rate.toFixed(3)} {unit}/s
                        </div>
                    )}
                    <div className="h-full w-full">
                        <D3Chart
                            data={data}
                            unit={unit}
                            strokeColor="var(--chart-1)"
                            strokeWidth={2}
                            rangeTickCount={4}
                            domainTickCount={4}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
