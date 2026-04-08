import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SensorModule } from '@/components/SensorModule'
import { useLastDatapointStore } from '@/store/omnibusStore'
import { vi } from 'vitest'

const defaultProps = {
    channelName: 'test-channel',
    title: 'test-channel',
    titleColor: 'text-teal-500',
    offset: 0,
    graphType: 'Graph',
    displayedHistory: '30s',
    id: 'test-id',
    onDelete: vi.fn(),
    onEdit: vi.fn(),
}

describe('SensorModule', () => {
    beforeEach(() => {
        useLastDatapointStore.setState({ series: {} })
        vi.clearAllMocks()
    })

    describe('Title Display', () => {
        it('renders title correctly', () => {
            render(<SensorModule {...defaultProps} title="Ox Fill (psi)" />)

            expect(screen.getByText('Ox Fill (psi)')).toBeInTheDocument()
        })

        it('falls back to channelName when title is empty', () => {
            render(<SensorModule {...defaultProps} title="" />)

            expect(screen.getByText('test-channel')).toBeInTheDocument()
        })

        it('applies custom title color', () => {
            render(
                <SensorModule
                    {...defaultProps}
                    title="Test Sensor"
                    titleColor="text-blue-500"
                />
            )

            const title = screen.getByText('Test Sensor')
            expect(title).toHaveClass('text-blue-500')
        })

        it('truncates long titles with ellipsis', () => {
            const longTitle = 'A'.repeat(100)
            render(<SensorModule {...defaultProps} title={longTitle} />)

            const title = screen.getByTitle(longTitle)
            expect(title).toHaveClass('line-clamp-2')
        })
    })

    describe('Value Display', () => {
        it('displays current value with 2 decimal places', async () => {
            render(<SensorModule {...defaultProps} />)

            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: 45.98,
                timestamp: Date.now(),
                type: 'DAQ',
            })

            await waitFor(() => {
                expect(screen.getByText('45.98')).toBeInTheDocument()
            })
        })

        it('displays -- when no data available', () => {
            render(<SensorModule {...defaultProps} />)

            expect(screen.getByText('--')).toBeInTheDocument()
        })

        it('truncates value to 6 characters when too long', async () => {
            render(<SensorModule {...defaultProps} />)

            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: 123456.789,
                timestamp: Date.now(),
                type: 'DAQ',
            })

            await waitFor(() => {
                const valueElement = screen.getByTitle('123456.789')
                expect(valueElement.textContent).toHaveLength(6)
            })
        })
    })

    describe('Rate Calculation', () => {
        it('does not display rate with insufficient data', async () => {
            const { container } = render(<SensorModule {...defaultProps} />)

            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: 45.98,
                timestamp: Date.now(),
                type: 'DAQ',
            })

            await waitFor(() => {
                expect(screen.getByText('45.98')).toBeInTheDocument()
            })

            const rateDisplay = container.querySelector('.font-mono')
            expect(rateDisplay).not.toBeInTheDocument()
        })
    })

    describe('Time Window Filtering', () => {
        it('filters out data points older than timeWindowSeconds', async () => {
            const now = Date.now()

            const { container } = render(
                <SensorModule
                    {...defaultProps}
                    timeWindowSeconds={10}
                    minUpdateIntervalMs={0}
                />
            )

            // Point outside the 10s window (15s ago)
            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: 1.0,
                timestamp: now - 15000,
                type: 'DAQ',
            })

            await waitFor(() => {
                expect(screen.getByTitle('1')).toHaveTextContent('1.00')
            })

            // Point inside the window (now) — should evict the old one
            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: 99.0,
                timestamp: now,
                type: 'DAQ',
            })

            await waitFor(() => {
                expect(screen.getByTitle('99')).toHaveTextContent('99.00')
            })

            const rateDisplay = container.querySelector('.font-mono')
            expect(rateDisplay).not.toBeInTheDocument()
        })

        it('respects maxDataPoints by dropping oldest points', async () => {
            const now = Date.now()

            render(
                <SensorModule
                    {...defaultProps}
                    maxDataPoints={3}
                    minUpdateIntervalMs={0}
                />
            )

            for (let i = 0; i < 4; i++) {
                useLastDatapointStore.getState().updateSeries('test-channel', {
                    value: (i + 1) * 10,
                    timestamp: now + i * 200,
                    type: 'DAQ',
                })

                await waitFor(() => {
                    expect(
                        screen.getByTitle(String((i + 1) * 10))
                    ).toHaveTextContent(((i + 1) * 10).toFixed(2))
                })
            }

            expect(screen.getByTitle('40')).toHaveTextContent('40.00')
        })
    })

    describe('Time-bound Filtering', () => {
        it('accepts first data point immediately', async () => {
            render(<SensorModule {...defaultProps} />)

            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: 100,
                timestamp: Date.now(),
                type: 'DAQ',
            })

            await waitFor(() => {
                const value = screen.getByTitle('100')
                expect(value.textContent).toBe('100.00')
            })
        })

        it('respects custom minUpdateIntervalMs prop', async () => {
            render(
                <SensorModule {...defaultProps} minUpdateIntervalMs={1000} />
            )

            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: 100,
                timestamp: Date.now(),
                type: 'DAQ',
            })

            await waitFor(() => {
                const value = screen.getByTitle('100')
                expect(value.textContent).toBe('100.00')
            })
        })
    })

    describe('Value Formatting', () => {
        it('formats values with exactly 2 decimal places', async () => {
            render(<SensorModule {...defaultProps} />)

            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: 45,
                timestamp: Date.now(),
                type: 'DAQ',
            })

            await waitFor(() => {
                const value = screen.getByTitle('45')
                expect(value.textContent).toBe('45.00')
            })
        })

        it('handles negative values correctly', async () => {
            render(<SensorModule {...defaultProps} />)

            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: -12.34,
                timestamp: Date.now(),
                type: 'DAQ',
            })

            await waitFor(() => {
                expect(screen.getByText('-12.34')).toBeInTheDocument()
            })
        })

        it('handles zero correctly', async () => {
            render(<SensorModule {...defaultProps} />)

            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: 0,
                timestamp: Date.now(),
                type: 'DAQ',
            })

            await waitFor(() => {
                const value = screen.getByTitle('0')
                expect(value.textContent).toBe('0.00')
            })
        })

        it('handles very large numbers', async () => {
            render(<SensorModule {...defaultProps} />)

            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: 999999.99,
                timestamp: Date.now(),
                type: 'DAQ',
            })

            await waitFor(() => {
                const valueElement = screen.getByTitle('999999.99')
                expect(valueElement.textContent).toBe('999999')
            })
        })

        it('handles large negative numbers without incorrect truncation', async () => {
            render(<SensorModule {...defaultProps} />)

            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: -1234.56,
                timestamp: Date.now(),
                type: 'DAQ',
            })

            await waitFor(() => {
                const valueElement = screen.getByTitle('-1234.56')
                expect(valueElement.textContent).toBe('-1235')
            })
        })

        it('uses exponential notation for very large positive numbers', async () => {
            render(<SensorModule {...defaultProps} />)

            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: 5000000,
                timestamp: Date.now(),
                type: 'DAQ',
            })

            await waitFor(() => {
                const valueElement = screen.getByTitle('5000000')
                expect(valueElement.textContent).toBe('5.0e+6')
            })
        })

        it('displays --- for NaN values', async () => {
            render(<SensorModule {...defaultProps} />)

            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: NaN,
                timestamp: Date.now(),
                type: 'DAQ',
            })

            await waitFor(() => {
                expect(screen.getByText('---')).toBeInTheDocument()
            })
        })

        it('displays --- for Infinity values', async () => {
            render(<SensorModule {...defaultProps} />)

            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: Infinity,
                timestamp: Date.now(),
                type: 'DAQ',
            })

            await waitFor(() => {
                expect(screen.getByText('---')).toBeInTheDocument()
            })
        })
    })

    describe('EditGraphDropDown Integration', () => {
        it("opens the Edit dropdown when '...' is pressed", async () => {
            render(<SensorModule {...defaultProps} channelName="Fake0" />)

            await userEvent.click(screen.getByLabelText('Open menu'))

            expect(screen.getByText('Offset')).toBeInTheDocument()
        })

        it('shifts displayed data when offset is changed via dropdown', async () => {
            const onEdit = vi.fn()
            render(
                <SensorModule
                    {...defaultProps}
                    channelName="Fake0"
                    onEdit={onEdit}
                />
            )

            useLastDatapointStore.getState().updateSeries('Fake0', {
                timestamp: Date.now(),
                type: 'DAQ',
                value: 10,
            })

            await waitFor(() => {
                expect(screen.getByTitle('10')).toHaveTextContent('10.00')
            })

            await userEvent.click(screen.getByLabelText('Open menu'))
            await userEvent.click(screen.getByText('+'))

            expect(onEdit).toHaveBeenCalledWith('test-id', { offset: 0.5 })
        })

        it('calculates zero point and calls onEdit with offset', async () => {
            const onEdit = vi.fn()
            render(
                <SensorModule
                    {...defaultProps}
                    channelName="Fake0"
                    minUpdateIntervalMs={0}
                    onEdit={onEdit}
                />
            )

            useLastDatapointStore.getState().updateSeries('Fake0', {
                timestamp: Date.now(),
                type: 'DAQ',
                value: 10,
            })
            useLastDatapointStore.getState().updateSeries('Fake0', {
                timestamp: Date.now() + 100,
                type: 'DAQ',
                value: 30,
            })

            await waitFor(() => {
                expect(screen.getByTitle('30')).toHaveTextContent('30.00')
            })

            await userEvent.click(screen.getByLabelText('Open menu'))
            await userEvent.click(screen.getByText('Set Zero Point'))

            // Average of 10 and 30 is 20, so offset = -20
            expect(onEdit).toHaveBeenCalledWith('test-id', { offset: -20 })
        })
    })
})
