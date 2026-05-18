import { describe, it, expect, beforeEach } from 'vitest'
import {
    useDashboardStore,
    DASHBOARD_STORAGE_KEY,
} from '@/store/dashboardStore'
import { createGraphConfig } from '@/store/dashboardStore/utils'

function getSavedState(): { graphConfigs: unknown[] } | null {
    const raw = localStorage.getItem(DASHBOARD_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw).state as { graphConfigs: unknown[] }
}

const baseConfig = {
    channelName: 'Ch1',
    title: 'Ox Fill',
    titleColor: 'text-foreground' as const,
    offset: 0,
    graphType: 'Graph',
    displayedHistory: '30s',
}

describe('dashboard store — localStorage persistence', () => {
    beforeEach(() => {
        useDashboardStore.setState({ graphConfigs: [] })
        localStorage.clear()
    })

    it('saves graphConfigs to localStorage when a graph is added', () => {
        useDashboardStore.getState().addGraphs([baseConfig])

        const saved = getSavedState()
        expect(saved).not.toBeNull()
        expect(saved!.graphConfigs).toHaveLength(1)
        expect(saved!.graphConfigs[0]).toMatchObject({
            channelName: 'Ch1',
            title: 'Ox Fill',
        })
    })

    it('updates localStorage when a graph is deleted', () => {
        const config = createGraphConfig(baseConfig)
        useDashboardStore.setState({ graphConfigs: [config] })

        useDashboardStore.getState().deleteGraph(config.id)

        expect(getSavedState()!.graphConfigs).toHaveLength(0)
    })

    it('updates localStorage when a graph is edited', () => {
        const config = createGraphConfig({ ...baseConfig, title: 'Original' })
        useDashboardStore.setState({ graphConfigs: [config] })

        useDashboardStore.getState().editGraphProps(config.id, {
            title: 'Updated',
        })

        expect(getSavedState()!.graphConfigs[0]).toMatchObject({
            title: 'Updated',
        })
    })

    it('preserves all GraphConfig fields in localStorage', () => {
        const config = createGraphConfig({
            channelName: 'Pressure1',
            title: 'Chamber Pressure',
            titleColor: 'text-blue-500',
            offset: 3.5,
            graphType: 'Number',
            displayedHistory: '5min',
        })
        useDashboardStore.setState({ graphConfigs: [config] })

        const saved = getSavedState()!.graphConfigs[0] as Record<string, unknown>
        expect(saved.channelName).toBe('Pressure1')
        expect(saved.title).toBe('Chamber Pressure')
        expect(saved.titleColor).toBe('text-blue-500')
        expect(saved.offset).toBe(3.5)
        expect(saved.graphType).toBe('Number')
        expect(saved.displayedHistory).toBe('5min')
        expect(saved.id).toBeDefined()
    })

    it('does not persist addDataOpen to localStorage', () => {
        useDashboardStore.getState().setAddDataOpen(true)

        const raw = localStorage.getItem(DASHBOARD_STORAGE_KEY)
        if (raw) {
            const parsed = JSON.parse(raw).state as Record<string, unknown>
            expect(parsed.addDataOpen).toBeUndefined()
        }
    })

    it('clearDashboard empties graphConfigs in the store', () => {
        useDashboardStore.getState().addGraphs([baseConfig])
        useDashboardStore.getState().clearDashboard()

        expect(useDashboardStore.getState().graphConfigs).toHaveLength(0)
    })

    it('clearDashboard removes the localStorage key entirely', () => {
        useDashboardStore.getState().addGraphs([baseConfig])
        useDashboardStore.getState().clearDashboard()

        expect(localStorage.getItem(DASHBOARD_STORAGE_KEY)).toBeNull()
    })
})
