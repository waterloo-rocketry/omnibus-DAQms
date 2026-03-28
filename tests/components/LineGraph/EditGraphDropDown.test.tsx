import { it, expect, describe, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditGraphDropDown from '@/components/LineGraph/EditGraphDropDown'

describe('EditGraphDropDown', () => {
    const mockSetters = {
        setGraphTitle: vi.fn(),
        setTitleColor: vi.fn(),
        setSetZeroPoint: vi.fn(),
        setGraphType: vi.fn(),
        setDisplayedHistory: vi.fn(),
        setDeleteGraph: vi.fn(),
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

    async function openDropdown() {
        await userEvent.click(screen.getByLabelText('Open menu'))
    }

    it('increments offset by 0.5 when + button is pressed', async () => {
        const setOffsetMock = vi.fn()
        render(
            <EditGraphDropDown
                {...defaultProps}
                offset={0}
                setOffset={setOffsetMock}
            />
        )

        await openDropdown()
        await userEvent.click(screen.getByText('+'))

        expect(setOffsetMock).toHaveBeenCalledWith(expect.any(Function))
        const updateFn = setOffsetMock.mock.calls[0][0]
        expect(updateFn(0)).toBe(0.5)
        expect(updateFn(2.5)).toBe(3.0)
    })

    it('decrements offset by 0.5 when - button is pressed', async () => {
        const setOffsetMock = vi.fn()
        render(
            <EditGraphDropDown
                {...defaultProps}
                offset={0.5}
                setOffset={setOffsetMock}
            />
        )

        await openDropdown()
        await userEvent.click(screen.getByText('–'))

        expect(setOffsetMock).toHaveBeenCalledWith(expect.any(Function))
        const updateFn = setOffsetMock.mock.calls[0][0]
        expect(updateFn(0.5)).toBe(0.0)
        expect(updateFn(2.5)).toBe(2.0)
    })

    it('accepts a valid integer and calls setOffset with parsed number', async () => {
        const setOffsetMock = vi.fn()
        render(<EditGraphDropDown {...defaultProps} setOffset={setOffsetMock} />)
        await openDropdown()

        const input = screen.getByRole('textbox')
        await userEvent.clear(input)
        await userEvent.type(input, '5')
        fireEvent.blur(input)

        expect(setOffsetMock).toHaveBeenCalledWith(5)
    })

    it('accepts a valid decimal and calls setOffset with parsed number', async () => {
        const setOffsetMock = vi.fn()
        render(<EditGraphDropDown {...defaultProps} setOffset={setOffsetMock} />)
        await openDropdown()

        const input = screen.getByRole('textbox')
        await userEvent.clear(input)
        await userEvent.type(input, '3.7')
        fireEvent.blur(input)

        expect(setOffsetMock).toHaveBeenCalledWith(3.7)
    })

    it('accepts a negative number and calls setOffset with parsed number', async () => {
        const setOffsetMock = vi.fn()
        render(<EditGraphDropDown {...defaultProps} setOffset={setOffsetMock} />)
        await openDropdown()

        const input = screen.getByRole('textbox')
        await userEvent.clear(input)
        await userEvent.type(input, '-2.5')
        fireEvent.blur(input)

        expect(setOffsetMock).toHaveBeenCalledWith(-2.5)
    })

    it('does not call setOffset when input is non-numeric', async () => {
        const setOffsetMock = vi.fn()
        render(<EditGraphDropDown {...defaultProps} offset={1.0} setOffset={setOffsetMock} />)
        await openDropdown()

        const input = screen.getByRole('textbox')
        await userEvent.clear(input)
        await userEvent.type(input, 'abc')
        await userEvent.tab()

        expect(setOffsetMock).not.toHaveBeenCalled()
    })

    it('resets input to last valid offset when non-numeric value is blurred', async () => {
        const setOffsetMock = vi.fn()
        render(<EditGraphDropDown {...defaultProps} offset={1.5} setOffset={setOffsetMock} />)
        await openDropdown()

        const input = screen.getByRole('textbox') as HTMLInputElement
        await userEvent.clear(input)
        await userEvent.type(input, 'xyz')
        fireEvent.blur(input)

        expect(input.value).toBe('1.5')
    })

    it('does not call setOffset when only a minus sign is entered', async () => {
        const setOffsetMock = vi.fn()
        render(<EditGraphDropDown {...defaultProps} offset={0} setOffset={setOffsetMock} />)
        await openDropdown()

        const input = screen.getByRole('textbox')
        await userEvent.clear(input)
        await userEvent.type(input, '-')
        await userEvent.tab()

        expect(setOffsetMock).not.toHaveBeenCalled()
    })

    it('opens EditGraphDialog when Edit button is pressed', async () => {
        render(<EditGraphDropDown {...defaultProps} setOffset={vi.fn()} />)

        await openDropdown()
        await userEvent.click(screen.getByText('Edit'))

        await waitFor(() => {
            expect(screen.getByText(/Edit — Test Graph/)).toBeInTheDocument()
        })
    })

    it('opens DeleteGraphDialog when Delete button is pressed', async () => {
        render(<EditGraphDropDown {...defaultProps} setOffset={vi.fn()} />)

        await openDropdown()
        await userEvent.click(screen.getByText('Delete'))

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })
    })
})