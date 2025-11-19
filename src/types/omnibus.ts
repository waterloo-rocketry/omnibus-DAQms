import type { DAQMessage } from '@waterloorocketry/omnibus-ts/dist/types/data/daqMessage'
import type { Message } from '@waterloorocketry/omnibus-ts/dist/types/message'

export type { DAQMessage }
export type OmnibusMessage = Message<DAQMessage>

/**
 * Data point format (timestamp + value)
 */
export interface DataPoint {
    timestamp: number // Unix timestamp in milliseconds (converted from backend seconds)
    value: number
}

/**
 * Connection status states
 */
export type ConnectionStatus =
    | 'connecting'
    | 'connected'
    | 'disconnected'
    | 'error'
