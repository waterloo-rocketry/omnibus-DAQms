import { useState } from 'react'
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
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDashboardStore } from '@/store/dashboardStore'
import type {
    GraphConfig,
    GraphConfigEditable,
} from '@/store/dashboardStore/types'
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
    const [workingCopy, setWorkingCopy] = useState<WorkingGraphConfig[]>(() =>
        useDashboardStore
            .getState()
            .graphConfigs.map((c) => ({ ...c, markedForDeletion: false }))
    )
    const [deleteMode, setDeleteMode] = useState(false)
    const [preDeleteSnapshot, setPreDeleteSnapshot] = useState<
        WorkingGraphConfig[] | null
    >(null)
    const [editDialogTarget, setEditDialogTarget] = useState<{
        id: string
    } | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )
    const onOpen = () =>
        setWorkingCopy(
            useDashboardStore
                .getState()
                .graphConfigs.map((c) => ({ ...c, markedForDeletion: false }))
        )

    const onClose = () => {
        setDeleteMode(false)
        setPreDeleteSnapshot(null)
        setEditDialogTarget(null)
    }

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
                if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex)
                    return prev
                return arrayMove(prev, oldIndex, newIndex)
            })
        }
    }

    const handleTitleChange = (id: string, title: string) => {
        setWorkingCopy((prev) =>
            prev.map((c) => (c.id === id ? { ...c, title } : c))
        )
    }

    const handleGraphTypeChange = (id: string, graphType: string) => {
        setWorkingCopy((prev) =>
            prev.map((c) => (c.id === id ? { ...c, graphType } : c))
        )
    }

    const handleColorChange = (id: string, titleColor: string) => {
        setWorkingCopy((prev) =>
            prev.map((c) => (c.id === id ? { ...c, titleColor } : c))
        )
    }

    const handleToggleDeletion = (id: string) => {
        setWorkingCopy((prev) =>
            prev.map((c) =>
                c.id === id ?
                    { ...c, markedForDeletion: !c.markedForDeletion }
                :   c
            )
        )
    }

    const handleEditDialogSave = (
        id: string,
        changes: Partial<GraphConfigEditable>
    ) => {
        setWorkingCopy((prev) => {
            const targetIndex = prev.findIndex((c) => c.id === id)
            if (targetIndex === -1) return prev
            const next = [...prev]
            next[targetIndex] = { ...next[targetIndex], ...changes }
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
        useDashboardStore.getState().setGraphConfigs(final)
        onOpenChange(false)
    }

    const editTarget =
        editDialogTarget !== null ?
            workingCopy.find((item) => item.id === editDialogTarget.id)
        :   null

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="sm:max-w-[700px] max-h-[85dvh] grid grid-rows-[auto_auto_1fr_auto]"
                showCloseButton={!deleteMode}
                onOpenAutoFocus={onOpen}
                onCloseAutoFocus={onClose}
            >
                <DialogHeader>
                    <DialogTitle>Edit Dashboard</DialogTitle>
                    <DialogDescription>
                        Reorder or delete graphs in the dashboard
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2">
                    {deleteMode ?
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
                    :   <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={handleEnterDeleteMode}
                            disabled={workingCopy.length === 0}
                        >
                            Delete Modules...
                        </Button>
                    }
                </div>

                <div className="min-h-0 overflow-y-auto border rounded-md">
                    {workingCopy.length === 0 ?
                        <p className="text-sm text-muted-foreground p-4">
                            No modules to edit.
                        </p>
                    :   <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                            autoScroll={{ threshold: { x: 0, y: 0.2 } }}
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
                                        onToggleDeletion={handleToggleDeletion}
                                        onOpenEditDialog={(id) =>
                                            setEditDialogTarget({ id })
                                        }
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    }
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
                        id={editTarget.id}
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
