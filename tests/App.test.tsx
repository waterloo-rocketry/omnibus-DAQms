import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../src/App'

vi.mock('@waterloorocketry/omnibus-ts', () => ({
    communicator: vi.fn(() => ({
        connection: {
            onConnectionChange: vi.fn(() => vi.fn()),
        },
        receiver: {
            receive: vi.fn(() => vi.fn()),
        },
        disconnect: vi.fn(),
    })),
}))

describe('App', () => {
    it('renders the dashboard and main menu', () => {
        render(<App />)
        expect(screen.getByLabelText('Open main menu')).toBeInTheDocument()
        expect(screen.getByText('+ Add Graph')).toBeInTheDocument()
    })
})
