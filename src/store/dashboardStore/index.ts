import { create } from 'zustand'
import type {
    GraphConfig,
    GraphConfigEditable,
} from './types'
import { createGraphConfig } from './utils'

export const DEFAULT_TITLE_COLOR = 'text-foreground'

interface DashboardStore {
    graphConfigs: GraphConfig[]
    addDataOpen: boolean
    setAddDataOpen: (open: boolean) => void
    addGraphs: (configs: Omit<GraphConfig, 'id'>[]) => void
    deleteGraph: (id: string) => void
    editGraphProps: (id: string, changes: Partial<GraphConfigEditable>) => void
}

export const useDashboardStore = create<DashboardStore>()((set) => ({
    graphConfigs: [],
    addDataOpen: false,
    setAddDataOpen: (open) => set({ addDataOpen: open }),

    addGraphs: (configs) =>
        set((state) => ({
            graphConfigs: [
                ...state.graphConfigs,
                ...configs.map(createGraphConfig),
            ],
        })),

    deleteGraph: (id) =>
        set((state) => ({
            graphConfigs: state.graphConfigs.filter((c) => c.id !== id),
        })),

    editGraphProps: (id, changes) =>
        set((state) => {
            const i = state.graphConfigs.findIndex((g) => g.id === id)
            if (i === -1) return state
            const updated = [...state.graphConfigs]
            updated[i] = { ...updated[i], ...changes }
            return { graphConfigs: updated }
        }),
}))
