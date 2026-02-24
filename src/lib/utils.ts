import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { SensorPlot } from '@/types/omnibus'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function addPlot(
    plots: SensorPlot[],
    channelName: string,
    title?: string,
    unit?: string
): SensorPlot[] {
    const id = crypto.randomUUID()
    return [...plots, { id, channelName, title: title ?? channelName, unit }]
}

export function removePlot(plots: SensorPlot[], id: string): SensorPlot[] {
    return plots.filter((p) => p.id !== id)
}
