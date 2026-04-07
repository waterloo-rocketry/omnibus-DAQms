import { useEffect, useState } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDashboardStore } from '@/store/dashboardStore'
import type { GraphConfig, GraphConfigEditable } from '@/components/LiveDataDashboard/types'
import EditGraphDialog from '@/components/SensorModule/EditGraphDialog'
import { EditDashboardRow } from './EditDashboardRow'

interface WorkingGraphConfig extends GraphConfig {
    markedForDeletion: boolean
}

interface EditDashboardDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditDashboardDialog({
    open,
    onOpenChange,
}: EditDashboardDialogProps) {
    const graphConfigs = useDashboardStore((s) => s.graphConfigs)
    const setGraphConfigs = useDashboardStore((s) => s.setGraphConfigs)

    const [workingCopy, setWorkingCopy] = useState<WorkingGraphConfig[]>([])
    const [deleteMode, setDeleteMode] = useState(false)
    const [preDeleteSnapshot, setPreDeleteSnapshot] = useState<
        WorkingGraphConfig[] | null
    >(null)
    const [editDialogTarget, setEditDialogTarget] = useState<{
        index: number
    } | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        if (open) {
            setWorkingCopy(
                graphConfigs.map((c) => ({ ...c, markedForDeletion: false }))
            )
            setDeleteMode(false)
            setPreDeleteSnapshot(null)
            setEditDialogTarget(null)
        }
    }, [open, graphConfigs])

    const handleOpenChange = (isOpen: boolean) => {
        if (deleteMode && !isOpen) return
        onOpenChange(isOpen)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            setWorkingCopy((prev) => {
                const oldIndex = prev.findIndex((c) => c.id === active.id)
                const newIndex = prev.findIndex((c) => c.id === over.id)
                return arrayMove(prev, oldIndex, newIndex)
            })
        }
    }

    const handleTitleChange = (index: number, title: string) => {
        setWorkingCopy((prev) => {
            const next = [...prev]
            next[index] = { ...next[index], title }
            return next
        })
    }

    const handleGraphTypeChange = (index: number, graphType: string) => {
        setWorkingCopy((prev) => {
            const next = [...prev]
            next[index] = { ...next[index], graphType }
            return next
        })
    }

    const handleColorChange = (index: number, titleColor: string) => {
        setWorkingCopy((prev) => {
            const next = [...prev]
            next[index] = { ...next[index], titleColor }
            return next
        })
    }

    const handleToggleDeletion = (index: number) => {
        setWorkingCopy((prev) => {
            const next = [...prev]
            next[index] = {
                ...next[index],
                markedForDeletion: !next[index].markedForDeletion,
            }
            return next
        })
    }

    const handleEditDialogSave = (
        index: number,
        changes: Partial<GraphConfigEditable>
    ) => {
        setWorkingCopy((prev) => {
            const next = [...prev]
            next[index] = { ...next[index], ...changes }
            return next
        })
    }

    const handleEnterDeleteMode = () => {
        setPreDeleteSnapshot([...workingCopy])
        setDeleteMode(true)
    }

    const handleCancelDeleteMode = () => {
        if (preDeleteSnapshot) setWorkingCopy(preDeleteSnapshot)
        setPreDeleteSnapshot(null)
        setDeleteMode(false)
    }

    const handleDoneDeleteMode = () => {
        setPreDeleteSnapshot(null)
        setDeleteMode(false)
    }

    const handleApply = () => {
        const final = workingCopy
            .filter((c) => !c.markedForDeletion)
            .map(({ markedForDeletion: _, ...config }) => config)
        setGraphConfigs(final)
        onOpenChange(false)
    }

    const editTarget =
        editDialogTarget !== null ? workingCopy[editDialogTarget.index] : null

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="sm:max-w-[700px] max-h-[85dvh] grid grid-rows-[auto_auto_1fr_auto]"
                showCloseButton={!deleteMode}
            >
                <DialogHeader>
                    <DialogTitle>Edit Dashboard</DialogTitle>
                </DialogHeader>

                <div className="flex gap-2">
                    {deleteMode ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="cursor-pointer"
                                onClick={handleCancelDeleteMode}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                className="cursor-pointer"
                                onClick={handleDoneDeleteMode}
                            >
                                Done
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={handleEnterDeleteMode}
                            disabled={workingCopy.length === 0}
                        >
                            Delete Modules...
                        </Button>
                    )}
                </div>

                <div className="min-h-0 overflow-y-auto border rounded-md">
                    {workingCopy.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-4">
                            No modules to edit.
                        </p>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={workingCopy.map((c) => c.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {workingCopy.map((config, index) => (
                                    <EditDashboardRow
                                        key={config.id}
                                        id={config.id}
                                        index={index}
                                        title={config.title}
                                        titleColor={config.titleColor}
                                        graphType={config.graphType}
                                        markedForDeletion={
                                            config.markedForDeletion
                                        }
                                        deleteMode={deleteMode}
                                        onTitleChange={handleTitleChange}
                                        onGraphTypeChange={
                                            handleGraphTypeChange
                                        }
                                        onColorChange={handleColorChange}
                                        onToggleDeletion={
                                            handleToggleDeletion
                                        }
                                        onOpenEditDialog={(i) =>
                                            setEditDialogTarget({ index: i })
                                        }
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </div>

                {!deleteMode && (
                    <DialogFooter>
                        <Button
                            className="cursor-pointer"
                            onClick={handleApply}
                        >
                            Apply
                        </Button>
                    </DialogFooter>
                )}

                {editTarget && editDialogTarget && (
                    <EditGraphDialog
                        open={true}
                        onOpenChange={() => setEditDialogTarget(null)}
                        index={editDialogTarget.index}
                        title={editTarget.title}
                        titleColor={editTarget.titleColor}
                        offset={editTarget.offset}
                        graphType={editTarget.graphType}
                        displayedHistory={editTarget.displayedHistory}
                        onEdit={handleEditDialogSave}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}
