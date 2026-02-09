import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import D3LineGraph from '@/components/D3LineGraph'
import { useLastDatapointStore } from '@/store/omnibusStore'

describe('D3LineGraph', () => {
    beforeEach(() => {
        useLastDatapointStore.setState({ series: {} })
    })

    it('renders with channel name as title when no title prop provided', () => {
        render(<D3LineGraph channelName="Fake0" />)
        expect(screen.getByText('Fake0')).toBeInTheDocument()
    })

    it('renders with custom title when provided', () => {
        render(<D3LineGraph channelName="Fake0" title="Temperature Sensor" />)
        expect(screen.getByText('Temperature Sensor')).toBeInTheDocument()
    })

    it('shows "No data" when no data points are available', () => {
        render(<D3LineGraph channelName="Fake0" />)
        expect(screen.getByText('No data')).toBeInTheDocument()
    })

    it('displays current value with unit when data is available', async () => {
        render(<D3LineGraph channelName="Fake0" unit="°C" />)

        useLastDatapointStore.getState().updateSeries('Fake0', {
            timestamp: Date.now(),
            value: 25.5,
        })

        await waitFor(() => {
            expect(screen.getByText(/Current: 25\.50 °C/)).toBeInTheDocument()
        })
    })

    it('updates when new data points arrive', async () => {
        render(<D3LineGraph channelName="Fake0" unit="V" />)

        useLastDatapointStore.getState().updateSeries('Fake0', {
            timestamp: Date.now(),
            value: 10,
        })

        await waitFor(() => {
            expect(screen.getByText(/Current: 10\.00 V/)).toBeInTheDocument()
        })

        useLastDatapointStore.getState().updateSeries('Fake0', {
            timestamp: Date.now() + 100,
            value: 20,
        })

        await waitFor(() => {
            expect(screen.getByText(/Current: 20\.00 V/)).toBeInTheDocument()
        })
    })

    it('filters out data points older than timeRangeSec', async () => {
        const now = Date.now()
        const timeRange = 15

        render(<D3LineGraph channelName="Fake0" timeRangeSec={timeRange} />)

        useLastDatapointStore.getState().updateSeries('Fake0', {
            timestamp: now - 20000, // older than 15s
            value: 10,
        })

        await waitFor(() => {
            expect(screen.getByText('No data')).toBeInTheDocument()
        })

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
        const { rerender } = render(<D3LineGraph channelName="Fake0" />)

        useLastDatapointStore.getState().updateSeries('Fake0', {
            timestamp: Date.now(),
            value: 10,
        })

        await waitFor(() => {
            expect(screen.getByText(/Current: 10\.00/)).toBeInTheDocument()
        })

        rerender(<D3LineGraph channelName="Fake1" />)

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
        render(<D3LineGraph channelName="Fake0" />)
        expect(screen.getByText('Fake0')).toBeInTheDocument()
    })

    it('ignores data for other channels', async () => {
        render(<D3LineGraph channelName="Fake0" />)

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

    it('renders with custom width and height', () => {
        render(<D3LineGraph channelName="Fake0" width={800} height={400} />)
        const svg = screen.getByRole('img')
        expect(svg).toHaveAttribute('width', '100%')
        expect(svg).toHaveAttribute('height', '100%')
    })

    it('renders with custom stroke color and width', () => {
        render(
            <D3LineGraph
                channelName="Fake0"
                strokeColor="red"
                strokeWidth={3}
            />
        )
        const path = screen.getByRole('img').querySelector('path')
        expect(path).toHaveAttribute('stroke', 'red')
        expect(path).toHaveAttribute('stroke-width', '3')
    })

    it('renders with fixed domain', () => {
        render(<D3LineGraph channelName="Fake0" fixedDomain={[0, 100]} />)
        expect(screen.getByText('Fake0')).toBeInTheDocument()
    })

    it('gives error for invalid rangeTickCount', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        render(<D3LineGraph channelName="Fake0" rangeTickCount={0} />)
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining(
                'rangeTickCount and domainTickCount must be > 0'
            )
        )
        warnSpy.mockRestore()
    })

    it('gives error for invalid domainTickCount', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        render(<D3LineGraph channelName="Fake0" domainTickCount={0} />)
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining(
                'rangeTickCount and domainTickCount must be > 0'
            )
        )
        warnSpy.mockRestore()
    })

    it('auto centers with one domainTickCount', () => {
        render(<D3LineGraph channelName="Fake0" domainTickCount={1} />)
        expect(screen.getByText('Fake0')).toBeInTheDocument()
    })

    it("opens the Edit dropdown when '...' is pressed", async () => {
        render(<D3LineGraph channelName="Fake0" />)

        // open dropdown
        await userEvent.click(screen.getByLabelText('Open menu'))

        // dropdown contains Offset label
        expect(screen.getByText('Offset')).toBeInTheDocument()
    })

    it('shifts displayed data when offset is changed via dropdown', async () => {
        render(<D3LineGraph channelName="Fake0" />)

        useLastDatapointStore.getState().updateSeries('Fake0', {
            timestamp: Date.now(),
            value: 10,
        })

        await waitFor(() => {
            expect(screen.getByText(/Current: 10\.00/)).toBeInTheDocument()
        })

        // open dropdown and increment offset by 0.1
        await userEvent.click(screen.getByLabelText('Open menu'))
        await userEvent.click(screen.getByText('+'))

        await waitFor(() => {
            expect(screen.getByText(/Current: 10\.10/)).toBeInTheDocument()
        })
    })

    it('calculates zero point and sets offset to negative average when Set Zero Point is pressed', async () => {
        render(<D3LineGraph channelName="Fake0" />)

        // push two points with avg 20
        useLastDatapointStore.getState().updateSeries('Fake0', {
            timestamp: Date.now(),
            value: 10,
        })
        useLastDatapointStore.getState().updateSeries('Fake0', {
            timestamp: Date.now() + 100,
            value: 30,
        })

        await waitFor(() => {
            expect(screen.getByText(/Current: 30\.00/)).toBeInTheDocument()
        })

        // open dropdown and select Set Zero Point
        await userEvent.click(screen.getByLabelText('Open menu'))
        await userEvent.click(screen.getByText('Set Zero Point'))

        // after zeroing, offset should be -20 => last value 30 + (-20) = 10
        await waitFor(() => {
            expect(screen.getByText(/Current: 10\.00/)).toBeInTheDocument()
        })
    })
})
