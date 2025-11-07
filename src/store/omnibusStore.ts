import { create } from 'zustand';

/**
 * Data point with timestamp from backend
 */
export interface LatestDataPoint {
  value: number;
  timestamp: number; // Unix timestamp in milliseconds (from backend)
}

/**
 * Zustand store for Omnibus sensor data
 * Stores ONLY the latest value + timestamp per channel (not history)
 */
interface OmnibusStore {
  // Latest sensor values with timestamps: { "Fake0": { value: 25.3, timestamp: 1699... }, ... }
  channels: Record<string, LatestDataPoint>;

  // Update a single channel
  updateChannel: (channelName: string, dataPoint: LatestDataPoint) => void;

  // Update multiple channels at once (for batching)
  updateChannels: (updates: Record<string, LatestDataPoint>) => void;
}

export const useOmnibusStore = create<OmnibusStore>((set) => ({
  channels: {},

  updateChannel: (channelName, dataPoint) =>
    set((state) => ({
      channels: { ...state.channels, [channelName]: dataPoint }
    })),

  updateChannels: (updates) =>
    set((state) => ({
      channels: { ...state.channels, ...updates }
    })),
}));
