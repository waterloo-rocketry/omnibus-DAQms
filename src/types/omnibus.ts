/**
 * TypeScript type definitions for Omnibus message format
 * Matches the backend Socket.IO message structure
 */

/**
 * Omnibus message payload containing sensor data
 */
export interface OmnibusPayload {
  timestamp: number;
  data: {
    [sensorName: string]: number[]; // e.g., "Fake0": [25 floats]
  };
  relative_timestamps_nanoseconds: number[];
  sample_rate: number;
  message_format_version: number;
}

/**
 * Complete Omnibus message received from backend
 */
export interface OmnibusMessage {
  channel: string; // e.g., "DAQ/Fake"
  timestamp: number; // Unix timestamp in seconds (backend sends Date.now() / 1000)
  payload: OmnibusPayload;
}

/**
 * Data point format (timestamp + value)
 */
export interface DataPoint {
  timestamp: number; // Unix timestamp in milliseconds (converted from backend seconds)
  value: number;
}

/**
 * Connection status states
 */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
