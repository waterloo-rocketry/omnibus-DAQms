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

describe('LiveDataDashboard — small number module pairing', () => {
    beforeEach(() => {
        useDashboardStore.setState({ graphConfigs: [], addDataOpen: false })
    })

    it('renders two adjacent Number modules inside a single pair container', () => {
        useDashboardStore.getState().addGraphs([
            {
                channelName: 'Ch1',
                title: 'Tank Heat',
                titleColor: 'text-foreground',
                offset: 0,
                graphType: 'Number',
                displayedHistory: '30s',
            },
            {
                channelName: 'Ch2',
                title: 'Valve State',
                titleColor: 'text-foreground',
                offset: 0,
                graphType: 'Number',
                displayedHistory: '30s',
            },
        ])
        const { getAllByTestId } = render(<LiveDataDashboard />)
        expect(getAllByTestId('small-module-pair')).toHaveLength(1)
        expect(screen.getByText('Tank Heat')).toBeInTheDocument()
        expect(screen.getByText('Valve State')).toBeInTheDocument()
    })

    it('does not pair a lone Number module surrounded by Graph modules', () => {
        useDashboardStore.getState().addGraphs([
            {
                channelName: 'Ch1',
                title: 'Ox Fill',
                titleColor: 'text-foreground',
                offset: 0,
                graphType: 'Graph',
                displayedHistory: '30s',
            },
            {
                channelName: 'Ch2',
                title: 'Tank Heat',
                titleColor: 'text-foreground',
                offset: 0,
                graphType: 'Number',
                displayedHistory: '30s',
            },
            {
                channelName: 'Ch3',
                title: 'Chamber Temp',
                titleColor: 'text-foreground',
                offset: 0,
                graphType: 'Graph',
                displayedHistory: '30s',
            },
        ])
        const { queryAllByTestId } = render(<LiveDataDashboard />)
        expect(queryAllByTestId('small-module-pair')).toHaveLength(0)
    })

    it('pairs the first two Number modules but leaves an odd third unpaired', () => {
        useDashboardStore.getState().addGraphs(
            ['A', 'B', 'C'].map((t, i) => ({
                channelName: `Ch${i}`,
                title: t,
                titleColor: 'text-foreground',
                offset: 0,
                graphType: 'Number',
                displayedHistory: '30s',
            }))
        )
        const { getAllByTestId } = render(<LiveDataDashboard />)
        expect(getAllByTestId('small-module-pair')).toHaveLength(1)
        // C is rendered as a lone module
        expect(screen.getByText('C')).toBeInTheDocument()
    })

    it('creates three pairs from six adjacent Number modules', () => {
        useDashboardStore.getState().addGraphs(
            ['A', 'B', 'C', 'D', 'E', 'F'].map((t, i) => ({
                channelName: `Ch${i}`,
                title: t,
                titleColor: 'text-foreground',
                offset: 0,
                graphType: 'Number',
                displayedHistory: '30s',
            }))
        )
        const { getAllByTestId } = render(<LiveDataDashboard />)
        expect(getAllByTestId('small-module-pair')).toHaveLength(3)
    })

    it('breaks a Number run when a Graph module is in between', () => {
        useDashboardStore.getState().addGraphs([
            {
                channelName: 'Ch1',
                title: 'A',
                titleColor: 'text-foreground',
                offset: 0,
                graphType: 'Number',
                displayedHistory: '30s',
            },
            {
                channelName: 'Ch2',
                title: 'B',
                titleColor: 'text-foreground',
                offset: 0,
                graphType: 'Graph',
                displayedHistory: '30s',
            },
            {
                channelName: 'Ch3',
                title: 'C',
                titleColor: 'text-foreground',
                offset: 0,
                graphType: 'Number',
                displayedHistory: '30s',
            },
        ])
        const { queryAllByTestId } = render(<LiveDataDashboard />)
        // A and C are separated by B so neither gets paired
        expect(queryAllByTestId('small-module-pair')).toHaveLength(0)
    })
})
