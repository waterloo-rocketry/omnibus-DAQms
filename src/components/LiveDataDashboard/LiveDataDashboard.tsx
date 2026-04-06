import { useCallback, useState } from 'react'
import { SensorModule } from '../SensorModule'
import { addPlot, removePlot, createGraphConfig } from './utils'
import type { GraphConfig, GraphConfigEditable } from './types'
import { Button } from '@/components/ui/button'

const DEFAULT_GRAPH_CONFIGS: Omit<GraphConfig, 'id'>[] = [
    {
        channelName: 'Fake0',
        title: 'Ox Fill (psi)',
        titleColor: 'text-teal-500',
        offset: 0,
        graphType: 'Graph',
        displayedHistory: '30s',
    },
    {
        channelName: 'Fake1',
        title: 'Chamber Temp (°C)',
        titleColor: 'text-orange-500',
        offset: 0,
        graphType: 'Graph',
        displayedHistory: '30s',
    },
    {
        channelName: 'Fake2',
        title: 'Tank Pressure (bar)',
        titleColor: 'text-blue-500',
        offset: 0,
        graphType: 'Graph',
        displayedHistory: '30s',
    },
    {
        channelName: 'Fake3',
        title: 'Flow Rate (L/s)',
        titleColor: 'text-purple-500',
        offset: 0,
        graphType: 'Graph',
        displayedHistory: '30s',
    },
    {
        channelName: 'Fake4',
        title: 'Battery (V)',
        titleColor: 'text-green-500',
        offset: 0,
        graphType: 'Graph',
        displayedHistory: '30s',
    },
    {
        channelName: 'Fake5',
        title: 'Vibration (Hz)',
        titleColor: 'text-pink-500',
        offset: 0,
        graphType: 'Graph',
        displayedHistory: '30s',
    },
]

export const LiveDataDashboard = () => {
    const [graphConfigs, setGraphConfigs] = useState<GraphConfig[]>(() =>
        DEFAULT_GRAPH_CONFIGS.map(createGraphConfig)
    )

    const addGraph = useCallback((config: Omit<GraphConfig, 'id'>) => {
        setGraphConfigs((current) =>
            addPlot(createGraphConfig(config), current)
        )
    }, [])

    const deleteGraph = useCallback((id: string) => {
        setGraphConfigs((current) => removePlot(id, current))
    }, [])

    const editGraphProps = useCallback(
        (index: number, changes: Partial<GraphConfigEditable>) => {
            setGraphConfigs((current) => {
                const updated = [...current]
                updated[index] = { ...updated[index], ...changes }
                return updated
            })
        },
        []
    )

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    onClick={() =>
                        addGraph({
                            channelName: `Fake${graphConfigs.length}`,
                            title: `Sensor ${graphConfigs.length}`,
                            titleColor: 'text-teal-500',
                            offset: 0,
                            graphType: 'Graph',
                            displayedHistory: '30s',
                        })
                    }
                >
                    + Add Graph
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {graphConfigs.map((config, index) => (
                    <SensorModule
                        key={config.id}
                        index={index}
                        channelName={config.channelName}
                        title={config.title}
                        titleColor={config.titleColor}
                        offset={config.offset}
                        graphType={config.graphType}
                        displayedHistory={config.displayedHistory}
                        onDelete={deleteGraph}
                        onDeleteId={config.id}
                        onEdit={editGraphProps}
                    />
                ))}
            </div>
        </div>
    )
}
