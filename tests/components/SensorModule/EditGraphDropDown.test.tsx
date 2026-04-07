import { it, expect, describe, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditGraphDropDown from '@/components/SensorModule/EditGraphDropDown'

describe('EditGraphDropDown', () => {
    const defaultProps = {
        id: 'test-id',
        title: 'Test Graph',
        titleColor: 'black' as const,
        offset: 0,
        graphType: 'Graph',
        displayedHistory: '30s',
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onSetZeroPoint: vi.fn(),
    }

    it('increments offset by 0.5 when + button is pressed', async () => {
        const onEdit = vi.fn()
        render(
            <EditGraphDropDown {...defaultProps} offset={0} onEdit={onEdit} />
        )

        await userEvent.click(screen.getByLabelText('Open menu'))
        await userEvent.click(screen.getByText('+'))

        expect(onEdit).toHaveBeenCalledWith('test-id', { offset: 0.5 })
    })

    it('decrements offset by 0.5 when - button is pressed', async () => {
        const onEdit = vi.fn()
        render(
            <EditGraphDropDown {...defaultProps} offset={0.5} onEdit={onEdit} />
        )

        await userEvent.click(screen.getByLabelText('Open menu'))
        await userEvent.click(screen.getByText('–'))

        expect(onEdit).toHaveBeenCalledWith('test-id', { offset: 0.0 })
    })

    it('opens EditGraphDialog when Edit button is pressed', async () => {
        render(<EditGraphDropDown {...defaultProps} />)

        await userEvent.click(screen.getByLabelText('Open menu'))
        await userEvent.click(screen.getByText('Edit'))

        await waitFor(() => {
            expect(screen.getByText(/Edit — Test Graph/)).toBeInTheDocument()
        })
    })

    it('opens DeleteGraphDialog when Delete button is pressed', async () => {
        render(<EditGraphDropDown {...defaultProps} />)

        await userEvent.click(screen.getByLabelText('Open menu'))
        await userEvent.click(screen.getByText('Delete'))

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })
    })
})
