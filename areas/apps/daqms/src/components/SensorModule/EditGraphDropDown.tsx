import { useState, useEffect } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import EditGraphDialog from './EditGraphDialog'
import DeleteGraphDialog from './DeleteGraphDialog'
import type { GraphConfigEditable } from '@/store/dashboardStore/types'
import { Input } from '../ui/input'

interface EditGraphDropDownProps {
    id: string
    title: string
    titleColor: string
    offset: number
    graphType: string
    displayedHistory: string
    onEdit: (id: string, changes: Partial<GraphConfigEditable>) => void
    onDelete: () => void
    onSetZeroPoint: () => void
}

export default function EditGraphDropDown({
    id,
    title,
    titleColor,
    offset,
    graphType,
    displayedHistory,
    onEdit,
    onDelete,
    onSetZeroPoint,
}: EditGraphDropDownProps) {
    // dialog states (Edit and Delete)
    const [openEdit, setOpenEdit] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)

    const [offsetInput, setOffsetInput] = useState(String(offset))

    useEffect(() => {
        setOffsetInput(String(offset.toFixed(1)))
    }, [offset])

    return (
        <div className="flex justify-end w-full">
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        className="cursor-pointer"
                        aria-label="Open menu"
                    >
                        <MoreHorizontal />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-40" align="end">
                    {/* set offset */}
                    <DropdownMenuLabel>Offset</DropdownMenuLabel>
                    <div className="flex items-center justify-between px-2 py-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() =>
                                onEdit(id, {
                                    offset: parseFloat(
                                        (offset - 0.5).toFixed(1)
                                    ),
                                })
                            }
                        >
                            –
                        </Button>

                        <div className="grid gap-3 px-1">
                            <Input
                                aria-label="Offset"
                                type="text"
                                inputMode="decimal"
                                placeholder={offset.toString()}
                                value={offsetInput}
                                onChange={(e) => setOffsetInput(e.target.value)}
                                onBlur={() => {
                                    const parsed = parseFloat(offsetInput)

                                    if (!Number.isNaN(parsed)) {
                                        onEdit(id, { offset: parsed })
                                    } else {
                                        setOffsetInput(
                                            String(offset.toFixed(1))
                                        ) // reset to last valid value
                                    }
                                }}
                            />
                        </div>

                        <Button
                            size="sm"
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() =>
                                onEdit(id, {
                                    offset: parseFloat(
                                        (offset + 0.5).toFixed(1)
                                    ),
                                })
                            }
                        >
                            +
                        </Button>
                    </div>

                    <DropdownMenuSeparator />

                    {/* set zero state option */}
                    <DropdownMenuItem
                        onSelect={() => {
                            onSetZeroPoint()
                        }}
                    >
                        Set Zero Point
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    {/* edit button */}
                    <DropdownMenuItem
                        onSelect={() => {
                            setOpenEdit(true)
                        }}
                    >
                        Edit
                    </DropdownMenuItem>

                    {/* delete button */}
                    <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onSelect={() => {
                            setOpenDelete(true)
                        }}
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* edit component */}
            <EditGraphDialog
                open={openEdit}
                onOpenChange={setOpenEdit}
                id={id}
                title={title}
                titleColor={titleColor}
                offset={offset}
                graphType={graphType}
                displayedHistory={displayedHistory}
                onEdit={onEdit}
            />

            {/* delete component */}
            <DeleteGraphDialog
                open={openDelete}
                onOpenChange={setOpenDelete}
                onDelete={onDelete}
            />
        </div>
    )
}
