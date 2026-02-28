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
import type {
    GraphOptions,
    ColorType,
    GraphType,
    HistoryType,
} from './types/lineGraph'
import { COLOR_OPTIONS, HISTORY_OPTIONS } from './types/lineGraph'

interface EditGraphDialogProps {
    openEdit: boolean
    setOpenEdit: (open: boolean) => void
    options: GraphOptions
}

export default function EditGraphDialog({
    openEdit,
    setOpenEdit,
    options,
}: EditGraphDialogProps) {
    const {
        graphTitle,
        setGraphTitle,
        titleColor,
        setTitleColor,
        offset,
        setOffset,
        graphType,
        setGraphType,
        displayedHistory,
        setDisplayedHistory,
    } = options

    const [formData, setFormData] = useState({
        title: graphTitle,
        color: titleColor as ColorType,
        offsetInput: String(offset),
        type: graphType as GraphType,
        history: displayedHistory as HistoryType,
    })

    // sync local state with props when dialog opens
    useEffect(() => {
        setFormData({
            title: graphTitle,
            color: titleColor as ColorType,
            offsetInput: String(offset),
            type: graphType as GraphType,
            history: displayedHistory as HistoryType,
        })
    }, [openEdit])

    const updateFormData = (key: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
    }

    // allow only partial numeric input while typing (digits, optional leading '-', optional single '.')
    const partialNumberRE = /^-?\d*\.?\d*$/
    const fullNumberRE = /^-?\d+(?:\.\d+)?$/

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setGraphTitle(formData.title)
        setTitleColor(formData.color)

        // only accept and save if the input is a fully-formed number
        if (fullNumberRE.test(formData.offsetInput)) {
            setOffset(parseFloat(formData.offsetInput))
        } else {
            // fallback to stored value if invalid
            setOffset(offset)
        }

        setGraphType(formData.type)
        setDisplayedHistory(formData.history)
        // close the Edit dialog
        setOpenEdit(false)
    }

    return (
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            Edit — {formData.title || 'Graph'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6 mt-4">
                        {/* ROW 1 */}
                        <div className="grid gap-3">
                            <Label>Title</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) =>
                                    updateFormData('title', e.target.value)
                                }
                            />
                        </div>

                        {/* ROW 2 */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Column 1 */}
                            <div className="grid gap-3">
                                <Label>Title Color</Label>
                                <div className="flex gap-3 mt-1">
                                    {COLOR_OPTIONS.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() =>
                                                updateFormData('color', c)
                                            }
                                            className={`w-8 h-8 rounded-full border-2 ${
                                                formData.color === c ?
                                                    'border-black'
                                                :   'border-gray-300'
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
                                    value={formData.type}
                                    onValueChange={(value) =>
                                        updateFormData('type', value)
                                    }
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
                                    placeholder={offset.toString()}
                                    inputMode="decimal"
                                    value={formData.offsetInput}
                                    onChange={(e) => {
                                        const v = e.target.value
                                        // allow empty, a lone '-', partial numbers like '5.' etc.
                                        if (
                                            v === '' ||
                                            partialNumberRE.test(v)
                                        ) {
                                            updateFormData('offsetInput', v)
                                        }
                                    }}
                                />
                            </div>

                            {/* Column 2 */}
                            <div className="grid gap-3">
                                <Label>History</Label>
                                <Select
                                    value={formData.history}
                                    onValueChange={(value) =>
                                        updateFormData(
                                            'history',
                                            value as HistoryType
                                        )
                                    }
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
