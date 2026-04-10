import React from 'react'
import { vi } from 'vitest'
import { render } from '@testing-library/react'
import { OmnibusContext } from '@/context/OmnibusContext'
import type { OmnibusContextValue } from '@/context/OmnibusContext'

export const connectedFixture: OmnibusContextValue = {
    connectionStatus: 'connected',
    error: null,
    serverUrl: 'http://localhost:6767',
    setServerUrl: vi.fn(),
}

export const disconnectedFixture: OmnibusContextValue = {
    connectionStatus: 'disconnected',
    error: null,
    serverUrl: 'http://localhost:6767',
    setServerUrl: vi.fn(),
}

export const errorFixture: OmnibusContextValue = {
    connectionStatus: 'error',
    error: 'Connection failed',
    serverUrl: 'http://localhost:6767',
    setServerUrl: vi.fn(),
}

export const connectingFixture: OmnibusContextValue = {
    connectionStatus: 'connecting',
    error: null,
    serverUrl: 'http://localhost:6767',
    setServerUrl: vi.fn(),
}

export function renderWithOmnibus(
    ui: React.ReactElement,
    context: Partial<OmnibusContextValue> = {}
) {
    const value = { ...connectedFixture, ...context }
    return render(
        <OmnibusContext.Provider value={value}>{ui}</OmnibusContext.Provider>
    )
}
