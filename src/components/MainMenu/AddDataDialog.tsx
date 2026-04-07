import { useMemo, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useLastDatapointStore } from '@/store/omnibusStore'
import { useDashboardStore, DEFAULT_TITLE_COLOR } from '@/store/dashboardStore'

interface AddDataDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddDataDialog({ open, onOpenChange }: AddDataDialogProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const series = useLastDatapointStore((s) => s.series)
    const addGraphs = useDashboardStore((s) => s.addGraphs)

    const channels = useMemo(() => Object.entries(series).sort(([a], [b]) =>
        a.localeCompare(b)
    ), [series])

    const toggle = (name: string, checked: boolean | 'indeterminate') => {
        setSelected((prev) => {
            const next = new Set(prev)
            if (checked === true) next.add(name)
            else next.delete(name)
            return next
        })
    }

    const handleAdd = () => {
        const configs = Array.from(selected).map((channelName) => ({
            channelName,
            title: channelName,
            titleColor: DEFAULT_TITLE_COLOR,
            offset: 0,
            graphType: 'Graph' as const,
            displayedHistory: '30s',
        }))
        addGraphs(configs)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]" onCloseAutoFocus={() => setSelected(new Set())}>
                <DialogHeader>
                    <DialogTitle>Add Data</DialogTitle>
                    <DialogDescription>
                        Select channels to add to the dashboard.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[400px] overflow-y-auto border rounded-md">
                    {channels.length === 0 ?
                        <p className="text-sm text-muted-foreground p-4">
                            No channels available
                        </p>
                    :   channels.map(([name, dataPoint]) => (
                            <label
                                key={name}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent cursor-pointer border-b last:border-b-0"
                            >
                                <Checkbox
                                    checked={selected.has(name)}
                                    onCheckedChange={(checked) =>
                                        toggle(name, checked)
                                    }
                                />
                                <span
                                    className="truncate flex-1 text-sm"
                                    title={name}
                                >
                                    {name}
                                </span>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
                                    {dataPoint.type}
                                </span>
                            </label>
                        ))
                    }
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button disabled={selected.size === 0} onClick={handleAdd}>
                        Add
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
