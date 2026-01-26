import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

/**
 * Data point with timestamp from backend
 */
export interface LatestDataPoint {
    value: number
    timestamp: number // Unix timestamp in milliseconds (from backend)
}

/**
 * Zustand store for Omnibus sensor data
 * Stores ONLY the latest value + timestamp per series (not history)
 */
interface OmnibusStore {
    series: Record<string, LatestDataPoint>
    updateSeries: (seriesName: string, dataPoint: LatestDataPoint) => void
    updateMultipleSeries: (updates: Record<string, LatestDataPoint>) => void
}

export const useLastDatapointStore = create<OmnibusStore>()(
    subscribeWithSelector((set) => ({
        series: {},

        updateSeries: (seriesName, dataPoint) =>
            set((state) => ({
                series: { ...state.series, [seriesName]: dataPoint },
            })),

        updateMultipleSeries: (updates) =>
            set((state) => ({
                series: { ...state.series, ...updates },
            })),
    })),
)
