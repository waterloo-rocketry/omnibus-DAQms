import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditDashboardDialog } from '@/components/MainMenu/EditDashboardDialog'
import { useDashboardStore } from '@/store/dashboardStore'
import type { GraphConfig } from '@/store/dashboardStore/types'
import { createGraphConfig } from '@/store/dashboardStore/utils'

const makeConfigs = (overrides: Partial<GraphConfig>[]): GraphConfig[] =>
    overrides.map((o) =>
        createGraphConfig({
            channelName: o.channelName ?? 'ch',
            title: o.title ?? 'Untitled',
            titleColor: o.titleColor ?? 'text-foreground',
            offset: o.offset ?? 0,
            graphType: o.graphType ?? 'Graph',
            displayedHistory: o.displayedHistory ?? '30s',
            ...o,
        })
    )

const seedStore = (configs: GraphConfig[]) => {
    useDashboardStore.setState({ graphConfigs: configs })
}

describe('EditDashboardDialog', () => {
    beforeEach(() => {
        useDashboardStore.setState({ graphConfigs: [] })
    })

    // --- Normal Mode ---

    it('renders all graph configs as rows', () => {
        seedStore(
            makeConfigs([
                { title: 'Ox Fill' },
                { title: 'Chamber Temp' },
                { title: 'Flow Rate' },
            ])
        )
        render(<EditDashboardDialog open={true} onOpenChange={() => {}} />)

        expect(screen.getByDisplayValue('Ox Fill')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Chamber Temp')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Flow Rate')).toBeInTheDocument()
    })

    it('inline title edit updates on Apply', async () => {
        const configs = makeConfigs([{ title: 'Old Title' }])
        seedStore(configs)
        const onOpenChange = (() => {}) as (open: boolean) => void
        render(<EditDashboardDialog open={true} onOpenChange={onOpenChange} />)

        const input = screen.getByDisplayValue('Old Title')
        await userEvent.clear(input)
        await userEvent.type(input, 'New Title')
        await userEvent.click(screen.getByText('Apply'))

        expect(useDashboardStore.getState().graphConfigs[0].title).toBe(
            'New Title'
        )
    })

    it('Apply commits all changes at once', async () => {
        const configs = makeConfigs([
            { title: 'A', graphType: 'Graph' },
            { title: 'B', graphType: 'Graph' },
        ])
        seedStore(configs)
        render(<EditDashboardDialog open={true} onOpenChange={() => {}} />)

        const inputA = screen.getByDisplayValue('A')
        await userEvent.clear(inputA)
        await userEvent.type(inputA, 'A2')
        await userEvent.click(screen.getByText('Apply'))

        const result = useDashboardStore.getState().graphConfigs
        expect(result[0].title).toBe('A2')
        expect(result[1].title).toBe('B')
    })

    it('Apply removes items marked for deletion', async () => {
        const configs = makeConfigs([{ title: 'Keep' }, { title: 'Delete Me' }])
        seedStore(configs)
        render(<EditDashboardDialog open={true} onOpenChange={() => {}} />)

        // Enter delete mode, mark second item
        await userEvent.click(screen.getByText('Delete Modules...'))
        const trashButtons = screen.getAllByLabelText('Mark for deletion')
        await userEvent.click(trashButtons[1])

        // Exit delete mode
        await userEvent.click(screen.getByText('Done'))

        // Apply
        await userEvent.click(screen.getByText('Apply'))

        const result = useDashboardStore.getState().graphConfigs
        expect(result).toHaveLength(1)
        expect(result[0].title).toBe('Keep')
    })

    it('dialog resets state on reopen', async () => {
        const configs = makeConfigs([{ title: 'Original' }])
        seedStore(configs)
        const { rerender } = render(
            <EditDashboardDialog open={true} onOpenChange={() => {}} />
        )

        const input = screen.getByDisplayValue('Original')
        await userEvent.clear(input)
        await userEvent.type(input, 'Changed')

        // Close and reopen
        rerender(<EditDashboardDialog open={false} onOpenChange={() => {}} />)
        rerender(<EditDashboardDialog open={true} onOpenChange={() => {}} />)

        expect(screen.getByDisplayValue('Original')).toBeInTheDocument()
    })

    it('color change updates on Apply', async () => {
        seedStore(
            makeConfigs([{ title: 'Colored', titleColor: 'text-foreground' }])
        )
        render(<EditDashboardDialog open={true} onOpenChange={() => {}} />)

        await userEvent.click(screen.getByRole('button', { name: 'Green color' }))
        await userEvent.click(screen.getByText('Apply'))

        expect(useDashboardStore.getState().graphConfigs[0].titleColor).toBe(
            'text-green-500'
        )
    })

    it('Edit button opens EditGraphDialog', async () => {
        seedStore(makeConfigs([{ title: 'My Graph' }]))
        render(<EditDashboardDialog open={true} onOpenChange={() => {}} />)

        await userEvent.click(screen.getByText('Edit'))

        await waitFor(() => {
            expect(screen.getByText(/Edit — My Graph/)).toBeInTheDocument()
        })
    })

    it('EditGraphDialog save updates working copy on Apply', async () => {
        seedStore(makeConfigs([{ title: 'Before Edit', offset: 0 }]))
        render(<EditDashboardDialog open={true} onOpenChange={() => {}} />)

        // Open the full edit dialog
        await userEvent.click(screen.getByText('Edit'))
        await waitFor(() => {
            expect(screen.getByText(/Edit — Before Edit/)).toBeInTheDocument()
        })

        // The nested EditGraphDialog has its own title input — find it
        // inside the dialog that contains "Save changes"
        const inputs = screen.getAllByDisplayValue('Before Edit')
        // The second one is inside the nested EditGraphDialog
        const nestedInput = inputs[inputs.length - 1]
        await userEvent.clear(nestedInput)
        await userEvent.type(nestedInput, 'After Edit')
        await userEvent.click(screen.getByText('Save changes'))

        // Back in the edit dashboard dialog, apply
        await waitFor(() => {
            expect(screen.getByDisplayValue('After Edit')).toBeInTheDocument()
        })
        await userEvent.click(screen.getByText('Apply'))

        expect(useDashboardStore.getState().graphConfigs[0].title).toBe(
            'After Edit'
        )
    })

    // --- Delete Mode ---

    it('"Delete Modules..." enters delete mode', async () => {
        seedStore(makeConfigs([{ title: 'Test' }]))
        render(<EditDashboardDialog open={true} onOpenChange={() => {}} />)

        await userEvent.click(screen.getByText('Delete Modules...'))

        // Edit controls gone, trash icon appears
        expect(screen.queryByDisplayValue('Test')).not.toBeInTheDocument()
        expect(screen.getByLabelText('Mark for deletion')).toBeInTheDocument()
        // Cancel and Done buttons appear
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        expect(screen.getByText('Done')).toBeInTheDocument()
    })

    it('clicking trash marks item and shows deletion message', async () => {
        seedStore(makeConfigs([{ title: 'Doomed' }]))
        render(<EditDashboardDialog open={true} onOpenChange={() => {}} />)

        await userEvent.click(screen.getByText('Delete Modules...'))
        await userEvent.click(screen.getByLabelText('Mark for deletion'))

        expect(
            screen.getByText('This module will be deleted.')
        ).toBeInTheDocument()
        expect(screen.getByLabelText('Revert deletion')).toBeInTheDocument()
    })

    it('revert button un-marks deletion', async () => {
        seedStore(makeConfigs([{ title: 'Saved' }]))
        render(<EditDashboardDialog open={true} onOpenChange={() => {}} />)

        await userEvent.click(screen.getByText('Delete Modules...'))
        await userEvent.click(screen.getByLabelText('Mark for deletion'))
        await userEvent.click(screen.getByLabelText('Revert deletion'))

        expect(
            screen.queryByText('This module will be deleted.')
        ).not.toBeInTheDocument()
        expect(screen.getByLabelText('Mark for deletion')).toBeInTheDocument()
    })

    it('Cancel reverts all deletion marks', async () => {
        seedStore(makeConfigs([{ title: 'A' }, { title: 'B' }]))
        render(<EditDashboardDialog open={true} onOpenChange={() => {}} />)

        await userEvent.click(screen.getByText('Delete Modules...'))
        const trashButtons = screen.getAllByLabelText('Mark for deletion')
        await userEvent.click(trashButtons[0])
        await userEvent.click(trashButtons[1])

        await userEvent.click(screen.getByText('Cancel'))

        // Back in normal mode, both items editable
        expect(screen.getByDisplayValue('A')).toBeInTheDocument()
        expect(screen.getByDisplayValue('B')).toBeInTheDocument()
    })

    it('Done preserves marks and returns to normal mode', async () => {
        seedStore(makeConfigs([{ title: 'Marked' }]))
        render(<EditDashboardDialog open={true} onOpenChange={() => {}} />)

        await userEvent.click(screen.getByText('Delete Modules...'))
        await userEvent.click(screen.getByLabelText('Mark for deletion'))
        await userEvent.click(screen.getByText('Done'))

        // Still marked, shows deletion message in normal mode
        expect(
            screen.getByText('This module will be deleted.')
        ).toBeInTheDocument()
        // Apply button visible again
        expect(screen.getByText('Apply')).toBeInTheDocument()
    })

    it('Apply button is hidden in delete mode', async () => {
        seedStore(makeConfigs([{ title: 'Test' }]))
        render(<EditDashboardDialog open={true} onOpenChange={() => {}} />)

        expect(screen.getByText('Apply')).toBeInTheDocument()
        await userEvent.click(screen.getByText('Delete Modules...'))
        expect(screen.queryByText('Apply')).not.toBeInTheDocument()
    })

    // --- Edge Cases ---

    it('empty dashboard shows "No modules to edit."', () => {
        render(<EditDashboardDialog open={true} onOpenChange={() => {}} />)

        expect(screen.getByText('No modules to edit.')).toBeInTheDocument()
    })

    it('all items deleted then Apply writes empty array', async () => {
        seedStore(makeConfigs([{ title: 'Only One' }]))
        render(<EditDashboardDialog open={true} onOpenChange={() => {}} />)

        await userEvent.click(screen.getByText('Delete Modules...'))
        await userEvent.click(screen.getByLabelText('Mark for deletion'))
        await userEvent.click(screen.getByText('Done'))
        await userEvent.click(screen.getByText('Apply'))

        expect(useDashboardStore.getState().graphConfigs).toHaveLength(0)
    })
})
