import { create } from 'zustand'
import type { DataPoint } from '@/types/omnibus'

interface GraphDataStore {
    data: Record<string, DataPoint[]>
    setData: (id: string, points: DataPoint[]) => void
    removeData: (id: string) => void
}

export const useGraphDataStore = create<GraphDataStore>()((set) => ({
    data: {},

    setData: (id, points) =>
        set((state) => ({ data: { ...state.data, [id]: points } })),

    removeData: (id) =>
        set((state) => {
            const next = { ...state.data }
            delete next[id]
            return { data: next }
        }),
}))
