import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SensorMonitoringDashboard } from '@/components/SensorMonitoringDashboard/SensorMonitoringDashboard'

describe ('Sensor Monitoring Dashboard', () => {
    it ('renders 6 plots', () => {
        render(<SensorMonitoringDashboard/>);
        const graphs = screen.getAllByRole('img');
        expect(graphs).toHaveLength(6);
    })
})