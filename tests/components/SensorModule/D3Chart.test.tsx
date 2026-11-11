import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import D3Chart from '@/components/SensorModule/D3Chart'
import type { DataPoint } from '@/types/omnibus'

const sampleData: DataPoint[] = [
    { timestamp: 1000, value: 1 },
    { timestamp: 2000, value: 2 },
]

describe('D3Chart', () => {
    it('renders a data path and updates its x coordinates for the selected window', () => {
        const { container, rerender } = render(
            <D3Chart data={sampleData} timeWindowSeconds={10} />
        )
        const path = container.querySelector('path')
        const initialPath = path?.getAttribute('d')

        expect(initialPath).toBeTruthy()

        rerender(<D3Chart data={sampleData} timeWindowSeconds={20} />)

        expect(path?.getAttribute('d')).not.toBe(initialPath)
    })

    it('restarts the belt animation when the data changes but its path string stays the same', () => {
        let frameId = 0
        const requestAnimationFrameMock = vi.fn(
            (_callback: FrameRequestCallback) => ++frameId
        )
        const cancelAnimationFrameMock = vi.fn()
        vi.stubGlobal('requestAnimationFrame', requestAnimationFrameMock)
        vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrameMock)

        const { rerender, unmount } = render(
            <D3Chart data={sampleData} timeWindowSeconds={10} />
        )

        try {
            rerender(
                <D3Chart
                    data={sampleData.map((point) => ({ ...point }))}
                    timeWindowSeconds={10}
                />
            )

            expect(requestAnimationFrameMock).toHaveBeenCalledTimes(2)
            expect(cancelAnimationFrameMock).toHaveBeenCalledWith(1)
        } finally {
            unmount()
            vi.unstubAllGlobals()
        }
    })
})
