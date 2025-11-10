import React, { useEffect, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import type { OmnibusMessage, ConnectionStatus } from '../types/omnibus'
import { useOmnibusStore } from '../store/omnibusStore'

import { OmnibusContext } from '../context/OmnibusContext'
import type { OmnibusContextValue } from '../context/OmnibusContext.ts'

/**
 * Configuration
 */
const SOCKET_URL = 'http://localhost:8081'

/**
 * Omnibus Provider Component
 */
const OmnibusProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    console.log('[Omnibus] Provider rendering')

    const [connectionStatus, setConnectionStatus] =
        useState<ConnectionStatus>('connecting')
    const [error, setError] = useState<string | null>(null)

    const parseMessage = useCallback((msg: OmnibusMessage) => {
        console.log('[Omnibus] parseMessage called')
        const {
            data,
            relative_timestamps_nanoseconds,
            timestamp: baseTimestamp,
        } = msg.payload

        // Collect latest values with timestamps for all sensors in this message
        const updates: Record<string, { value: number; timestamp: number }> = {}

        Object.entries(data).forEach(([sensorName, values]) => {
            // Take the last value from the array as the latest
            const latestValue = values[values.length - 1]

            // Calculate the precise timestamp for this sample
            // Base timestamp (seconds) + relative offset (nanoseconds) → milliseconds
            const latestTimestamp =
                baseTimestamp * 1000 +
                relative_timestamps_nanoseconds[values.length - 1] / 1_000_000

            updates[sensorName] = {
                value: latestValue,
                timestamp: latestTimestamp,
            }
        })

        // Single batch update to Zustand store
        useOmnibusStore.getState().updateChannels(updates)
    }, [])

    // Debug: Track when parseMessage changes
    useEffect(() => {
        console.log('[Omnibus] parseMessage function changed!')
    }, [parseMessage])

    useEffect(() => {
        console.log('[Omnibus] useEffect running - creating socket')

        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
        })

        newSocket.on('connect', () => {
            console.log('[Omnibus] Connected to backend')
            setConnectionStatus('connected')
            setError(null)
        })

        newSocket.on('disconnect', (reason) => {
            console.log('[Omnibus] Disconnected:', reason)
            setConnectionStatus('disconnected')
        })

        newSocket.on('connect_error', (err) => {
            console.error('[Omnibus] Connection error:', err.message)
            setConnectionStatus('error')
            setError(err.message)
        })

        newSocket.on('message', (msg: OmnibusMessage) => {
            parseMessage(msg)
        })

        return () => {
            console.log('[Omnibus] useEffect cleanup - disconnecting socket')
            console.trace('[Omnibus] Cleanup stack trace')
            newSocket.close()
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
