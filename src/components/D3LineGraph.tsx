import { useMemo, useEffect, useState, useRef } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import D3Chart from '@/components/d3Chart'
import type { DataPoint } from '@/types/omnibus'
import {
    useLastDatapointStore,
    type LatestDataPoint,
} from '@/store/omnibusStore'
import EditGraphDropDown from './LineGraph/EditGraphDropDown'

interface D3LineGraphProps {
    channelName: string
    title?: string
    unit?: string
    width?: number
    height?: number
    strokeColor?: string
    strokeWidth?: number
    rangeTickCount?: number
    fixedDomain?: [number, number]
    domainTickCount?: number
    timeRangeSec?: number
    maxDataPoints?: number
}

const chartConfig = {
    value: {
        label: 'Value',
        color: 'var(--chart-1)',
    },
} as const

export default function D3LineGraph({
    channelName,
    title = '',
    unit = '',
    width = 700,
    height = 260,
    strokeColor = 'var(--chart-1)',
    strokeWidth = 2,
    rangeTickCount = 5,
    fixedDomain,
    domainTickCount = 5,
    timeRangeSec = 60,
    maxDataPoints = 100,
}: D3LineGraphProps) {
    // useStates to allow changes to graph properties
    const [graphTitle, setGraphTitle] = useState(title)
    const [titleColor, setTitleColor] = useState('black')
    const [offset, setOffset] = useState(0.0)
    const [setZeroPoint, setSetZeroPoint] = useState(false)
    const [graphType, setGraphType] = useState('Graph')
    const [displayedHistory, setDisplayedHistory] = useState('30s')
    const [deleteGraph, setDeleteGraph] = useState(false)

    const [data, setData] = useState<DataPoint[]>([])
    const prevChannelRef = useRef(channelName)

    useEffect(() => {
        const cutoffTime = Date.now() - timeRangeSec * 1000
        setData((prev) =>
            prev
                .filter((point) => point.timestamp >= cutoffTime)
                .slice(-maxDataPoints)
        )
    }, [timeRangeSec, maxDataPoints])

    useEffect(() => {
        if (prevChannelRef.current !== channelName) {
            setData([])
        }
        prevChannelRef.current = channelName

        const unsubscribe = useLastDatapointStore.subscribe(
            (state) => state.series[channelName],
            (newDataPoint: LatestDataPoint | undefined) => {
                if (!newDataPoint) return

                const cutoffTime = Date.now() - timeRangeSec * 1000
                setData((prev) =>
                    [...prev, newDataPoint]
                        .filter((point) => point.timestamp >= cutoffTime)
                        .slice(-maxDataPoints)
                )
            }
        )
        return unsubscribe
    }, [channelName, timeRangeSec, maxDataPoints])

    const currentValue = useMemo(() => {
        // displayed at the top of the graph
        if (data.length === 0) return null
        return data[data.length - 1].value + offset
    }, [data, offset])

    const dataWithOffset = useMemo(() => {
        return data.map((point) => ({
            ...point,

            value: point.value + offset,
        }))
    }, [data, offset])

    useEffect(() => { // setting the zero point
        if (!setZeroPoint) return

        if (data.length === 0) {
            setSetZeroPoint(false)
            return
        }

        const values = data.map((d) => d.value)
        const avg = values.reduce((a, b) => a + b, 0) / values.length

        // set offset such that (value + offset) - avg = 0 -> offset = -avg
        setOffset(parseFloat((-avg).toFixed(2)))

        // clear the toggle trigger
        setSetZeroPoint(false)
    }, [setZeroPoint])

    const displayTitle = graphTitle || channelName
    const displayDescription =
        currentValue !== null ?
            `Current: ${currentValue.toFixed(2)} ${unit}`
        :   'No data'

    const rangeTickCountNew = rangeTickCount > 0 ? rangeTickCount : 5
    const domainTickCountNew = domainTickCount > 0 ? domainTickCount : 5

    if (rangeTickCount <= 0 || domainTickCount <= 0) {
        console.warn(
            'rangeTickCount and domainTickCount must be > 0; using defaults (5)'
        )
    }

    return (
        <Card>
            <CardHeader className="items-start">
                <div className="pl-4">
                    <CardTitle
                        className="text-left pb-2"
                        style={{ color: titleColor }}
                    >
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
                    <D3Chart
                        data={dataWithOffset}
                        width={width}
                        height={height}
                        unit={unit}
                        strokeColor={strokeColor}
                        strokeWidth={strokeWidth}
                        rangeTickCount={rangeTickCountNew}
                        fixedDomain={fixedDomain}
                        domainTickCount={domainTickCountNew}
                    />
                </ChartContainer>
                <EditGraphDropDown
                    graphTitle={graphTitle}
                    setGraphTitle={setGraphTitle}
                    titleColor={titleColor}
                    setTitleColor={setTitleColor}
                    offset={offset}
                    setOffset={setOffset}
                    setZeroPoint={setZeroPoint}
                    setSetZeroPoint={setSetZeroPoint}
                    graphType={graphType}
                    setGraphType={setGraphType}
                    displayedHistory={displayedHistory}
                    setDisplayedHistory={setDisplayedHistory}
                    deleteGraph={deleteGraph}
                    setDeleteGraph={setDeleteGraph}
                ></EditGraphDropDown>
            </CardContent>
        </Card>
    )
}
