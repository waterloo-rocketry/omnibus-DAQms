import { useState, useEffect } from 'react'
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

interface EditGraphDialogProps {
    openEdit: boolean
    setOpenEdit: React.Dispatch<React.SetStateAction<boolean>>
    currentTitle: string
    setGraphTitle: React.Dispatch<React.SetStateAction<string>>
    currentColor: string
    setTitleColor: React.Dispatch<React.SetStateAction<string>>
    currentOffset: number
    setCurrentOffset: React.Dispatch<React.SetStateAction<number>>
    currentGraphType: string
    setCurrentGraphType: React.Dispatch<React.SetStateAction<string>>
    displayedHistory: string
    setDisplayedHistory: React.Dispatch<React.SetStateAction<string>>
}

const COLORS = ['black', 'green', 'red', 'blue']
const HISTORY_OPTIONS = ['30s', '1min', '5min', '10min', '30min']

export default function EditGraphDialog({
    openEdit,
    setOpenEdit,
    currentTitle,
    setGraphTitle,
    currentColor,
    setTitleColor,
    currentOffset,
    setCurrentOffset,
    currentGraphType,
    setCurrentGraphType,
    displayedHistory,
    setDisplayedHistory,
}: EditGraphDialogProps) {
    const [name, setName] = useState(currentTitle)
    const [color, setColor] = useState(currentColor)
    // keep the input as a string so the user can type a lone '-' before it's a valid number
    const [offsetInput, setOffsetInput] = useState(String(currentOffset))
    const [graphType, setGraphType] = useState(currentGraphType)
    const [history, setHistory] = useState(displayedHistory)

    // sync local state with props when they change
    useEffect(() => {
        setName(currentTitle)
        setColor(currentColor)
        setOffsetInput(String(currentOffset))
        setGraphType(currentGraphType)
        setHistory(displayedHistory)
    }, [
        currentTitle,
        currentColor,
        currentOffset,
        currentGraphType,
        displayedHistory,
    ])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setGraphTitle(name)
        setTitleColor(color)
        const parsed = parseFloat(offsetInput)
        setCurrentOffset(Number.isNaN(parsed) ? currentOffset : parsed)
        setCurrentGraphType(graphType)
        setDisplayedHistory(history)
        // close the Edit dialog
        setOpenEdit(false)
    }

    return (
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent className="sm:max-w-[500px]">
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
                            {/* Column 1 */}
                            <div className="grid gap-3">
                                <Label>Title Color</Label>
                                <div className="flex gap-3 mt-1">
                                    {COLORS.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={`w-8 h-8 rounded-full border-2 ${
                                                color === c ? 'border-black' : (
                                                    'border-gray-300'
                                                )
                                            }`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Column 2  */}
                            <div className="grid gap-3">
                                <Label>Type</Label>
                                <Select
                                    value={graphType}
                                    onValueChange={setGraphType}
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
                            {/* Column 1 — Offset */}
                            <div className="grid gap-3">
                                <Label>Offset</Label>
                                <Input
                                    type="text"
                                    placeholder={currentOffset.toString()}
                                    inputMode="decimal"
                                    value={offsetInput}
                                    onChange={(e) =>
                                        setOffsetInput(e.target.value)
                                    }
                                />
                            </div>

                            {/* Column 2 */}
                            <div className="grid gap-3">
                                <Label>History</Label>
                                <Select
                                    value={history}
                                    onValueChange={setHistory}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="History" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {HISTORY_OPTIONS.map((h) => (
                                            <SelectItem key={h} value={h}>
                                                {h}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
