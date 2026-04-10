import { createContext } from 'react'

import type { ConnectionStatus } from '@waterloorocketry/omnibus-ts'

/**
 * Context value interface
 */
export interface OmnibusContextValue {
    connectionStatus: ConnectionStatus
    error: string | null
    serverUrl: string
    setServerUrl: (url: string) => void
}

export const OmnibusContext = createContext<OmnibusContextValue | undefined>(
    undefined
)
