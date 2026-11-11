import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditGraphDialog from '@/components/SensorModule/EditGraphDialog'

describe('EditGraphDialog', () => {
    const baseProps = {
        open: true,
        onOpenChange: vi.fn(),
        id: 'test-id',
        title: 'Initial Title',
        titleColor: 'black',
        offset: 1.2,
        graphType: 'Graph',
        displayedHistory: '30s',
        onEdit: vi.fn(),
    }

    it('shows current offset value in the input placeholder', () => {
        render(<EditGraphDialog {...baseProps} />)
        const input = screen.getByPlaceholderText('1.2') as HTMLInputElement
        expect(input).toBeTruthy()
        expect(input.placeholder).toBe('1.2')
    })

    it('preserves initialized settings when saved without changes', async () => {
        const onEdit = vi.fn()
        render(<EditGraphDialog {...baseProps} onEdit={onEdit} />)

        await userEvent.click(screen.getByText('Save changes'))

        await waitFor(() => {
            expect(onEdit).toHaveBeenCalledWith(
                'test-id',
                expect.objectContaining({
                    title: 'Initial Title',
                    titleColor: 'black',
                    offset: 1.2,
                    graphType: 'Graph',
                    displayedHistory: '30s',
                })
            )
        })
    })

    it('updates graph title on save', async () => {
        const onEdit = vi.fn()
        render(<EditGraphDialog {...baseProps} onEdit={onEdit} />)

        const titleInput = screen.getByDisplayValue(
            'Initial Title'
        ) as HTMLInputElement
        await userEvent.clear(titleInput)
        await userEvent.type(titleInput, 'New Graph Name')

        await userEvent.click(screen.getByText('Save changes'))

        await waitFor(() => {
            expect(onEdit).toHaveBeenCalledWith(
                'test-id',
                expect.objectContaining({
                    title: 'New Graph Name',
                })
            )
        })
    })

    it('sets title color chosen under Title Color', async () => {
        const onEdit = vi.fn()
        render(<EditGraphDialog {...baseProps} onEdit={onEdit} />)

        const colorBtn = screen.getByTitle('Blue')
        await userEvent.click(colorBtn)

        await userEvent.click(screen.getByText('Save changes'))

        await waitFor(() => {
            expect(onEdit).toHaveBeenCalledWith(
                'test-id',
                expect.objectContaining({
                    titleColor: 'text-blue-500',
                })
            )
        })
    })

    it('updates displayed history on save', async () => {
        const onEdit = vi.fn()
        render(<EditGraphDialog {...baseProps} onEdit={onEdit} />)

        await userEvent.click(screen.getByRole('combobox', { name: 'History' }))
        await userEvent.click(screen.getByRole('option', { name: '5min' }))
        await userEvent.click(screen.getByText('Save changes'))

        await waitFor(() => {
            expect(onEdit).toHaveBeenCalledWith(
                'test-id',
                expect.objectContaining({
                    displayedHistory: '5min',
                })
            )
        })
    })

    it('offers short history windows and hides history for Number graphs', async () => {
        const onEdit = vi.fn()
        render(<EditGraphDialog {...baseProps} onEdit={onEdit} />)

        await userEvent.click(screen.getByRole('combobox', { name: 'History' }))
        expect(screen.getByRole('option', { name: '5s' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: '10s' })).toBeInTheDocument()
        await userEvent.click(screen.getByRole('option', { name: '10s' }))

        await userEvent.click(screen.getByRole('combobox', { name: 'Type' }))
        await userEvent.click(screen.getByRole('option', { name: 'Number' }))
        expect(
            screen.queryByRole('combobox', { name: 'History' })
        ).not.toBeInTheDocument()

        await userEvent.click(screen.getByRole('combobox', { name: 'Type' }))
        await userEvent.click(screen.getByRole('option', { name: 'Graph' }))
        expect(
            screen.getByRole('combobox', { name: 'History' })
        ).toHaveTextContent('10s')

        await userEvent.click(screen.getByText('Save changes'))
        await waitFor(() => {
            expect(onEdit).toHaveBeenCalledWith(
                'test-id',
                expect.objectContaining({ displayedHistory: '10s' })
            )
        })
    })

    it('accepts numeric offset on save', async () => {
        const onEdit = vi.fn()
        render(<EditGraphDialog {...baseProps} onEdit={onEdit} />)

        const offsetInputs = screen.getAllByPlaceholderText('1.2')
        const offsetInput = offsetInputs[0] as HTMLInputElement
        await userEvent.clear(offsetInput)
        await userEvent.type(offsetInput, '-3.4')

        await userEvent.click(screen.getByText('Save changes'))

        await waitFor(() => {
            expect(onEdit).toHaveBeenCalledWith(
                'test-id',
                expect.objectContaining({
                    offset: -3.4,
                })
            )
        })
    })

    it('ignores invalid non-numeric input and falls back to current offset', async () => {
        const onEdit = vi.fn()
        render(<EditGraphDialog {...baseProps} onEdit={onEdit} />)
        const offsetInputs = screen.getAllByPlaceholderText('1.2')
        const offsetInput = offsetInputs[0] as HTMLInputElement
        await userEvent.clear(offsetInput)
        await userEvent.type(offsetInput, 'abc')
        await userEvent.click(screen.getByText('Save changes'))

        await waitFor(() => {
            expect(onEdit).toHaveBeenCalledWith(
                'test-id',
                expect.objectContaining({
                    offset: 1.2,
                })
            )
        })
    })
})
