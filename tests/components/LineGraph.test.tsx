import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { LineGraph } from '@/components/LineGraph'
import { useLastDatapointStore } from '@/store/omnibusStore'

describe('LineGraph', () => {
    beforeEach(() => {
        useLastDatapointStore.setState({ series: {} })
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

        useLastDatapointStore.getState().updateSeries('Fake0', {
            timestamp: Date.now(),
            value: 25.5,
        })

        await waitFor(() => {
            expect(screen.getByText(/Current: 25\.50 °C/)).toBeInTheDocument()
        })
    })

    it('updates when new data points arrive', async () => {
        render(<LineGraph channelName="Fake0" unit="V" />)

        useLastDatapointStore.getState().updateSeries('Fake0', {
            timestamp: Date.now(),
            value: 10,
        })

        await waitFor(() => {
            expect(screen.getByText(/Current: 10\.00 V/)).toBeInTheDocument()
        })

        useLastDatapointStore.getState().updateSeries('Fake0', {
            timestamp: Date.now(),
            value: 20,
        })

        await waitFor(() => {
            expect(screen.getByText(/Current: 20\.00 V/)).toBeInTheDocument()
        })
    })

    it('filters out data points older than timeRangeSec', async () => {
        const now = Date.now()
        const timeRange = 15

        render(<LineGraph channelName="Fake0" timeRangeSec={timeRange} />)

        useLastDatapointStore.getState().updateSeries('Fake0', {
            timestamp: now - 10000,
            value: 10,
        })

        await waitFor(() => {
            expect(screen.getByText(/Current: 10\.00/)).toBeInTheDocument()
        })

        useLastDatapointStore.getState().updateSeries('Fake0', {
            timestamp: now - 2000,
            value: 25,
        })

        await waitFor(() => {
            expect(screen.getByText(/Current: 25\.00/)).toBeInTheDocument()
        })
    })

    it('clears data when channelName changes', async () => {
        const { rerender } = render(<LineGraph channelName="Fake0" />)

        useLastDatapointStore.getState().updateSeries('Fake0', {
            timestamp: Date.now(),
            value: 10,
        })

        await waitFor(() => {
            expect(screen.getByText(/Current: 10\.00/)).toBeInTheDocument()
        })

        rerender(<LineGraph channelName="Fake1" />)

        expect(screen.getByText('No data')).toBeInTheDocument()

        useLastDatapointStore.getState().updateSeries('Fake1', {
            timestamp: Date.now(),
            value: 20,
        })

        await waitFor(() => {
            expect(screen.getByText(/Current: 20\.00/)).toBeInTheDocument()
        })
    })

    it('uses default timeRangeSec of 60 seconds when not provided', () => {
        render(<LineGraph channelName="Fake0" />)

        expect(screen.getByText('Fake0')).toBeInTheDocument()
    })

    it('ignores data for other channels', async () => {
        render(<LineGraph channelName="Fake0" />)

        useLastDatapointStore.getState().updateSeries('Fake1', {
            timestamp: Date.now(),
            value: 99,
        })

        expect(screen.getByText('No data')).toBeInTheDocument()

        useLastDatapointStore.getState().updateSeries('Fake0', {
            timestamp: Date.now(),
            value: 42,
        })

        await waitFor(() => {
            expect(screen.getByText(/Current: 42\.00/)).toBeInTheDocument()
        })
    })
})
