import type { ParsleyMessage } from '@waterloorocketry/omnibus-ts'
import type { LatestDataPoint } from '@/store/omnibusStore'

interface ParsleyAnalogPayload {
    time: number
    value: number
}

export interface ParsedParsleySeriesUpdate {
    seriesName: string
    dataPoint: LatestDataPoint
}

function isParsleyAnalogPayload(data: unknown): data is ParsleyAnalogPayload {
    return (
        typeof data === 'object' &&
        data !== null &&
        'time' in data &&
        typeof data.time === 'number' &&
        'value' in data &&
        typeof data.value === 'number'
    )
}

export function parseParsleyAnalogMessage(msg: {
    timestamp: number
    payload: ParsleyMessage
}): ParsedParsleySeriesUpdate | null {
    const { payload } = msg

    if (
        payload.boardTypeId !== 'INJECTOR' ||
        payload.msgType !== 'SENSOR_ANALOG16' ||
        !isParsleyAnalogPayload(payload.data)
    ) {
        return null
    }

    return {
        seriesName: `${payload.boardTypeId}/${payload.boardInstId}/${payload.msgType}/${payload.msgMetadata}/value`,
        dataPoint: {
            value: payload.data.value,
            timestamp: msg.timestamp * 1000,
            type: 'CAN/Parsley',
        },
    }
}
