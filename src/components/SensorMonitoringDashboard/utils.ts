import type { SensorPlot } from "./types";

// Function to add plots to dashboard
export const addPlot = (newPlot: SensorPlot, currentPlots: SensorPlot[]): SensorPlot[] => {
    return [...currentPlots, newPlot];
}

// Function to remove plots from dashboard
export const removePlot = (plotName: string, currentPlots: SensorPlot[]): SensorPlot[] => {
    return currentPlots.filter(plot => plot.name !== plotName);
}
