import { it, expect, describe, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditGraphDropDown from '@/components/LineGraph/EditGraphDropDown'

describe('EditGraphDropDown', () => {
    const mockSetters = {
        setGraphTitle: () => {},
        setTitleColor: () => {},
        setOffset: () => {},
        setSetZeroPoint: () => {},
        setGraphType: () => {},
        setDisplayedHistory: () => {},
        setDeleteGraph: () => {},
    }

    const defaultProps = {
        graphTitle: 'Test Graph',
        titleColor: 'black',
        offset: 0,
        setZeroPoint: false,
        graphType: 'Graph',
        displayedHistory: '30s',
        deleteGraph: false,
        ...mockSetters,
    }

    it('increments offset by 0.1 when + button is pressed', async () => {
        const setOffsetMock = vi.fn()
        const { rerender } = render(
            <EditGraphDropDown
                {...defaultProps}
                offset={0}
                setOffset={setOffsetMock}
            />
        )

        await userEvent.click(screen.getByLabelText('Open menu'))
        await userEvent.click(screen.getByText('+'))

        expect(setOffsetMock).toHaveBeenCalledWith(expect.any(Function))
        const updateFn = setOffsetMock.mock.calls[0][0]
        expect(updateFn(0)).toBe(0.1)
        expect(updateFn(2.5)).toBe(2.6)
    })

    it('decrements offset by 0.1 when - button is pressed', async () => {
        const setOffsetMock = vi.fn()
        render(
            <EditGraphDropDown
                {...defaultProps}
                offset={0.5}
                setOffset={setOffsetMock}
            />
        )

        await userEvent.click(screen.getByLabelText('Open menu'))
        await userEvent.click(screen.getByText('–'))

        expect(setOffsetMock).toHaveBeenCalledWith(expect.any(Function))
        const updateFn = setOffsetMock.mock.calls[0][0]
        expect(updateFn(0.5)).toBe(0.4)
        expect(updateFn(2.5)).toBe(2.4)
    })

    it('opens EditGraphDialog when Edit button is pressed', async () => {
        render(<EditGraphDropDown {...defaultProps} />)

        await userEvent.click(screen.getByLabelText('Open menu'))
        await userEvent.click(screen.getByText('Edit'))

        // EditGraphDialog opens with title
        await waitFor(() => {
            expect(screen.getByText(/Edit — Test Graph/)).toBeInTheDocument()
        })
    })

    it('opens DeleteGraphDialog when Delete button is pressed', async () => {
        render(<EditGraphDropDown {...defaultProps} />)

        await userEvent.click(screen.getByLabelText('Open menu'))
        await userEvent.click(screen.getByText('Delete'))

        // DeleteGraphDialog appears - it should have a delete confirmation message
        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })
    })
})
