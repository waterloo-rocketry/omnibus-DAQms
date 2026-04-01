import { memo, useMemo, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import D3Chart from './D3Chart'
import EditGraphDropDown from './EditGraphDropDown'
import type { DataPoint } from '@/types/omnibus'
import type { GraphConfigEditable } from '@/components/LiveDataDashboard/types'
import {
    useLastDatapointStore,
    type LatestDataPoint,
} from '@/store/omnibusStore'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface SensorModuleProps {
    // Identity & config (from GraphConfig)
    channelName: string
    title: string
    titleColor: string
    offset: number
    graphType: string
    displayedHistory: string
    index: number

    // Chart display props
    maxDataPoints?: number
    timeWindowSeconds?: number
    minUpdateIntervalMs?: number
    strokeColor?: string
    strokeWidth?: number
    rangeTickCount?: number
    fixedDomain?: [number, number]
    domainTickCount?: number

    // Callbacks
    onDelete: (id: string) => void
    onDeleteId: string
    onEdit: (index: number, changes: Partial<GraphConfigEditable>) => void
}

const DEFAULT_MIN_UPDATE_INTERVAL_MS = 100 // 10 Hz max

const HISTORY_SECONDS: Record<string, number> = {
    '30s': 30,
    '1min': 60,
    '5min': 300,
    '10min': 600,
    '30min': 1800,
}

function parseDisplayedHistory(history: string): number {
    return HISTORY_SECONDS[history] ?? 30
}

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

export const SensorModule = memo(function SensorModule({
    channelName,
    title,
    titleColor = 'text-teal-500',
    offset = 0,
    graphType = 'Graph',
    displayedHistory = '30s',
    index,
    maxDataPoints = 100,
    timeWindowSeconds: timeWindowSecondsOverride,
    minUpdateIntervalMs = DEFAULT_MIN_UPDATE_INTERVAL_MS,
    strokeColor = 'var(--chart-1)',
    strokeWidth = 2,
    rangeTickCount = 4,
    fixedDomain,
    domainTickCount = 4,
    onDelete,
    onDeleteId,
    onEdit,
}: SensorModuleProps) {
    const [data, setData] = useState<DataPoint[]>([])
    const prevChannelRef = useRef(channelName)
    const lastTimestampRef = useRef<number | null>(null)
    const timeWindowSeconds = timeWindowSecondsOverride ?? parseDisplayedHistory(displayedHistory)

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

    const dataWithOffset = useMemo(() => {
        if (offset === 0) return data
        return data.map((point) => ({
            ...point,
            value: point.value + offset,
        }))
    }, [data, offset])

    const currentValue = useMemo(() => {
        if (data.length === 0) return null
        return data[data.length - 1].value + offset
    }, [data, offset])

    const rate = useMemo(() => calculateRate(data), [data])

    const displayTitle = title || channelName

    const handleDelete = useCallback(() => {
        onDelete(onDeleteId)
    }, [onDelete, onDeleteId])

    const handleSetZeroPoint = () => {
        if (data.length === 0) return
        const values = data.map((d) => d.value)
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        onEdit(index, { offset: parseFloat((-avg).toFixed(2)) })
    }

    return (
        <Card className="h-full">
            <CardContent className="grid grid-rows-[auto_auto_1fr_auto] h-full p-4 gap-2">
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

                {/* Rate indicator */}
                <div className="min-h-[28px] flex items-center">
                    {rate !== null && (
                        <div className="bg-background/80 px-2 py-1 rounded text-xs font-mono border w-fit">
                            {rate >= 0 ? '+' : ''}
                            {rate.toFixed(3)}/s
                        </div>
                    )}
                </div>

                {/* Chart area */}
                <div className="min-h-[150px]">
                    <D3Chart
                        data={dataWithOffset}
                        strokeColor={strokeColor}
                        strokeWidth={strokeWidth}
                        rangeTickCount={rangeTickCount}
                        fixedDomain={fixedDomain}
                        domainTickCount={domainTickCount}
                    />
                </div>

                {/* EditGraphDropDown in bottom-right corner */}
                <EditGraphDropDown
                    index={index}
                    title={title}
                    titleColor={titleColor}
                    offset={offset}
                    graphType={graphType}
                    displayedHistory={displayedHistory}
                    onEdit={onEdit}
                    onDelete={handleDelete}
                    onSetZeroPoint={handleSetZeroPoint}
                />
            </CardContent>
        </Card>
    )
})
