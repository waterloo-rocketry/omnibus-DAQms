import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import type { ParsleyMessage } from '@waterloorocketry/omnibus-ts'
import OmnibusProvider from '@/components/OmnibusProvider'
import { parseParsleyAnalogMessage } from '@/lib/parsley'
import { useLastDatapointStore } from '@/store/omnibusStore'

const mocks = vi.hoisted(() => ({
    callbacks: new Map<string, (message: unknown) => void>(),
    unsubscribeConnection: vi.fn(),
    unsubscribeDaq: vi.fn(),
    unsubscribeParsley: vi.fn(),
    disconnect: vi.fn(),
}))

vi.mock('@waterloorocketry/omnibus-ts', () => ({
    communicator: vi.fn(() => ({
        connection: {
            onConnectionChange: vi.fn(() => mocks.unsubscribeConnection),
        },
        receiver: {
            receive: vi.fn(
                (channel: string, callback: (message: unknown) => void) => {
                    mocks.callbacks.set(channel, callback)
                    return (
                        channel === 'DAQ' ?
                            mocks.unsubscribeDaq
                        :   mocks.unsubscribeParsley
                    )
                }
            ),
        },
        disconnect: mocks.disconnect,
    })),
}))

function makeParsleyMessage(
    overrides: Partial<ParsleyMessage> = {}
): { timestamp: number; payload: ParsleyMessage } {
    return {
        timestamp: 123.456,
        payload: {
            boardTypeId: 'INJECTOR',
            boardInstId: 'injector-2',
            msgPrio: 'MEDIUM',
            msgType: 'SENSOR_ANALOG16',
            data: { time: 99, value: 42.5 },
            parsley: 'parsley-1',
            messageFormatVersion: 2,
            ...overrides,
        },
    }
}

describe('parseParsleyAnalogMessage', () => {
    it('flattens an injector analog message using its Omnibus timestamp', () => {
        expect(parseParsleyAnalogMessage(makeParsleyMessage())).toEqual({
            seriesName: 'INJECTOR/injector-2/SENSOR_ANALOG16',
            dataPoint: {
                value: 42.5,
                timestamp: 123456,
                type: 'CAN/Parsley',
            },
        })
    })

    it.each([
        { boardTypeId: 'AVIONICS' },
        { msgType: 'SENSOR_DIGITAL16' },
        { data: null },
        { data: { time: 99, value: '42.5' } },
    ])('ignores unsupported or invalid messages: %o', (overrides) => {
        expect(
            parseParsleyAnalogMessage(makeParsleyMessage(overrides))
        ).toBeNull()
    })
})

describe('OmnibusProvider', () => {
    beforeEach(() => {
        mocks.callbacks.clear()
        vi.clearAllMocks()
        useLastDatapointStore.setState({ series: {} })
    })

    it('subscribes to Parsley messages and removes both receivers on cleanup', () => {
        const { unmount } = render(
            <OmnibusProvider>
                <div />
            </OmnibusProvider>
        )

        mocks.callbacks.get('CAN/Parsley')?.(makeParsleyMessage())

        expect(useLastDatapointStore.getState().series).toEqual({
            'INJECTOR/injector-2/SENSOR_ANALOG16': {
                value: 42.5,
                timestamp: 123456,
                type: 'CAN/Parsley',
            },
        })

        unmount()

        expect(mocks.unsubscribeDaq).toHaveBeenCalledOnce()
        expect(mocks.unsubscribeParsley).toHaveBeenCalledOnce()
    })
})
