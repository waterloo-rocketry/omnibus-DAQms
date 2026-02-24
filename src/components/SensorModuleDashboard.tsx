import { useState } from 'react'
import { SensorModule } from './SensorModule'
import type { SensorPlot } from '../types/omnibus'
import { addPlot, removePlot } from '../lib/utils'

const DEFAULT_PLOTS: SensorPlot[] = [
    { id: '1', channelName: 'Fake0', title: 'Sensor 0' },
    { id: '2', channelName: 'Fake1', title: 'Sensor 1' },
    { id: '3', channelName: 'Fake2', title: 'Sensor 2' },
    { id: '4', channelName: 'Fake3', title: 'Sensor 3' },
    { id: '5', channelName: 'Fake4', title: 'Sensor 4' },
    { id: '6', channelName: 'Fake5', title: 'Sensor 5' },
]

export function SensorModuleDashboard() {
    const [plots, setPlots] = useState<SensorPlot[]>(DEFAULT_PLOTS)

    const handleAddPlot = () => {
        const channelName = `Fake${plots.length}`
        setPlots((prev) => addPlot(prev, channelName))
    }

    const handleRemovePlot = (id: string) => {
        setPlots((prev) => removePlot(prev, id))
    }

    return (
        <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Sensor Monitoring</h2>
                <button
                    onClick={handleAddPlot}
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                >
                    + Add Sensor
                </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {plots.map((plot) => (
                    <div key={plot.id} className="relative">
                        <SensorModule
                            channelName={plot.channelName}
                            title={plot.title}
                            unit={plot.unit}
                        />
                        {plots.length > 1 && (
                            <button
                                onClick={() => handleRemovePlot(plot.id)}
                                className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white hover:bg-red-600"
                                aria-label={`Remove ${plot.title}`}
                            >
                                x
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
