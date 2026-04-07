import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Undo2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { TITLE_COLORS } from '@/store/dashboardStore/types'

interface EditDashboardRowProps {
    id: string
    index: number
    title: string
    titleColor: string
    graphType: string
    markedForDeletion: boolean
    deleteMode: boolean
    onTitleChange: (index: number, title: string) => void
    onGraphTypeChange: (index: number, graphType: string) => void
    onColorChange: (index: number, color: string) => void
    onToggleDeletion: (index: number) => void
    onOpenEditDialog: (index: number) => void
}

export function EditDashboardRow({
    id,
    index,
    title,
    titleColor,
    graphType,
    markedForDeletion,
    deleteMode,
    onTitleChange,
    onGraphTypeChange,
    onColorChange,
    onToggleDeletion,
    onOpenEditDialog,
}: EditDashboardRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, disabled: deleteMode || markedForDeletion })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    // Marked for deletion — same in both modes
    if (markedForDeletion) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0"
            >
                <span className="text-sm text-muted-foreground line-through truncate">
                    {title}
                </span>
                <span className="text-sm text-muted-foreground italic flex-1">
                    This module will be deleted.
                </span>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer shrink-0"
                    onClick={() => onToggleDeletion(index)}
                    aria-label="Revert deletion"
                >
                    <Undo2 />
                </Button>
            </div>
        )
    }

    // Delete mode, not marked
    if (deleteMode) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0"
            >
                <span className="text-sm truncate flex-1">{title}</span>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer shrink-0 text-destructive hover:text-destructive"
                    onClick={() => onToggleDeletion(index)}
                    aria-label="Mark for deletion"
                >
                    <Trash2 />
                </Button>
            </div>
        )
    }

    // Normal mode, not marked — full edit row
    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-2 px-4 py-2.5 border-b last:border-b-0"
        >
            <Input
                value={title}
                onChange={(e) => onTitleChange(index, e.target.value)}
                className="h-8 text-sm min-w-0 flex-1"
                aria-label={`Module ${index + 1} title`}
            />

            <Select
                value={graphType}
                onValueChange={(v) => onGraphTypeChange(index, v)}
            >
                <SelectTrigger
                    size="sm"
                    className="w-24 shrink-0"
                    aria-label={`Module ${index + 1} graph type`}
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Graph">Graph</SelectItem>
                    <SelectItem value="Number">Number</SelectItem>
                </SelectContent>
            </Select>

            <div className="flex gap-1 shrink-0">
                {TITLE_COLORS.map((c) => (
                    <button
                        key={c.tw}
                        type="button"
                        onClick={() => onColorChange(index, c.tw)}
                        className={`size-5 rounded-full border-2 cursor-pointer ${
                            titleColor === c.tw ?
                                'border-foreground'
                            :   'border-muted'
                        }`}
                        style={{ backgroundColor: c.preview }}
                        aria-label={`${c.label} color`}
                        aria-pressed={titleColor === c.tw}
                    />
                ))}
            </div>

            <Button
                variant="outline"
                size="sm"
                className="cursor-pointer shrink-0"
                onClick={() => onOpenEditDialog(index)}
            >
                Edit
                <ArrowRight className="size-3" />
            </Button>

            <button
                className="cursor-grab shrink-0 text-muted-foreground hover:text-foreground touch-none"
                aria-label="Drag to reorder"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="size-4" />
            </button>
        </div>
    )
}
