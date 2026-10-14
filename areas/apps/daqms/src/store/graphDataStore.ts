import { create } from 'zustand'
import type { DataPoint } from '@/types/omnibus'

interface GraphDataStore {
    data: Record<string, DataPoint[]>
    setData: (id: string, points: DataPoint[]) => void
    removeData: (id: string) => void
    getGraphAverage: (id: string) => number | null
    getAllGraphAverages: () => Record<string, number>
}

export const useGraphDataStore = create<GraphDataStore>()((set, get) => ({
    data: {},

    setData: (id, points) =>
        set((state) => ({ data: { ...state.data, [id]: points } })),

    removeData: (id) =>
        set((state) => {
            const next = { ...state.data }
            delete next[id]
            return { data: next }
        }),

    getGraphAverage: (id) => {
        const points = get().data[id] ?? []
        if (points.length === 0) return null
        return points.reduce((a, p) => a + p.value, 0) / points.length
    },

    getAllGraphAverages: () =>
        Object.keys(get().data).reduce<Record<string, number>>((acc, id) => {
            const avg = get().getGraphAverage(id)
            if (avg !== null) acc[id] = avg
            return acc
        }, {}),
}))
