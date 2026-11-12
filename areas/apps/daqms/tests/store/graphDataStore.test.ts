import { describe, it, expect, beforeEach } from 'vitest'
import { useGraphDataStore } from '@/store/graphDataStore'

describe('graphDataStore — removeData', () => {
    beforeEach(() => {
        useGraphDataStore.setState({ data: {} })
    })

    it('removes the data for the given id', () => {
        useGraphDataStore.setState({
            data: { a: [{ timestamp: 1, value: 10 }] },
        })

        useGraphDataStore.getState().removeData('a')

        expect(useGraphDataStore.getState().data).not.toHaveProperty('a')
    })

    it('leaves other ids untouched', () => {
        const bData = [{ timestamp: 1, value: 20 }]
        useGraphDataStore.setState({
            data: { a: [{ timestamp: 1, value: 10 }], b: bData },
        })

        useGraphDataStore.getState().removeData('a')

        const { data } = useGraphDataStore.getState()
        expect(data).not.toHaveProperty('a')
        expect(data.b).toBe(bData)
    })

    it('does nothing when the id does not exist', () => {
        useGraphDataStore.setState({
            data: { a: [{ timestamp: 1, value: 10 }] },
        })

        useGraphDataStore.getState().removeData('missing')

        expect(Object.keys(useGraphDataStore.getState().data)).toEqual(['a'])
    })

    it('does not mutate the previous data object', () => {
        const prev = { a: [{ timestamp: 1, value: 10 }] }
        useGraphDataStore.setState({ data: prev })

        useGraphDataStore.getState().removeData('a')

        // The previous reference is preserved (immutable update)
        expect(prev).toHaveProperty('a')
        expect(useGraphDataStore.getState().data).not.toBe(prev)
    })
})
