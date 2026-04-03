import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LiveDataDashboard } from '@/components/LiveDataDashboard'

describe('LiveDataDashboard', () => {
    it('renders six SensorModule cards by default', () => {
        render(<LiveDataDashboard />)
        // Each SensorModule has an "Open menu" button
        expect(screen.getAllByLabelText('Open menu')).toHaveLength(6)
    })

    it('renders default sensor titles', () => {
        render(<LiveDataDashboard />)
        expect(screen.getByText('Ox Fill (psi)')).toBeInTheDocument()
        expect(screen.getByText('Chamber Temp (°C)')).toBeInTheDocument()
        expect(screen.getByText('Tank Pressure (bar)')).toBeInTheDocument()
    })
})
