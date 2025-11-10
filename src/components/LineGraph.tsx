import { useMemo, useRef, useEffect, useReducer } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import type { DataPoint } from '@/types/omnibus'
import { useOmnibusStore } from '@/store/omnibusStore'

/**
 * LineGraph component props
 */
interface LineGraphProps {
    channelName: string
    title?: string
    unit?: string
    maxDataPoints?: number // Maximum number of data points to keep in history
}

// Chart configuration
const chartConfig = {
    value: {
        label: 'Value',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig

export function LineGraph({
    channelName,
    title,
    unit = '',
    maxDataPoints = 100,
}: LineGraphProps) {
    // Subscribe to ONLY this channel's latest value + timestamp from Zustand
    const latestDataPoint = useOmnibusStore(
        (state) => state.channels[channelName]
    )

    // Store history locally in ref (persists across renders, doesn't trigger re-renders)
    const historyRef = useRef<DataPoint[]>([])

    // Force re-render when history updates
    const [, forceUpdate] = useReducer((x) => x + 1, 0)

    // When new value arrives, add to local history
    useEffect(() => {
        if (latestDataPoint !== undefined) {
            const newPoint: DataPoint = {
                timestamp: latestDataPoint.timestamp, // ← Use backend timestamp!
                value: latestDataPoint.value,
            }

            // Update history (keep last N points)
            historyRef.current = [...historyRef.current, newPoint].slice(
                -maxDataPoints
            )

            // Force re-render to display new data
            forceUpdate()
        }
    }, [latestDataPoint, maxDataPoints])

    // Use local history instead of prop data
    const data = historyRef.current

    // Transform data for Recharts with memoization
    const chartData = useMemo(() => {
        return data.map((point) => ({
            time: new Date(point.timestamp).toLocaleTimeString(),
            value: point.value,
        }))
    }, [data])

    // Calculate current value and Y-axis domain
    const currentValue = useMemo(() => {
        if (data.length === 0) return null
        return data[data.length - 1].value
    }, [data])

    const yDomain = useMemo(() => {
        if (data.length === 0) return [0, 1]
        const values = data.map((d) => d.value)
        const min = Math.min(...values)
        const max = Math.max(...values)
        const padding = (max - min) * 0.1 || 0.1 // 10% padding or 0.1 if all values are same
        return [min - padding, max + padding]
    }, [data])

    const displayTitle = title || channelName
    const displayDescription =
        currentValue !== null ?
            `Current: ${currentValue.toFixed(2)} ${unit}`
        :   'No data'

    return (
        <Card>
            <CardHeader className="items-start">
                <div className="pl-4">
                    <CardTitle className="text-left pb-2">
                        {displayTitle}
                    </CardTitle>
                    <CardDescription className="text-left">
                        {displayDescription}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                >
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            top: 20,
                            left: 12,
                            right: 12,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid vertical={true} />
                        <XAxis
                            dataKey="time"
                            tickLine={true}
                            axisLine={true}
                            tickMargin={8}
                            minTickGap={50}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            tickLine={true}
                            axisLine={true}
                            tickMargin={8}
                            tickFormatter={(value) =>
                                `${value.toFixed(2)} ${unit}`
                            }
                            domain={yDomain as [number, number]}
                            width={60}
                            tick={{ fontSize: 12 }}
                        />

                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Line
                            dataKey="value"
                            type="natural"
                            stroke="var(--chart-1)"
                            strokeWidth={2}
                            dot={{
                                fill: 'var(--chart-1)',
                                r: 3,
                            }}
                            activeDot={{
                                r: 6,
                            }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
