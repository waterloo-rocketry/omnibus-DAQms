import { Plus } from 'lucide-react'
import { SensorModule } from '../SensorModule'
import { Button } from '@/components/ui/button'
import { useDashboardStore } from '@/store/dashboardStore'
import { useGraphDataStore } from '@/store/graphDataStore'
import type { GraphConfig } from '@/store/dashboardStore/types'

type RenderSlot =
    | { type: 'single'; config: GraphConfig }
    | { type: 'pair'; configs: [GraphConfig, GraphConfig] }

function buildSlots(configs: GraphConfig[]): RenderSlot[] {
    const slots: RenderSlot[] = []
    let i = 0
    while (i < configs.length) {
        const curr = configs[i]
        const next = configs[i + 1]
        if (curr.graphType === 'Number' && next?.graphType === 'Number') {
            slots.push({ type: 'pair', configs: [curr, next] })
            i += 2
        } else {
            slots.push({ type: 'single', config: curr })
            i++
        }
    }
    return slots
}

export const LiveDataDashboard = () => {
    const graphConfigs = useDashboardStore((s) => s.graphConfigs)
    const editGraphProps = useDashboardStore((s) => s.editGraphProps)
    const setAddDataOpen = useDashboardStore((s) => s.setAddDataOpen)
    const deleteGraph = useDashboardStore((s) => s.deleteGraph)
    const deleteGraphData = useGraphDataStore((s) => s.removeData)
    const graphData = useGraphDataStore((s) => s.data)
    
    const onDelete = (id: string) => {
        deleteGraph(id)
        deleteGraphData(id)
    }

    if (graphConfigs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
                <h2 className="text-xl font-semibold text-foreground">
                    Welcome to DAQms
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                    Add data channels to start monitoring telemetry.
                </p>
                <Button
                    className="cursor-pointer"
                    onClick={() => setAddDataOpen(true)}
                >
                    <Plus />
                    Add Item
                </Button>
            </div>
        )
    }

    const slots = buildSlots(graphConfigs)

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {slots.map((slot) => {
                    if (slot.type === 'pair') {
                        const [a, b] = slot.configs
                        return (
                            <div
                                key={`${a.id}-${b.id}`}
                                className="flex flex-col gap-2 self-start"
                                data-testid="small-module-pair"
                            >
                                <SensorModule
                                    key={a.id}
                                    id={a.id}
                                    channelName={a.channelName}
                                    title={a.title}
                                    titleColor={a.titleColor}
                                    offset={a.offset}
                                    graphType={a.graphType}
                                    displayedHistory={a.displayedHistory}
                                    data={graphData[a.id] ?? []}
                                    onDelete={onDelete}
                                    onEdit={editGraphProps}
                                />
                                <SensorModule
                                    key={b.id}
                                    id={b.id}
                                    channelName={b.channelName}
                                    title={b.title}
                                    titleColor={b.titleColor}
                                    offset={b.offset}
                                    graphType={b.graphType}
                                    displayedHistory={b.displayedHistory}
                                    data={graphData[b.id] ?? []}
                                    onDelete={onDelete}
                                    onEdit={editGraphProps}
                                />
                            </div>
                        )
                    }
                    const config = slot.config
                    return (
                        <SensorModule
                            key={config.id}
                            id={config.id}
                            channelName={config.channelName}
                            title={config.title}
                            titleColor={config.titleColor}
                            offset={config.offset}
                            graphType={config.graphType}
                            displayedHistory={config.displayedHistory}
                            data={graphData[config.id] ?? []}
                            onDelete={onDelete}
                            onEdit={editGraphProps}
                        />
                    )
                })}
            </div>
        </div>
    )
}
