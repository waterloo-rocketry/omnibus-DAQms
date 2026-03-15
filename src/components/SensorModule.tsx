import { useMemo, useRef, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import D3Chart from '@/components/LineGraph/d3Chart'
import type { DataPoint } from '@/types/omnibus'
import {
    useLastDatapointStore,
    type LatestDataPoint,
} from '@/store/omnibusStore'
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
    if (!Number.isFinite(value)) return '---'

    // For values that fit in 6 chars with 2 decimals, use fixed notation
    const fixed = value.toFixed(2)
    if (fixed.length <= 6) return fixed

    // For large/small values, use compact notation
    const abs = Math.abs(value)
    if (abs >= 1e6 || (abs < 0.01 && abs > 0)) {
        return value.toExponential(1)
    }

    // For medium values, show as many decimals as fit
    const intPart = Math.trunc(value).toString()
    if (intPart.length >= 6) return intPart.substring(0, 7)
    const decimals = Math.max(0, 6 - intPart.length - 1)
    return value.toFixed(decimals)
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
function filterStaleData(data: DataPoint[], cutoffTime: number): DataPoint[] {
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
    return newTimestamp - lastTimestamp >= minInterval
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
    const [data, setData] = useState<DataPoint[]>([])
    const prevChannelRef = useRef(channelName)
    const lastTimestampRef = useRef<number | null>(null)

    useEffect(() => {
        if (prevChannelRef.current !== channelName) {
            setData([])
            lastTimestampRef.current = null
        }
        prevChannelRef.current = channelName

        const unsubscribe = useLastDatapointStore.subscribe(
            (state) => state.series[channelName],
            (newDataPoint: LatestDataPoint | undefined) => {
                if (newDataPoint === undefined) return

                if (!shouldAddPoint(newDataPoint.timestamp, lastTimestampRef.current, minUpdateIntervalMs)) {
                    return
                }
                lastTimestampRef.current = newDataPoint.timestamp

                const cutoffTime = newDataPoint.timestamp - timeWindowSeconds * 1000
                setData((prev) =>
                    [...filterStaleData(prev, cutoffTime), { timestamp: newDataPoint.timestamp, value: newDataPoint.value }]
                        .slice(-maxDataPoints)
                )
            }
        )
        return unsubscribe
    }, [channelName, timeWindowSeconds, maxDataPoints, minUpdateIntervalMs])

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
            <CardContent className="grid grid-rows-[auto_auto_1fr] h-full p-4 gap-2">
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
                            title={
                                currentValue !== null ?
                                    currentValue.toString()
                                :   'No data'
                            }
                        >
                            {currentValue !== null ?
                                formatValue(currentValue)
                            :   '--'}
                        </div>
                    </div>
                </div>

                {/* Rate indicator — fixed height to keep charts aligned across cards */}
                <div className="min-h-[28px] flex items-center">
                    {rate !== null && (
                        <div className="bg-background/80 px-2 py-1 rounded text-xs font-mono border w-fit">
                            {rate >= 0 ? '+' : ''}
                            {rate.toFixed(3)} {unit}/s
                        </div>
                    )}
                </div>

                {/* Chart area */}
                <div className="min-h-[150px]">
                    <D3Chart
                        data={data}
                        unit={unit}
                        strokeColor="var(--chart-1)"
                        strokeWidth={2}
                        rangeTickCount={4}
                        domainTickCount={4}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
