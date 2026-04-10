import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { TITLE_COLORS } from '@/store/dashboardStore/types'
import type { GraphConfigEditable } from '@/store/dashboardStore/types'

interface EditGraphDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    id: string
    title: string
    titleColor: string
    offset: number
    graphType: string
    displayedHistory: string
    onEdit: (id: string, changes: Partial<GraphConfigEditable>) => void
}

// const HISTORY_OPTIONS = ['30s', '1min', '5min', '10min', '30min']

export default function EditGraphDialog({
    open,
    onOpenChange,
    id,
    title,
    titleColor,
    offset,
    graphType,
    displayedHistory,
    onEdit,
}: EditGraphDialogProps) {
    const [name, setName] = useState(title)
    const [color, setColor] = useState(titleColor)
    const [offsetInput, setOffsetInput] = useState(String(offset))
    const [localGraphType, setLocalGraphType] = useState(graphType)
    const [history, setHistory] = useState(displayedHistory)

    const onOpen = () => {
        setName(title)
        setColor(titleColor)
        setOffsetInput(String(offset))
        setLocalGraphType(graphType)
        setHistory(displayedHistory)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const parsed = parseFloat(offsetInput)
        onEdit(id, {
            title: name,
            titleColor: color,
            offset: Number.isNaN(parsed) ? offset : parsed,
            graphType: localGraphType,
            displayedHistory: history,
        })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[500px]"
                onOpenAutoFocus={onOpen}
            >
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit — {name || 'Graph'}</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6 mt-4">
                        {/* ROW 1 */}
                        <div className="grid gap-3">
                            <Label>Title</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {/* ROW 2 */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="grid gap-3">
                                <Label>Title Color</Label>
                                <div className="flex gap-3 mt-1">
                                    {TITLE_COLORS.map((c) => (
                                        <button
                                            key={c.tw}
                                            type="button"
                                            onClick={() => setColor(c.tw)}
                                            className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                                                color === c.tw ?
                                                    'border-black'
                                                :   'border-gray-300'
                                            }`}
                                            style={{
                                                backgroundColor: c.preview,
                                            }}
                                            title={c.label}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <Label>Type</Label>
                                <Select
                                    value={localGraphType}
                                    onValueChange={setLocalGraphType}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Graph">
                                            Graph
                                        </SelectItem>
                                        <SelectItem value="Number">
                                            Number
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* ROW 3 */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="grid gap-3">
                                <Label>Offset</Label>
                                <Input
                                    type="text"
                                    placeholder={offset.toString()}
                                    inputMode="decimal"
                                    value={offsetInput}
                                    onChange={(e) =>
                                        setOffsetInput(e.target.value)
                                    }
                                />
                            </div>

                            {/* <div className="grid gap-3"> */}
                            {/*     <Label>History</Label> */}
                            {/*     <Select */}
                            {/*         value={history} */}
                            {/*         onValueChange={setHistory} */}
                            {/*     > */}
                            {/*         <SelectTrigger> */}
                            {/*             <SelectValue placeholder="History" /> */}
                            {/*         </SelectTrigger> */}
                            {/*         <SelectContent> */}
                            {/*             {HISTORY_OPTIONS.map((h) => ( */}
                            {/*                 <SelectItem key={h} value={h}> */}
                            {/*                     {h} */}
                            {/*                 </SelectItem> */}
                            {/*             ))} */}
                            {/*         </SelectContent> */}
                            {/*     </Select> */}
                            {/* </div> */}
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" className="cursor-pointer">
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
