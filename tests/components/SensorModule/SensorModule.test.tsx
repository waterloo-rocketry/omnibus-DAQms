import { describe, it, expect, beforeEach } from 'vitest'
import type { ComponentProps } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SensorModule } from '@/components/SensorModule'
import { useLastDatapointStore } from '@/store/omnibusStore'
import { useGraphDataStore } from '@/store/graphDataStore'
import { vi } from 'vitest'

// SensorModule now accumulates points into graphDataStore and receives the
// data to display via a `data` prop (the dashboard subscribes to the store and
// feeds it back). This harness mirrors that wiring so store updates re-render
// the module, just like LiveDataDashboard does.
type SensorModuleHarnessProps = Omit<
    ComponentProps<typeof SensorModule>,
    'data'
>

// Stable reference so the selector doesn't return a fresh array each render.
const EMPTY_DATA: ComponentProps<typeof SensorModule>['data'] = []

function TestSensorModule(props: SensorModuleHarnessProps) {
    const dataMap = useGraphDataStore((s) => s.data)
    const data = dataMap[props.id] ?? EMPTY_DATA
    return <SensorModule {...props} data={data} />
}

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
        useGraphDataStore.setState({ data: {} })
        vi.clearAllMocks()
    })

    describe('Title Display', () => {
        it('renders title correctly', () => {
            render(<TestSensorModule {...defaultProps} title="Ox Fill (psi)" />)

            expect(screen.getByText('Ox Fill (psi)')).toBeInTheDocument()
        })

        it('falls back to channelName when title is empty', () => {
            render(<TestSensorModule {...defaultProps} title="" />)

            expect(screen.getByText('test-channel')).toBeInTheDocument()
        })

        it('applies custom title color', () => {
            render(
                <TestSensorModule
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
            render(<TestSensorModule {...defaultProps} title={longTitle} />)

            const title = screen.getByTitle(longTitle)
            expect(title).toHaveClass('line-clamp-2')
        })
    })

    describe('Value Display', () => {
        it('displays current value with 2 decimal places', async () => {
            render(<TestSensorModule {...defaultProps} />)

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
            render(<TestSensorModule {...defaultProps} />)

            expect(screen.getByTitle('No data')).toHaveTextContent('--')
        })

        it('truncates value to 6 characters when too long', async () => {
            render(<TestSensorModule {...defaultProps} />)

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
        it('displays an unavailable rate with insufficient data', async () => {
            render(<TestSensorModule {...defaultProps} />)

            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: 45.98,
                timestamp: Date.now(),
                type: 'DAQ',
            })

            await waitFor(() => {
                expect(screen.getByText('45.98')).toBeInTheDocument()
            })

            expect(screen.getByText('--')).toHaveClass('font-mono')
        })

        it('averages the latest full-plot best-fit slopes', async () => {
            const now = Date.now()
            let data = Array.from({ length: 10 }, (_, index) => ({
                timestamp: now + index * 1000,
                value: index * 2,
            }))
            const { rerender } = render(
                <SensorModule {...defaultProps} data={data} />
            )

            await waitFor(() => {
                expect(screen.getByText('+2.000/s')).toBeInTheDocument()
            })

            const expectedRates = [
                '+2.000/s',
                '+2.103/s',
                '+2.264/s',
                '+2.457/s',
                '+2.667/s',
                '+2.882/s',
                '+3.098/s',
                '+3.310/s',
                '+3.516/s',
                '+3.886/s',
            ]

            for (let index = 10; index < 20; index++) {
                data = [
                    ...data,
                    {
                        timestamp: now + index * 1000,
                        value: index * 10 - 80,
                    },
                ]
                rerender(<SensorModule {...defaultProps} data={data} />)

                await waitFor(() => {
                    expect(
                        screen.getByText(expectedRates[index - 10])
                    ).toBeInTheDocument()
                })
            }
        })

        it('discards stale slope history after a gap of insufficient data', async () => {
            const validData = [
                { timestamp: 0, value: 0 },
                { timestamp: 1000, value: 10 },
            ]
            const { rerender } = render(
                <SensorModule {...defaultProps} data={validData} />
            )

            await waitFor(() => {
                expect(screen.getByText('+10.000/s')).toBeInTheDocument()
            })

            // Drop to a single point: not enough data for a slope.
            const insufficientData = [{ timestamp: 2000, value: 10 }]
            rerender(<SensorModule {...defaultProps} data={insufficientData} />)

            await waitFor(() => {
                expect(screen.getByText('--')).toBeInTheDocument()
            })

            // Valid data again, with a different slope than before the gap.
            const newValidData = [
                { timestamp: 2000, value: 10 },
                { timestamp: 3000, value: 50 },
            ]
            rerender(<SensorModule {...defaultProps} data={newValidData} />)

            // Final rate must reflect only the new slope, not an average
            // with the stale slope from before the gap.
            await waitFor(() => {
                expect(screen.getByText('+40.000/s')).toBeInTheDocument()
            })
        })

        it('uses the least-squares slope through points in each window', async () => {
            const data = Array.from({ length: 10 }, (_, index) => ({
                timestamp: index * 1000,
                value: index < 5 ? 0 : 10,
            }))

            render(<SensorModule {...defaultProps} data={data} />)

            await waitFor(() => {
                expect(screen.getByText('+1.515/s')).toBeInTheDocument()
            })
        })
    })

    describe('Time Window Filtering', () => {
        it('filters out data points older than timeWindowSeconds', async () => {
            const now = Date.now()

            const { container } = render(
                <TestSensorModule
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

            expect(container.querySelector('.font-mono')).toHaveTextContent(
                '--'
            )
        })

        it('respects maxDataPoints by dropping oldest points', async () => {
            const now = Date.now()

            render(
                <TestSensorModule
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
            render(<TestSensorModule {...defaultProps} />)

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
                <TestSensorModule
                    {...defaultProps}
                    minUpdateIntervalMs={1000}
                />
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
            render(<TestSensorModule {...defaultProps} />)

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
            render(<TestSensorModule {...defaultProps} />)

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
            render(<TestSensorModule {...defaultProps} />)

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
            render(<TestSensorModule {...defaultProps} />)

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
            render(<TestSensorModule {...defaultProps} />)

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
            render(<TestSensorModule {...defaultProps} />)

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
            render(<TestSensorModule {...defaultProps} />)

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
            render(<TestSensorModule {...defaultProps} />)

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

    describe('Number Mode', () => {
        it('hides the chart when graphType is Number', () => {
            const { container } = render(
                <TestSensorModule {...defaultProps} graphType="Number" />
            )
            // The graph layout has a min-h-[150px] chart container; Number mode omits it
            expect(
                container.querySelector('.min-h-\\[150px\\]')
            ).not.toBeInTheDocument()
        })

        it('does not show the rate indicator when graphType is Number', async () => {
            render(
                <TestSensorModule
                    {...defaultProps}
                    graphType="Number"
                    minUpdateIntervalMs={0}
                />
            )

            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: 10,
                timestamp: Date.now(),
                type: 'DAQ',
            })
            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: 20,
                timestamp: Date.now() + 1000,
                type: 'DAQ',
            })

            await waitFor(() => {
                expect(screen.getByTitle('20')).toBeInTheDocument()
            })

            expect(screen.queryByText(/\/s/)).not.toBeInTheDocument()
        })

        it('still shows title and value when graphType is Number', async () => {
            render(
                <TestSensorModule
                    {...defaultProps}
                    graphType="Number"
                    title="Tank Heating"
                />
            )

            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: 1,
                timestamp: Date.now(),
                type: 'DAQ',
            })

            expect(screen.getByText('Tank Heating')).toBeInTheDocument()
            await waitFor(() => {
                expect(screen.getByText('1.00')).toBeInTheDocument()
            })
        })

        it('shows -- when no data and graphType is Number', () => {
            render(<TestSensorModule {...defaultProps} graphType="Number" />)
            expect(screen.getByText('--')).toBeInTheDocument()
        })

        it('renders the value with text-center class when graphType is Number', async () => {
            render(<TestSensorModule {...defaultProps} graphType="Number" />)

            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: 24.13,
                timestamp: Date.now(),
                type: 'DAQ',
            })

            await waitFor(() => {
                const valueEl = screen.getByTitle('24.13')
                expect(valueEl).toHaveClass('text-center')
            })
        })

        it('renders -- with text-center class when there is no data', () => {
            const { getByText } = render(
                <TestSensorModule {...defaultProps} graphType="Number" />
            )
            expect(getByText('--')).toHaveClass('text-center')
        })

        it('does not share a container with the title in Number mode', async () => {
            render(
                <TestSensorModule
                    {...defaultProps}
                    graphType="Number"
                    title="Tank Heating"
                />
            )

            useLastDatapointStore.getState().updateSeries('test-channel', {
                value: 24.13,
                timestamp: Date.now(),
                type: 'DAQ',
            })

            await waitFor(() => {
                const title = screen.getByText('Tank Heating')
                const value = screen.getByTitle('24.13')
                // Title is a direct child of CardContent; value is its own div sibling
                // They must not be wrapped together in a shared inner container
                expect(title.parentElement).toBe(value.parentElement)
                expect(title.nextElementSibling).toBe(value)
            })
        })
    })

    describe('EditGraphDropDown Integration', () => {
        it("opens the Edit dropdown when '...' is pressed", async () => {
            render(<TestSensorModule {...defaultProps} channelName="Fake0" />)

            await userEvent.click(screen.getByLabelText('Open menu'))

            expect(screen.getByText('Offset')).toBeInTheDocument()
        })

        it('shifts displayed data when offset is changed via dropdown', async () => {
            const onEdit = vi.fn()
            render(
                <TestSensorModule
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
                <TestSensorModule
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
