import { describe, it, expect, beforeEach } from 'vitest'
import {
    addPlot,
    removePlot,
    createGraphConfig,
} from '@/store/dashboardStore/utils'
import type { GraphConfig } from '@/store/dashboardStore/types'

function makeConfig(overrides: Partial<GraphConfig> = {}): GraphConfig {
    return {
        id: overrides.id ?? crypto.randomUUID(),
        channelName: overrides.channelName ?? 'Test0',
        title: overrides.title ?? 'Test Plot',
        titleColor: overrides.titleColor ?? 'black',
        offset: overrides.offset ?? 0,
        graphType: overrides.graphType ?? 'Graph',
        displayedHistory: overrides.displayedHistory ?? '30s',
    }
}

describe('arbitrarily remove and add plots to dashboard', () => {
    let nonEmptyTestPlots: GraphConfig[]
    beforeEach(() => {
        nonEmptyTestPlots = [
            makeConfig({
                id: 'id-0',
                channelName: 'Test0',
                title: 'Test Plot 0',
            }),
            makeConfig({
                id: 'id-1',
                channelName: 'Test1',
                title: 'Test Plot 1',
            }),
            makeConfig({
                id: 'id-2',
                channelName: 'Test2',
                title: 'Test Plot 2',
            }),
            makeConfig({
                id: 'id-3',
                channelName: 'Test2',
                title: 'Test Plot 3',
            }),
        ]
    })
    describe('add plots function', () => {
        it('should add a new plot to the end of a non-empty array', () => {
            const plotToAdd = makeConfig({
                id: 'id-add',
                channelName: 'AddPlot',
                title: 'Test Add Plot',
            })
            const expectedPlots = [...nonEmptyTestPlots, plotToAdd]
            const result = addPlot(plotToAdd, nonEmptyTestPlots)
            expect(result).toStrictEqual(expectedPlots)
        })
        it('should add a new plot to an empty array', () => {
            const plotToAdd = makeConfig({
                id: 'id-add',
                channelName: 'AddPlot',
                title: 'Test Add Plot',
            })
            const expectedPlots = [plotToAdd]
            const result = addPlot(plotToAdd, [])
            expect(result).toStrictEqual(expectedPlots)
        })
        it('should NOT mutate the current plot array', () => {
            const plotToAdd = makeConfig({
                id: 'id-add',
                channelName: 'AddPlot',
                title: 'Test Add Plot',
            })
            const result = addPlot(plotToAdd, nonEmptyTestPlots)
            expect(result).not.toBe(nonEmptyTestPlots)
        })
    })
    describe('remove plots function', () => {
        it('should remove an arbitrary plot from the array', () => {
            const result = removePlot('id-1', nonEmptyTestPlots)
            expect(result).toHaveLength(3)
            expect(result.find((p) => p.id === 'id-1')).toBeUndefined()
        })
        it('should return copy of original plot if plot id does not exist in array', () => {
            const result = removePlot('nonexistent', nonEmptyTestPlots)
            expect(result).toStrictEqual(nonEmptyTestPlots)
        })
        it('should return an empty array if it removes the last plot in current array', () => {
            const testPlots = [makeConfig({ id: 'only' })]
            const result = removePlot('only', testPlots)
            expect(result).toStrictEqual([])
        })
        it('should return an empty plot array if passed an empty array', () => {
            const result = removePlot('id-0', [])
            expect(result).toStrictEqual([])
        })
        it('should NOT mutate the current plot array', () => {
            const result = removePlot('id-0', nonEmptyTestPlots)
            expect(result).not.toBe(nonEmptyTestPlots)
        })
    })

    describe('createGraphConfig', () => {
        it('should return a GraphConfig with a generated UUID id', () => {
            const input = {
                channelName: 'Sensor0',
                title: 'Temperature',
                titleColor: 'red' as const,
                offset: 0,
                graphType: 'Graph' as const,
                displayedHistory: '30s' as const,
            }
            const result = createGraphConfig(input)
            expect(result.id).toBeDefined()
            expect(result.id).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
            )
            expect(result).toMatchObject(input)
        })

        it('should generate unique ids across calls', () => {
            const input = {
                channelName: 'Sensor0',
                title: 'Temperature',
                titleColor: 'black' as const,
                offset: 0,
                graphType: 'Graph' as const,
                displayedHistory: '1min' as const,
            }
            const a = createGraphConfig(input)
            const b = createGraphConfig(input)
            expect(a.id).not.toBe(b.id)
        })

        it('should preserve all provided config fields', () => {
            const input = {
                channelName: 'Pressure1',
                title: 'Chamber Pressure',
                titleColor: 'blue' as const,
                offset: 3.5,
                graphType: 'Graph' as const,
                displayedHistory: '5min' as const,
            }
            const result = createGraphConfig(input)
            expect(result.channelName).toBe('Pressure1')
            expect(result.title).toBe('Chamber Pressure')
            expect(result.titleColor).toBe('blue')
            expect(result.offset).toBe(3.5)
            expect(result.graphType).toBe('Graph')
            expect(result.displayedHistory).toBe('5min')
        })
    })
})
