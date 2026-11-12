import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ServerUrlDialog } from '@/components/MainMenu/ServerUrlDialog'
import { renderWithOmnibus } from 'tests/fixtures/omnibusContext'

const mockSetServerUrl = vi.fn()

describe('ServerUrlDialog', () => {
    beforeEach(() => {
        mockSetServerUrl.mockClear()
    })

    it('renders with current URL pre-filled', () => {
        renderWithOmnibus(
            <ServerUrlDialog open={true} onOpenChange={() => {}} />,
            { setServerUrl: mockSetServerUrl }
        )

        expect(
            screen.getByDisplayValue('http://localhost:6767')
        ).toBeInTheDocument()
    })

    it('typing new URL and clicking Connect calls setServerUrl', async () => {
        renderWithOmnibus(
            <ServerUrlDialog open={true} onOpenChange={() => {}} />,
            { setServerUrl: mockSetServerUrl }
        )

        const input = screen.getByDisplayValue('http://localhost:6767')
        await userEvent.clear(input)
        await userEvent.type(input, 'http://192.168.1.100:6767')
        await userEvent.click(screen.getByText('Connect'))

        expect(mockSetServerUrl).toHaveBeenCalledWith(
            'http://192.168.1.100:6767'
        )
    })

    it('dialog closes after Connect', async () => {
        const onOpenChange = vi.fn()
        renderWithOmnibus(
            <ServerUrlDialog open={true} onOpenChange={onOpenChange} />,
            { setServerUrl: mockSetServerUrl }
        )

        await userEvent.click(screen.getByText('Connect'))

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('Cancel closes without changing URL', async () => {
        const onOpenChange = vi.fn()
        renderWithOmnibus(
            <ServerUrlDialog open={true} onOpenChange={onOpenChange} />,
            { setServerUrl: mockSetServerUrl }
        )

        const input = screen.getByDisplayValue('http://localhost:6767')
        await userEvent.clear(input)
        await userEvent.type(input, 'http://different:9999')
        await userEvent.click(screen.getByText('Cancel'))

        expect(mockSetServerUrl).not.toHaveBeenCalled()
    })

    it('submits on Enter key', async () => {
        renderWithOmnibus(
            <ServerUrlDialog open={true} onOpenChange={() => {}} />,
            { setServerUrl: mockSetServerUrl }
        )

        const input = screen.getByDisplayValue('http://localhost:6767')
        await userEvent.clear(input)
        await userEvent.type(input, 'http://new-server:6767{Enter}')

        expect(mockSetServerUrl).toHaveBeenCalledWith('http://new-server:6767')
    })
})
