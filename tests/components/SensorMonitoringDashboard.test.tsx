import { describe, it, expect, beforeEach } from 'vitest'
import { addPlot, removePlot } from '@/lib/utils'
import { type SensorPlot } from '@/components/SensorMonitoringDashboard'

describe('arbitrarily remove and add plots to dashboard', () => {
    let nonEmptyTestPlots: SensorPlot[];
    beforeEach (() => {
        nonEmptyTestPlots = [
            { name: "Test0", title: "Test Plot 0"},
            { name: "Test1", title: "Test Plot 1"},
            { name: "Test2", title: "Test Plot 2"},
            { name: "Test2", title: "Test Plot 3"},
        ];
    })
    describe('add plots function', () => {
        it('should add a new plot to the end of a non-empty array', () => {
            const plotToAdd: SensorPlot = { name: "AddPlot", title: "Test Add Plot"};
            const expectedPlots: SensorPlot[] = [...nonEmptyTestPlots, plotToAdd];
            const result = addPlot(plotToAdd, nonEmptyTestPlots);
            expect(result).toStrictEqual(expectedPlots);
        })
        it('should add a new plot to an empty array', () => {
            const plotToAdd: SensorPlot = { name: "AddPlot", title: "Test Add Plot"};
            const expectedPlots: SensorPlot[] = [plotToAdd];
            const result = addPlot(plotToAdd, []);
            expect(result).toStrictEqual(expectedPlots);
        })
        it('should NOT mutate the current plot array', () => {
            const plotToAdd: SensorPlot = { name: "AddPlot", title: "Test Add Plot"};
            const result = addPlot(plotToAdd, nonEmptyTestPlots);
            expect(result).not.toBe(nonEmptyTestPlots);
        })
    })
    describe('remove plots function', () => {
        it('should remove an arbitrary plot from the array', () => {
            const plotToRemove: string = "Test1";
            const expectedPlots: SensorPlot[] = [
                { name: "Test0", title: "Test Plot 0"},
                { name: "Test2", title: "Test Plot 2"},
                { name: "Test2", title: "Test Plot 3"},
            ];
            const result = removePlot(plotToRemove, nonEmptyTestPlots);
            expect(result).toStrictEqual(expectedPlots);
        })
        it('should return copy of original plot if plot name does not exist in array', () => {
            const plotToRemove: string = "Test5";
            const expectedPlots: SensorPlot[] = [...nonEmptyTestPlots];
            const result = removePlot(plotToRemove, nonEmptyTestPlots);
            expect(result).toStrictEqual(expectedPlots);
        })
        it('should remove duplicate plots', () => {
            const plotToRemove: string = "Test2";
            const expectedPlots: SensorPlot[] = [
                { name: "Test0", title: "Test Plot 0"},
                { name: "Test1", title: "Test Plot 1"},
            ];
            const result = removePlot(plotToRemove, nonEmptyTestPlots);
            expect(result).toStrictEqual(expectedPlots);
        })
        it('should return an empty array if it removes the last plot in current array', () => {
            const plotToRemove: string = "Test0";
            const testPlots: SensorPlot[] = [{name: "Test0", title: "Test Plot 0"}];
            const expectedPlots: SensorPlot[] = [];
            const result = removePlot(plotToRemove, testPlots);
            expect(result).toStrictEqual(expectedPlots);
        })
        it('should return an empty plot array if passed an empty array', () => {
            const plotToRemove: string = "Test0";
            const testPlots: SensorPlot[] = [];
            const expectedPlots: SensorPlot[] = [];
            const result = removePlot(plotToRemove, testPlots);
            expect(result).toStrictEqual(expectedPlots);
        })
    })
})