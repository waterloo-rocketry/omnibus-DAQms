import { createContext } from 'react'

import type { ConnectionStatus } from '../types/omnibus'

/**
 * Context value interface
 */
export interface OmnibusContextValue {
    connectionStatus: ConnectionStatus
    error: string | null
}

export const OmnibusContext = createContext<OmnibusContextValue | undefined>(
    undefined
)
