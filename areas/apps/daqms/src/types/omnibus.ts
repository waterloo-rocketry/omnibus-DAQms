/**
 * TypeScript type definitions for Omnibus DAQms app
 *
 * DAQ message types (DAQMessage, ConnectionStatus, etc.) are now provided
 * by @waterloorocketry/omnibus-ts
 */

/**
 * Data point format (timestamp + value)
 */
export interface DataPoint {
    timestamp: number // Unix timestamp in milliseconds
    value: number
}
