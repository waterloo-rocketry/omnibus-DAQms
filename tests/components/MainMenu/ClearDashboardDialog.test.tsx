import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClearDashboardDialog } from '@/components/MainMenu/ClearDashboardDialog'
import { useDashboardStore } from '@/store/dashboardStore'
import { createGraphConfig } from '@/components/LiveDataDashboard/utils'

describe('ClearDashboardDialog', () => {
    beforeEach(() => {
        useDashboardStore.setState({ graphConfigs: [] })
    })

    it('renders warning message when open', () => {
        render(<ClearDashboardDialog open={true} onOpenChange={() => {}} />)

        expect(screen.getByText('Clear Dashboard')).toBeInTheDocument()
        expect(screen.getByText(/remove all graphs/)).toBeInTheDocument()
    })

    it('Cancel closes dialog without clearing', async () => {
        useDashboardStore.setState({
            graphConfigs: [
                createGraphConfig({
                    channelName: 'ch1',
                    title: 'Test',
                    titleColor: 'text-foreground',
                    offset: 0,
                    graphType: 'Graph',
                    displayedHistory: '30s',
                }),
            ],
        })
        const onOpenChange = vi.fn()
        render(<ClearDashboardDialog open={true} onOpenChange={onOpenChange} />)

        await userEvent.click(screen.getByText('Cancel'))

        expect(useDashboardStore.getState().graphConfigs).toHaveLength(1)
    })

    it('Clear button empties graphConfigs in store', async () => {
        useDashboardStore.setState({
            graphConfigs: [
                createGraphConfig({
                    channelName: 'ch1',
                    title: 'Test',
                    titleColor: 'text-foreground',
                    offset: 0,
                    graphType: 'Graph',
                    displayedHistory: '30s',
                }),
            ],
        })
        const onOpenChange = vi.fn()
        render(<ClearDashboardDialog open={true} onOpenChange={onOpenChange} />)

        await userEvent.click(screen.getByText('Clear'))

        expect(useDashboardStore.getState().graphConfigs).toHaveLength(0)
    })

    it('dialog closes after clearing', async () => {
        const onOpenChange = vi.fn()
        render(<ClearDashboardDialog open={true} onOpenChange={onOpenChange} />)

        await userEvent.click(screen.getByText('Clear'))

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('works when dashboard is already empty', async () => {
        const onOpenChange = vi.fn()
        render(<ClearDashboardDialog open={true} onOpenChange={onOpenChange} />)

        await userEvent.click(screen.getByText('Clear'))

        expect(useDashboardStore.getState().graphConfigs).toHaveLength(0)
        expect(onOpenChange).toHaveBeenCalledWith(false)
    })
})
