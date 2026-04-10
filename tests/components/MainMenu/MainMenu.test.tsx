import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MainMenu } from '@/components/MainMenu'
import { useDashboardStore } from '@/store/dashboardStore'

const mockUseOmnibusContext = vi.fn()

vi.mock('@/hooks/useOmnibusContext', () => ({
    useOmnibusContext: () => mockUseOmnibusContext(),
}))

describe('MainMenu', () => {
    beforeEach(() => {
        mockUseOmnibusContext.mockReturnValue({
            connectionStatus: 'connected',
            error: null,
            serverUrl: 'http://localhost:6767',
            setServerUrl: vi.fn(),
        })
        useDashboardStore.setState({ addDataOpen: false })
    })

    it('renders the floating control bar with menu button', () => {
        render(<MainMenu />)
        expect(screen.getByLabelText('Open main menu')).toBeInTheDocument()
    })

    it('shows connection status text and dot', () => {
        render(<MainMenu />)
        expect(screen.getByText('Connected')).toBeInTheDocument()
        expect(screen.getByTitle('Connected')).toBeInTheDocument()
    })

    it('opens menu on click and shows all items', async () => {
        render(<MainMenu />)
        await userEvent.click(screen.getByLabelText('Open main menu'))

        expect(screen.getByText('Add Item')).toBeInTheDocument()
        expect(screen.getByText('Edit Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Clear')).toBeInTheDocument()
    })

    it('shows footer with app name and build hash', async () => {
        render(<MainMenu />)
        await userEvent.click(screen.getByLabelText('Open main menu'))

        expect(screen.getByText('DAQms')).toBeInTheDocument()
        expect(screen.getByText(/Build /)).toBeInTheDocument()
    })

    it('renders build hash as a link to GitHub', async () => {
        render(<MainMenu />)
        await userEvent.click(screen.getByLabelText('Open main menu'))

        const link = screen.getByRole('link', { name: /Build/ })
        expect(link).toHaveAttribute(
            'href',
            expect.stringContaining(
                'github.com/waterloo-rocketry/omnibus-DAQms/commit/'
            )
        )
        expect(link).toHaveAttribute('target', '_blank')
    })

    it('applies destructive variant to Clear item', async () => {
        render(<MainMenu />)
        await userEvent.click(screen.getByLabelText('Open main menu'))

        const clearItem = screen
            .getByText('Clear')
            .closest('[data-slot="dropdown-menu-item"]')
        expect(clearItem).toHaveAttribute('data-variant', 'destructive')
    })

    it('closes menu on Escape', async () => {
        render(<MainMenu />)
        await userEvent.click(screen.getByLabelText('Open main menu'))
        expect(screen.getByText('Add Item')).toBeInTheDocument()

        await userEvent.keyboard('{Escape}')

        await waitFor(() => {
            expect(screen.queryByText('Add Item')).not.toBeInTheDocument()
        })
    })

    it('Add Item opens the Add Data dialog', async () => {
        render(<MainMenu />)
        await userEvent.click(screen.getByLabelText('Open main menu'))
        await userEvent.click(screen.getByText('Add Item'))

        await waitFor(() => {
            expect(screen.getByText('Add Data')).toBeInTheDocument()
        })
    })

    it('Edit Dashboard opens the Edit Dashboard dialog', async () => {
        render(<MainMenu />)
        await userEvent.click(screen.getByLabelText('Open main menu'))
        await userEvent.click(screen.getByText('Edit Dashboard'))

        await waitFor(() => {
            expect(
                screen.getByText('Edit Dashboard', {
                    selector: '[data-slot="dialog-title"]',
                })
            ).toBeInTheDocument()
        })
    })

    it('Clear is clickable without errors', async () => {
        render(<MainMenu />)
        await userEvent.click(screen.getByLabelText('Open main menu'))
        await userEvent.click(screen.getByText('Clear'))
    })

    it('reflects error connection status', () => {
        mockUseOmnibusContext.mockReturnValue({
            connectionStatus: 'error',
            error: 'Connection failed',
            serverUrl: 'http://localhost:6767',
            setServerUrl: vi.fn(),
        })
        render(<MainMenu />)
        expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('reflects disconnected connection status', () => {
        mockUseOmnibusContext.mockReturnValue({
            connectionStatus: 'disconnected',
            error: null,
            serverUrl: 'http://localhost:6767',
            setServerUrl: vi.fn(),
        })
        render(<MainMenu />)
        expect(screen.getByText('Disconnected')).toBeInTheDocument()
    })

    it('reflects connecting status', () => {
        mockUseOmnibusContext.mockReturnValue({
            connectionStatus: 'connecting',
            error: null,
            serverUrl: 'http://localhost:6767',
            setServerUrl: vi.fn(),
        })
        render(<MainMenu />)
        expect(screen.getByText('Connecting')).toBeInTheDocument()
    })

    it('shows copyright in footer', async () => {
        render(<MainMenu />)
        await userEvent.click(screen.getByLabelText('Open main menu'))

        expect(screen.getByText(/Waterloo Rocketry/)).toBeInTheDocument()
    })
})
