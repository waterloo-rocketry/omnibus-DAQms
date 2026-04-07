import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddDataDialog } from '@/components/MainMenu/AddDataDialog'
import { useLastDatapointStore } from '@/store/omnibusStore'
import { useDashboardStore } from '@/store/dashboardStore'

const seedChannels = (
    channels: Record<string, { value: number; timestamp: number; type: string }>
) => {
    useLastDatapointStore.setState({ series: channels })
}

describe('AddDataDialog', () => {
    beforeEach(() => {
        useLastDatapointStore.setState({ series: {} })
        useDashboardStore.setState({ graphConfigs: [] })
    })

    it('renders channel list from store', () => {
        seedChannels({
            'OPT-101': { value: 42, timestamp: 1000, type: 'DAQ' },
            'NPT-201': { value: 10, timestamp: 1000, type: 'DAQ' },
        })
        render(<AddDataDialog open={true} onOpenChange={() => {}} />)

        expect(screen.getByText('NPT-201')).toBeInTheDocument()
        expect(screen.getByText('OPT-101')).toBeInTheDocument()
    })

    it('shows type badge for each channel', () => {
        seedChannels({
            'OPT-101': { value: 42, timestamp: 1000, type: 'DAQ' },
            'RLCS-001': { value: 1, timestamp: 1000, type: 'RLCS' },
        })
        render(<AddDataDialog open={true} onOpenChange={() => {}} />)

        expect(screen.getByText('DAQ')).toBeInTheDocument()
        expect(screen.getByText('RLCS')).toBeInTheDocument()
    })

    it('Add button is disabled when nothing selected', () => {
        seedChannels({
            'OPT-101': { value: 42, timestamp: 1000, type: 'DAQ' },
        })
        render(<AddDataDialog open={true} onOpenChange={() => {}} />)

        expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
    })

    it('Add button enables when a checkbox is checked', async () => {
        seedChannels({
            'OPT-101': { value: 42, timestamp: 1000, type: 'DAQ' },
        })
        render(<AddDataDialog open={true} onOpenChange={() => {}} />)

        await userEvent.click(screen.getByText('OPT-101'))
        expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled()
    })

    it('selecting channels and clicking Add creates graph configs', async () => {
        seedChannels({
            'OPT-101': { value: 42, timestamp: 1000, type: 'DAQ' },
            'NPT-201': { value: 10, timestamp: 1000, type: 'DAQ' },
            'FPT-301': { value: 5, timestamp: 1000, type: 'DAQ' },
        })
        const onOpenChange = vi.fn()
        render(<AddDataDialog open={true} onOpenChange={onOpenChange} />)

        await userEvent.click(screen.getByText('OPT-101'))
        await userEvent.click(screen.getByText('NPT-201'))
        await userEvent.click(screen.getByRole('button', { name: 'Add' }))

        const configs = useDashboardStore.getState().graphConfigs
        expect(configs).toHaveLength(2)
        expect(configs.map((c) => c.channelName).sort()).toEqual([
            'NPT-201',
            'OPT-101',
        ])
        expect(configs[0].title).toBe(configs[0].channelName)
    })

    it('dialog closes after Add', async () => {
        seedChannels({
            'OPT-101': { value: 42, timestamp: 1000, type: 'DAQ' },
        })
        const onOpenChange = vi.fn()
        render(<AddDataDialog open={true} onOpenChange={onOpenChange} />)

        await userEvent.click(screen.getByText('OPT-101'))
        await userEvent.click(screen.getByRole('button', { name: 'Add' }))

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('shows empty state when no channels available', () => {
        render(<AddDataDialog open={true} onOpenChange={() => {}} />)

        expect(screen.getByText('No channels available')).toBeInTheDocument()
    })

    it('resets selection when dialog closes', async () => {
        seedChannels({
            'OPT-101': { value: 42, timestamp: 1000, type: 'DAQ' },
        })
        const { rerender } = render(
            <AddDataDialog open={true} onOpenChange={() => {}} />
        )
        await userEvent.click(screen.getByText('OPT-101'))
        expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled()
        rerender(<AddDataDialog open={false} onOpenChange={() => {}} />)
        rerender(<AddDataDialog open={true} onOpenChange={() => {}} />)
        expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
    })

    it('channels are sorted alphabetically', () => {
        seedChannels({
            Zebra: { value: 1, timestamp: 1000, type: 'DAQ' },
            Alpha: { value: 2, timestamp: 1000, type: 'DAQ' },
            Middle: { value: 3, timestamp: 1000, type: 'DAQ' },
        })
        render(<AddDataDialog open={true} onOpenChange={() => {}} />)

        const labels = screen.getAllByText(/Alpha|Middle|Zebra/)
        expect(labels.map((el) => el.textContent)).toEqual([
            'Alpha',
            'Middle',
            'Zebra',
        ])
    })
})
