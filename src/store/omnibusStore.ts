import { create } from 'zustand';

/**
 * Zustand store for Omnibus sensor data
 * Stores ONLY the latest value per channel (not history)
 */
interface OmnibusStore {
  // Latest sensor values: { "Fake0": 25.3, "Fake1": 30.1, ... }
  channels: Record<string, number>;

  // Update a single channel
  updateChannel: (channelName: string, value: number) => void;

  // Update multiple channels at once (for batching)
  updateChannels: (updates: Record<string, number>) => void;
}

export const useOmnibusStore = create<OmnibusStore>((set) => ({
  channels: {},

  updateChannel: (channelName, value) =>
    set((state) => ({
      channels: { ...state.channels, [channelName]: value }
    })),

  updateChannels: (updates) =>
    set((state) => ({
      channels: { ...state.channels, ...updates }
    })),
}));
