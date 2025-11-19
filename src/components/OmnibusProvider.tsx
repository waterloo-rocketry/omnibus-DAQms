import React, { useEffect, useState, useCallback, useRef } from 'react'
import { communicator } from '@waterloorocketry/omnibus-ts'
import type { ConnectionStatus } from '../types/omnibus'
import { useLastDatapointStore } from '../store/omnibusStore'

import { OmnibusContext } from '../context/OmnibusContext'
import type { OmnibusContextValue } from '../context/OmnibusContext.ts'

const SOCKET_URL = 'http://localhost:8081'

const OmnibusProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [connectionStatus, setConnectionStatus] =
        useState<ConnectionStatus>('connecting')
    const [error, setError] = useState<string | null>(null)
    const communicatorRef = useRef<ReturnType<typeof communicator> | null>(
        null,
    )

    const onReceiveDAQ = useCallback((msg: { channel: string; timestamp: number; payload: any }) => {
        console.log('[DEBUG] Message received:', msg)
        const payload = msg.payload

        if (!payload.data || !payload.relativeTimestamps) {
            console.warn('[DEBUG] Early return - missing fields:', {
                hasData: !!payload.data,
                hasRelativeTimestamps: !!payload.relativeTimestamps,
                payloadKeys: Object.keys(payload)
            })
            return
        }

        const { data, relativeTimestamps, timestamp: baseTimestamp } = payload
        const updates: Record<string, { value: number; timestamp: number }> = {}

        Object.entries(data).forEach(([sensorName, values]) => {
            if (!Array.isArray(values) || values.length === 0) return

            const latestValue = values[values.length - 1] as number
            const latestTimestamp =
                baseTimestamp * 1000 +
                (relativeTimestamps[values.length - 1] as number) / 1_000_000

            updates[sensorName] = {
                value: latestValue,
                timestamp: latestTimestamp,
            }
        })

        console.log('[DEBUG] Updating store with:', Object.keys(updates))
        useLastDatapointStore.getState().updateMultipleSeries(updates)
    }, [])

    useEffect(() => {
        const omnibusCommunicator = communicator({
            serverURL: SOCKET_URL,
            allowExposeSocket: true,
        })

        communicatorRef.current = omnibusCommunicator

        if (omnibusCommunicator.socket) {
            omnibusCommunicator.socket.on('connect', () => {
                setConnectionStatus('connected')
                setError(null)
            })

            omnibusCommunicator.socket.on('disconnect', () => {
                setConnectionStatus('disconnected')
            })

            omnibusCommunicator.socket.on('connect_error', (err) => {
                setConnectionStatus('error')
                setError(err.message)
            })
        }

        omnibusCommunicator.receiver.receiveAll(onReceiveDAQ)

        return () => {
            omnibusCommunicator.disconnect()
        }
    }, [onReceiveDAQ])

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
