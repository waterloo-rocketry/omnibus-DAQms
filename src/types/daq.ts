/**
 * TypeScript type definitions for DAQ message format
 * Matches the backend Socket.IO message structure
 */

/**
 * DAQ message payload containing sensor data
 */
export interface DAQPayload {
  timestamp: number;
  data: {
    [sensorName: string]: number[]; // e.g., "Fake0": [25 floats]
  };
  relative_timestamps_nanoseconds: number[];
  sample_rate: number;
  message_format_version: number;
}

/**
 * Complete DAQ message received from backend
 */
export interface DAQMessage {
  channel: string; // e.g., "DAQ/Fake"
  timestamp: number; // Unix timestamp in seconds (backend sends Date.now() / 1000)
  payload: DAQPayload;
}

/**
 * Chart-ready data point format
 */
export interface ChartDataPoint {
  timestamp: number; // Unix timestamp in milliseconds (converted from backend seconds)
  value: number;
}

/**
 * Connection status states
 */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Channel data map: sensor name -> array of data points
 */
export type ChannelDataMap = Map<string, ChartDataPoint[]>;
