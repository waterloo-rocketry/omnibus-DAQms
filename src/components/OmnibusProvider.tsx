import React, { useEffect, useState, useCallback, useRef } from 'react'
import { communicator } from '@waterloorocketry/omnibus-ts'
import type { DAQMessage, ConnectionStatus } from '@waterloorocketry/omnibus-ts'
import { useLastDatapointStore } from '../store/omnibusStore'

import { OmnibusContext } from '../context/OmnibusContext'
import type { OmnibusContextValue } from '../context/OmnibusContext.ts'

/**
 * Configuration
 */
const SOCKET_URL = 'http://localhost:8081'

/**
 * Omnibus Provider Component
 *
 * Uses @waterloorocketry/omnibus-ts communicator() to receive typed DAQ messages
 * with Zod validation and automatic snake_case to camelCase conversion.
 */
const OmnibusProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [connectionStatus, setConnectionStatus] =
        useState<ConnectionStatus>('connecting')
    const [error, setError] = useState<string | null>(null)

    const commRef = useRef<ReturnType<typeof communicator> | null>(null)

    const parseMessage = useCallback(
        (msg: { channel: string; timestamp: number; payload: DAQMessage }) => {
            const { data, timestamp: baseTimestamp } = msg.payload

            // Collect averaged values with message-level timestamp (seconds → ms) for all sensors
            const updates: Record<string, { value: number; timestamp: number }> =
                {}

            // Cast entries to the expected type since omnibus-ts Zod v4 inference
            // does not fully resolve Record<string, number[]> through Object.entries
            const dataEntries = Object.entries(data) as [string, number[]][]

            dataEntries.forEach(([sensorName, values]) => {
                if (values.length === 0) return

                // Average all samples in this message
                const averageValue = values.reduce((sum, v) => sum + v, 0) / values.length

                // Use the message-level timestamp (seconds → milliseconds)
                const timestamp = baseTimestamp * 1000

                updates[sensorName] = {
                    value: averageValue,
                    timestamp,
                }
            })

            // Single batch update to Zustand store
            useLastDatapointStore.getState().updateMultipleSeries(updates)
        },
        []
    )

    useEffect(() => {
        const comm = communicator({
            serverURL: SOCKET_URL,
        })
        commRef.current = comm

        // Subscribe to connection status changes
        const unsubConnection = comm.connection.onConnectionChange(
            (status, error) => {
                setConnectionStatus(status)
                if (error) {
                    setError(error.message)
                } else {
                    setError(null)
                }
            }
        )

        // Use receive('DAQ', ...) to handle typed DAQ messages with Zod validation
        const unsubReceive = comm.receiver.receive<DAQMessage>(
            'DAQ',
            parseMessage
        )

        return () => {
            unsubConnection()
            unsubReceive()
            comm.disconnect()
            commRef.current = null
        }
    }, [parseMessage])

    const value: OmnibusContextValue = {
        connectionStatus,
        error,
    }

    return (
        <OmnibusContext.Provider value={value}>
            {children}
        </OmnibusContext.Provider>
    )
}

export default OmnibusProvider
