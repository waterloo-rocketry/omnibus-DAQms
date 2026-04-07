import type { GraphConfig } from './types'

// Function to add plots to dashboard
export const addPlot = (
    newPlot: GraphConfig,
    currentPlots: GraphConfig[]
): GraphConfig[] => {
    return [...currentPlots, newPlot]
}

// Function to remove plots from dashboard
export const removePlot = (
    plotId: string,
    currentPlots: GraphConfig[]
): GraphConfig[] => {
    return currentPlots.filter((plot) => plot.id !== plotId)
}

export function createGraphConfig(
    config: Omit<GraphConfig, 'id'>
): GraphConfig {
    return { ...config, id: crypto.randomUUID() }
}
