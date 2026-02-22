import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { type SensorPlot } from '@/components/SensorMonitoringDashboard'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Function to add plots to dashboard
export const addPlot = (newPlot: SensorPlot, currentPlots: SensorPlot[]): SensorPlot[] => {
    return [...currentPlots, newPlot];
}

// Function to remove plots from dashboard
export const removePlot = (plotName: string, currentPlots: SensorPlot[]): SensorPlot[] => {
    return currentPlots.filter(plot => plot.name !== plotName);
}
