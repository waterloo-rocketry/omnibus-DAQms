import { it, expect, describe, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditGraphDropDown from '@/components/LineGraph/EditGraphDropDown'

describe('EditGraphDropDown', () => {
    const mockSetters = {
        setGraphTitle: vi.fn(),
        setTitleColor: vi.fn(),
        setOffset: vi.fn(),
        setGraphType: vi.fn(),
        setDisplayedHistory: vi.fn(),
    }

    const defaultProps = {
        options: {
            graphTitle: 'Test Graph',
            titleColor: 'black' as const,
            offset: 0,
            graphType: 'Graph' as const,
            displayedHistory: '30s' as const,
            ...mockSetters,
        },
        onSetZeroPoint: vi.fn(),
        deleteGraph: false,
        setDeleteGraph: vi.fn(),
    }

    it('increments offset by 0.1 when + button is pressed', async () => {
        const setOffsetMock = vi.fn()
        render(
            <EditGraphDropDown
                {...defaultProps}
                options={{
                    ...defaultProps.options,
                    offset: 0,
                    setOffset: setOffsetMock,
                }}
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
                options={{
                    ...defaultProps.options,
                    offset: 0.5,
                    setOffset: setOffsetMock,
                }}
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
