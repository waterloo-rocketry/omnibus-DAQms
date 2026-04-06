import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LiveDataDashboard } from '@/components/LiveDataDashboard'
import { useDashboardStore } from '@/store/dashboardStore'

describe('LiveDataDashboard', () => {
    beforeEach(() => {
        useDashboardStore.setState({ graphConfigs: [], addDataOpen: false })
    })

    it('shows welcome message when dashboard is empty', () => {
        render(<LiveDataDashboard />)
        expect(screen.getByText('Welcome to DAQms')).toBeInTheDocument()
        expect(screen.getByText(/Add data channels/)).toBeInTheDocument()
    })

    it('shows Add Item button in empty state', () => {
        render(<LiveDataDashboard />)
        expect(
            screen.getByRole('button', { name: /Add Item/ })
        ).toBeInTheDocument()
    })

    it('Add Item button opens the Add Data dialog', async () => {
        render(<LiveDataDashboard />)
        await userEvent.click(screen.getByRole('button', { name: /Add Item/ }))
        expect(useDashboardStore.getState().addDataOpen).toBe(true)
    })

    it('renders SensorModules for each graph config', () => {
        useDashboardStore.getState().addGraphs([
            {
                channelName: 'Ch1',
                title: 'Ox Fill (psi)',
                titleColor: 'text-foreground',
                offset: 0,
                graphType: 'Graph',
                displayedHistory: '30s',
            },
            {
                channelName: 'Ch2',
                title: 'Chamber Temp (°C)',
                titleColor: 'text-foreground',
                offset: 0,
                graphType: 'Graph',
                displayedHistory: '30s',
            },
        ])
        render(<LiveDataDashboard />)
        expect(screen.getByText('Ox Fill (psi)')).toBeInTheDocument()
        expect(screen.getByText('Chamber Temp (°C)')).toBeInTheDocument()
        expect(screen.getAllByLabelText('Open menu')).toHaveLength(2)
    })
})
