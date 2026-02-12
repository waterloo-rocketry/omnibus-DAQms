import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditGraphDialog from '@/components/LineGraph/EditGraphDialog'

describe('EditGraphDialog', () => {
    const noop = () => {}

    const baseProps = {
        openEdit: true,
        setOpenEdit: noop,
        currentTitle: 'Initial Title',
        setGraphTitle: vi.fn(),
        currentColor: 'black',
        setTitleColor: vi.fn(),
        currentOffset: 1.2,
        setCurrentOffset: vi.fn(),
        currentGraphType: 'Graph',
        setCurrentGraphType: noop,
        displayedHistory: '30s',
        setDisplayedHistory: noop,
    }

    it('shows current offset value in the input placeholder', () => {
        render(<EditGraphDialog {...baseProps} />)
        const input = screen.getByPlaceholderText('1.2') as HTMLInputElement
        expect(input).toBeTruthy()
        expect(input.placeholder).toBe('1.2')
    })

    it('updates graph title on save', async () => {
        const setGraphTitle = vi.fn()
        render(<EditGraphDialog {...baseProps} setGraphTitle={setGraphTitle} />)

        const titleInput = screen.getByDisplayValue(
            'Initial Title'
        ) as HTMLInputElement
        await userEvent.clear(titleInput)
        await userEvent.type(titleInput, 'New Graph Name')

        await userEvent.click(screen.getByText('Save changes'))

        await waitFor(() => {
            expect(setGraphTitle).toHaveBeenCalledWith('New Graph Name')
        })
    })

    it('sets title color chosen under Title Color', async () => {
        const setTitleColor = vi.fn()
        render(<EditGraphDialog {...baseProps} setTitleColor={setTitleColor} />)

        // click the blue color button
        const buttons = screen.getAllByRole('button')
        const colorBtn = buttons.find((b) =>
            b.getAttribute('style')?.includes('background-color: blue')
        )
        if (!colorBtn) throw new Error('color button not found')
        await userEvent.click(colorBtn)

        await userEvent.click(screen.getByText('Save changes'))

        await waitFor(() => {
            expect(setTitleColor).toHaveBeenCalled()
        })
    })

    it('accepts numeric offset on save', async () => {
        const setCurrentOffset = vi.fn()
        render(
            <EditGraphDialog
                {...baseProps}
                setCurrentOffset={setCurrentOffset}
            />
        )

        const offsetInputs = screen.getAllByPlaceholderText('1.2')
        const offsetInput = offsetInputs[0] as HTMLInputElement
        await userEvent.clear(offsetInput)
        await userEvent.type(offsetInput, '-3.4')

        await userEvent.click(screen.getByText('Save changes'))

        await waitFor(() => {
            expect(setCurrentOffset).toHaveBeenCalledWith(-3.4)
        })
    })

    it('ignores invalid non-numeric input and falls back to 0', async () => {
        const setCurrentOffset = vi.fn()
        render(
            <EditGraphDialog
                {...baseProps}
                setCurrentOffset={setCurrentOffset}
            />
        )
        const offsetInputs = screen.getAllByPlaceholderText('1.2')
        const offsetInput = offsetInputs[0] as HTMLInputElement
        await userEvent.clear(offsetInput)
        await userEvent.type(offsetInput, 'abc')
        await userEvent.click(screen.getByText('Save changes'))

        await waitFor(() => {
            expect(setCurrentOffset).toHaveBeenCalledWith(1.2)
        })
    })
})
