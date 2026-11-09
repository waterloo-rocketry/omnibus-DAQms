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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useLastDatapointStore } from '@/store/omnibusStore'
import { useDashboardStore, DEFAULT_TITLE_COLOR } from '@/store/dashboardStore'
import { TITLE_COLORS } from '@/store/dashboardStore/types'

const HISTORY_OPTIONS = ['5s', '10s', '30s', '1min', '5min', '10min', '30min']

interface AddDataDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddDataDialog({ open, onOpenChange }: AddDataDialogProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [title, setTitle] = useState('')
    const [titleColor, setTitleColor] = useState(DEFAULT_TITLE_COLOR)
    const [offset, setOffset] = useState('0')
    const [graphType, setGraphType] = useState('Graph')
    const [displayedHistory, setDisplayedHistory] = useState('30s')
    const series = useLastDatapointStore((s) => s.series)
    const addGraphs = useDashboardStore((s) => s.addGraphs)

    const channels = useMemo(
        () => Object.entries(series).sort(([a], [b]) => a.localeCompare(b)),
        [series]
    )

    const toggle = (name: string, checked: boolean | 'indeterminate') => {
        setSelected((prev) => {
            const next = new Set(prev)
            if (checked === true) next.add(name)
            else next.delete(name)
            return next
        })
    }

    const handleAdd = () => {
        const parsedOffset = Number.parseFloat(offset)
        const configs = Array.from(selected).map((channelName) => ({
            channelName,
            title: title.trim() || channelName,
            titleColor,
            offset: Number.isFinite(parsedOffset) ? parsedOffset : 0,
            graphType,
            displayedHistory,
        }))
        addGraphs(configs)
        onOpenChange(false)
    }

    const resetOptions = () => {
        setSelected(new Set())
        setTitle('')
        setTitleColor(DEFAULT_TITLE_COLOR)
        setOffset('0')
        setGraphType('Graph')
        setDisplayedHistory('30s')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[500px]"
                onOpenAutoFocus={resetOptions}
            >
                <DialogHeader>
                    <DialogTitle>Add Data</DialogTitle>
                    <DialogDescription>
                        Choose channels and settings for the new dashboard
                        items.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="new-graph-title">Title</Label>
                        <Input
                            id="new-graph-title"
                            value={title}
                            placeholder="Defaults to each channel name"
                            onChange={(event) => setTitle(event.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Type</Label>
                            <Select
                                value={graphType}
                                onValueChange={setGraphType}
                            >
                                <SelectTrigger aria-label="Type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Graph">Graph</SelectItem>
                                    <SelectItem value="Number">
                                        Number
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            {graphType !== 'Number' && (
                                <div className="grid gap-2">
                                    <Label>History</Label>
                                    <Select
                                        value={displayedHistory}
                                        onValueChange={setDisplayedHistory}
                                    >
                                        <SelectTrigger aria-label="History">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {HISTORY_OPTIONS.map((history) => (
                                                <SelectItem
                                                    key={history}
                                                    value={history}
                                                >
                                                    {history}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-end">
                        <div className="grid gap-2">
                            <Label htmlFor="new-graph-offset">Offset</Label>
                            <Input
                                id="new-graph-offset"
                                type="number"
                                step="any"
                                value={offset}
                                onChange={(event) =>
                                    setOffset(event.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Title Color</Label>
                            <div className="flex gap-2">
                                {TITLE_COLORS.map((color) => (
                                    <button
                                        key={color.tw}
                                        type="button"
                                        onClick={() => setTitleColor(color.tw)}
                                        className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                                            titleColor === color.tw ?
                                                'border-black'
                                            :   'border-gray-300'
                                        }`}
                                        style={{
                                            backgroundColor: color.preview,
                                        }}
                                        title={color.label}
                                        aria-label={`${color.label} title color`}
                                        aria-pressed={titleColor === color.tw}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

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
                                    className="min-w-0 flex-1 break-all text-sm"
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
                        <Button variant="outline" className="cursor-pointer">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        className="cursor-pointer"
                        disabled={selected.size === 0}
                        onClick={handleAdd}
                    >
                        Add
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
