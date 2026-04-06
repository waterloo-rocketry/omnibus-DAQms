import { Plus } from 'lucide-react'
import { SensorModule } from '../SensorModule'
import { Button } from '@/components/ui/button'
import { useDashboardStore } from '@/store/dashboardStore'

export const LiveDataDashboard = () => {
    const graphConfigs = useDashboardStore((s) => s.graphConfigs)
    const deleteGraph = useDashboardStore((s) => s.deleteGraph)
    const editGraphProps = useDashboardStore((s) => s.editGraphProps)
    const setAddDataOpen = useDashboardStore((s) => s.setAddDataOpen)

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

    return (
        <div className="space-y-4">
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
