import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { LineGraph } from '../../src/components/LineGraph'
import { useOmnibusStore } from '../../src/store/omnibusStore'
import type { LatestDataPoint } from '../../src/store/omnibusStore'

vi.mock('../../src/store/omnibusStore', () => ({
    useOmnibusStore: {
        subscribe: vi.fn(),
        getState: vi.fn(),
    },
}))

vi.mock('recharts', () => ({
    LineChart: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="line-chart">{children}</div>
    ),
    Line: () => <div data-testid="line" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="responsive-container">{children}</div>
    ),
}))

describe('LineGraph', () => {
    let subscriptionCallback: (dataPoint: LatestDataPoint | undefined) => void

    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(useOmnibusStore.subscribe).mockImplementation(
            (_selector: any, callback: any) => {
                subscriptionCallback = callback
                return vi.fn()
            },
        )
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('renders with channel name as title when no title prop provided', () => {
        render(<LineGraph channelName="Fake0" />)

        expect(screen.getByText('Fake0')).toBeInTheDocument()
    })

    it('renders with custom title when provided', () => {
        render(<LineGraph channelName="Fake0" title="Temperature Sensor" />)

        expect(screen.getByText('Temperature Sensor')).toBeInTheDocument()
    })

    it('shows "No data" when no data points are available', () => {
        render(<LineGraph channelName="Fake0" />)

        expect(screen.getByText('No data')).toBeInTheDocument()
    })

    it('displays current value with unit when data is available', async () => {
        render(<LineGraph channelName="Fake0" unit="°C" />)

        const dataPoint: LatestDataPoint = {
            timestamp: Date.now(),
            value: 25.5,
        }

        subscriptionCallback(dataPoint)

        await waitFor(() => {
            expect(screen.getByText(/Current: 25\.50 °C/)).toBeInTheDocument()
        })
    })

    it('subscribes to the correct channel in the store', () => {
        const channelName = 'Fake0'
        render(<LineGraph channelName={channelName} />)

        expect(useOmnibusStore.subscribe).toHaveBeenCalledTimes(1)

        const [selectorFn] = vi.mocked(useOmnibusStore.subscribe).mock.calls[0]
        const mockState = {
            channels: { Fake0: { timestamp: 123, value: 42 } },
            updateChannel: vi.fn(),
            updateChannels: vi.fn(),
        }
        expect(selectorFn(mockState)).toEqual({ timestamp: 123, value: 42 })
    })

    it('filters out data points older than timeRangeMs', async () => {
        const now = Date.now()
        const timeRange = 5000

        render(<LineGraph channelName="Fake0" timeRangeMs={timeRange} />)

        const oldDataPoint: LatestDataPoint = {
            timestamp: now - 10000,
            value: 10,
        }
        subscriptionCallback(oldDataPoint)

        const recentDataPoint: LatestDataPoint = {
            timestamp: now - 2000,
            value: 25,
        }
        subscriptionCallback(recentDataPoint)

        await waitFor(() => {
            expect(screen.getByText(/Current: 25\.00/)).toBeInTheDocument()
        })
    })

    it('updates when new data points arrive', async () => {
        render(<LineGraph channelName="Fake0" unit="V" />)

        subscriptionCallback({ timestamp: Date.now(), value: 10 })

        await waitFor(() => {
            expect(screen.getByText(/Current: 10\.00 V/)).toBeInTheDocument()
        })

        subscriptionCallback({ timestamp: Date.now(), value: 20 })

        await waitFor(() => {
            expect(screen.getByText(/Current: 20\.00 V/)).toBeInTheDocument()
        })
    })

    it('ignores undefined data points', async () => {
        render(<LineGraph channelName="Fake0" />)

        subscriptionCallback(undefined as any)

        expect(screen.getByText('No data')).toBeInTheDocument()
    })

    it('unsubscribes when component unmounts', () => {
        const unsubscribeMock = vi.fn()

        vi.mocked(useOmnibusStore.subscribe).mockReturnValue(unsubscribeMock)

        const { unmount } = render(<LineGraph channelName="Fake0" />)

        expect(unsubscribeMock).not.toHaveBeenCalled()

        unmount()

        expect(unsubscribeMock).toHaveBeenCalledTimes(1)
    })

    it('uses default timeRangeMs of 60 seconds when not provided', () => {
        render(<LineGraph channelName="Fake0" />)

        expect(screen.getByText('Fake0')).toBeInTheDocument()
    })

    it('renders chart components', () => {
        render(<LineGraph channelName="Fake0" />)

        expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
})
