import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GraphConfig, GraphConfigEditable } from './types'
import { createGraphConfig } from './utils'
import { useGraphDataStore } from '@/store/graphDataStore'

export const DASHBOARD_STORAGE_KEY = 'omnibus-dashboard'
export const DEFAULT_TITLE_COLOR = 'text-foreground'

interface DashboardStore {
    graphConfigs: GraphConfig[]
    addDataOpen: boolean
    setAddDataOpen: (open: boolean) => void
    addGraphs: (configs: Omit<GraphConfig, 'id'>[]) => void
    setGraphConfigs: (configs: GraphConfig[]) => void
    deleteGraph: (id: string) => void
    editGraphProps: (id: string, changes: Partial<GraphConfigEditable>) => void
    clearDashboard: () => void
    setZeroPointAll: () => void
}

export const useDashboardStore = create<DashboardStore>()(
    persist(
        (set) => ({
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

            setGraphConfigs: (configs) => set({ graphConfigs: configs }),

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

            clearDashboard: () => {
                set({ graphConfigs: [] })
                useDashboardStore.persist.clearStorage()
            },

            setZeroPointAll: () => {
                const graphData = useGraphDataStore.getState().data
                set((state) => ({
                    graphConfigs: state.graphConfigs.map((config) => {
                        const data = graphData[config.id] ?? []
                        if (data.length === 0) return config
                        const values = data.map((d) => d.value)
                        const avg =
                            values.reduce((a, b) => a + b, 0) / values.length
                        return {
                            ...config,
                            offset: parseFloat((-avg).toFixed(2)),
                        }
                    }),
                }))
            },
        }),
        {
            name: DASHBOARD_STORAGE_KEY,
            // Only persist layout data; addDataOpen is transient UI state
            partialize: (state) => ({ graphConfigs: state.graphConfigs }),
        }
    )
)
