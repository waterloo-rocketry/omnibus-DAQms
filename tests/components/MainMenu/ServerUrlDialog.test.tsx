import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ServerUrlDialog } from '@/components/MainMenu/ServerUrlDialog'

const mockSetServerUrl = vi.fn()

vi.mock('@/hooks/useOmnibusContext', () => ({
    useOmnibusContext: () => ({
        connectionStatus: 'connected',
        error: null,
        serverUrl: 'http://localhost:6767',
        setServerUrl: mockSetServerUrl,
    }),
}))

describe('ServerUrlDialog', () => {
    beforeEach(() => {
        mockSetServerUrl.mockClear()
    })

    it('renders with current URL pre-filled', () => {
        render(<ServerUrlDialog open={true} onOpenChange={() => {}} />)

        expect(
            screen.getByDisplayValue('http://localhost:6767')
        ).toBeInTheDocument()
    })

    it('typing new URL and clicking Connect calls setServerUrl', async () => {
        const onOpenChange = vi.fn()
        render(<ServerUrlDialog open={true} onOpenChange={onOpenChange} />)

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
        render(<ServerUrlDialog open={true} onOpenChange={onOpenChange} />)

        await userEvent.click(screen.getByText('Connect'))

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('Cancel closes without changing URL', async () => {
        const onOpenChange = vi.fn()
        render(<ServerUrlDialog open={true} onOpenChange={onOpenChange} />)

        const input = screen.getByDisplayValue('http://localhost:6767')
        await userEvent.clear(input)
        await userEvent.type(input, 'http://different:9999')
        await userEvent.click(screen.getByText('Cancel'))

        expect(mockSetServerUrl).not.toHaveBeenCalled()
    })

    it('submits on Enter key', async () => {
        render(<ServerUrlDialog open={true} onOpenChange={() => {}} />)

        const input = screen.getByDisplayValue('http://localhost:6767')
        await userEvent.clear(input)
        await userEvent.type(input, 'http://new-server:6767{Enter}')

        expect(mockSetServerUrl).toHaveBeenCalledWith('http://new-server:6767')
    })
})
