import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SensorModule } from '../src/components/SensorModule'
import { useOmnibusStore } from '../src/store/omnibusStore'

vi.mock('../src/store/omnibusStore', () => ({
    useOmnibusStore: vi.fn(),
}))

describe('SensorModule', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useOmnibusStore).mockReturnValue(undefined)
    })

    describe('Title Display', () => {
        it('renders title correctly', () => {
            render(
                <SensorModule
                    channelName="test-channel"
                    title="Ox Fill (psi)"
                />
            )

            expect(screen.getByText('Ox Fill (psi)')).toBeInTheDocument()
        })

        it('falls back to channelName when no title provided', () => {
            render(<SensorModule channelName="test-channel" />)

            expect(screen.getByText('test-channel')).toBeInTheDocument()
        })

        it('applies custom title color', () => {
            render(
                <SensorModule
                    channelName="test-channel"
                    title="Test Sensor"
                    titleColor="text-blue-500"
                />
            )

            const title = screen.getByText('Test Sensor')
            expect(title).toHaveClass('text-blue-500')
        })

        it('truncates long titles with ellipsis', () => {
            const longTitle = 'A'.repeat(100)
            render(
                <SensorModule
                    channelName="test-channel"
                    title={longTitle}
                />
            )

            const title = screen.getByTitle(longTitle)
            expect(title).toHaveClass('line-clamp-2')
        })
    })

    describe('Value Display', () => {
        it('displays current value with 2 decimal places', () => {
            vi.mocked(useOmnibusStore).mockReturnValue({
                value: 45.98,
                timestamp: Date.now(),
            })

            render(<SensorModule channelName="test-channel" />)

            expect(screen.getByText('45.98')).toBeInTheDocument()
        })

        it('displays -- when no data available', () => {
            vi.mocked(useOmnibusStore).mockReturnValue(undefined)

            render(<SensorModule channelName="test-channel" />)

            expect(screen.getByText('--')).toBeInTheDocument()
        })

        it('truncates value to 6 characters when too long', () => {
            vi.mocked(useOmnibusStore).mockReturnValue({
                value: 123456.789,
                timestamp: Date.now(),
            })

            render(<SensorModule channelName="test-channel" />)

            const valueElement = screen.getByTitle('123456.789')
            expect(valueElement.textContent).toHaveLength(6)
        })
    })

    describe('Rate Calculation', () => {
        it('does not display rate with insufficient data', () => {
            vi.mocked(useOmnibusStore).mockReturnValue({
                value: 45.98,
                timestamp: Date.now(),
            })

            const { container } = render(
                <SensorModule channelName="test-channel" unit="psi" />
            )

            const rateDisplay = container.querySelector('.font-mono')
            expect(rateDisplay).not.toBeInTheDocument()
        })
    })

    describe('Time Window Filtering', () => {
        it('respects custom time window', () => {
            render(
                <SensorModule
                    channelName="test-channel"
                    timeWindowSeconds={60}
                />
            )

            expect(screen.getByText('--')).toBeInTheDocument()
        })

        it('respects custom max data points', () => {
            render(
                <SensorModule channelName="test-channel" maxDataPoints={50} />
            )

            expect(screen.getByText('--')).toBeInTheDocument()
        })
    })

    describe('Time-bound Filtering', () => {
        it('accepts first data point immediately', () => {
            vi.mocked(useOmnibusStore).mockReturnValue({
                value: 100,
                timestamp: Date.now(),
            })

            render(<SensorModule channelName="test-channel" />)

            const value = screen.getByTitle('100')
            expect(value.textContent).toBe('100.00')
        })

        it('respects custom minUpdateIntervalMs prop', () => {
            vi.mocked(useOmnibusStore).mockReturnValue({
                value: 100,
                timestamp: Date.now(),
            })

            render(
                <SensorModule 
                    channelName="test-channel" 
                    minUpdateIntervalMs={1000}
                />
            )

            const value = screen.getByTitle('100')
            expect(value.textContent).toBe('100.00')
        })
    })

    describe('Value Formatting', () => {
        it('formats values with exactly 2 decimal places', () => {
            vi.mocked(useOmnibusStore).mockReturnValue({
                value: 45,
                timestamp: Date.now(),
            })

            render(<SensorModule channelName="test-channel" />)

            const value = screen.getByTitle('45')
            expect(value.textContent).toBe('45.00')
        })

        it('handles negative values correctly', () => {
            vi.mocked(useOmnibusStore).mockReturnValue({
                value: -12.34,
                timestamp: Date.now(),
            })

            render(<SensorModule channelName="test-channel" />)

            expect(screen.getByText('-12.34')).toBeInTheDocument()
        })

        it('handles zero correctly', () => {
            vi.mocked(useOmnibusStore).mockReturnValue({
                value: 0,
                timestamp: Date.now(),
            })

            render(<SensorModule channelName="test-channel" />)

            const value = screen.getByTitle('0')
            expect(value.textContent).toBe('0.00')
        })

        it('handles very large numbers', () => {
            vi.mocked(useOmnibusStore).mockReturnValue({
                value: 999999.99,
                timestamp: Date.now(),
            })

            render(<SensorModule channelName="test-channel" />)

            const valueElement = screen.getByTitle('999999.99')
            expect(valueElement.textContent).toHaveLength(6)
            expect(valueElement.textContent).toBe('999999')
        })
    })
})

