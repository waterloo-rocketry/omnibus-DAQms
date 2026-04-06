import { create } from 'zustand'
import type {
    GraphConfig,
    GraphConfigEditable,
} from '@/components/LiveDataDashboard/types'
import { createGraphConfig } from '@/components/LiveDataDashboard/utils'

export const DEFAULT_TITLE_COLOR = 'text-foreground'

interface DashboardStore {
    graphConfigs: GraphConfig[]
    addDataOpen: boolean
    setAddDataOpen: (open: boolean) => void
    addGraphs: (configs: Omit<GraphConfig, 'id'>[]) => void
    deleteGraph: (id: string) => void
    editGraphProps: (
        index: number,
        changes: Partial<GraphConfigEditable>
    ) => void
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

    editGraphProps: (index, changes) =>
        set((state) => {
            const updated = [...state.graphConfigs]
            updated[index] = { ...updated[index], ...changes }
            return { graphConfigs: updated }
        }),
}))
