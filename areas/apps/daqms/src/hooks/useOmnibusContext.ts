import { useContext } from 'react'
import { OmnibusContext } from '../context/OmnibusContext'
import type { OmnibusContextValue } from '../context/OmnibusContext'

/**
 * Custom hook to consume Omnibus context
 */
export const useOmnibusContext = (): OmnibusContextValue => {
    const context = useContext(OmnibusContext)
    if (context === undefined) {
        throw new Error(
            'useOmnibusContext must be used within an OmnibusProvider'
        )
    }
    return context
}
