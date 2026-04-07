import { useState } from 'react'
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
import type { GraphConfigEditable } from '@/components/LiveDataDashboard/types'

interface EditGraphDropDownProps {
    index: number
    title: string
    titleColor: string
    offset: number
    graphType: string
    displayedHistory: string
    onEdit: (index: number, changes: Partial<GraphConfigEditable>) => void
    onDelete: () => void
    onSetZeroPoint: () => void
}

export default function EditGraphDropDown({
    index,
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

    // format offset to 1 decimal
    const formattedOffset = offset.toFixed(1)

    return (
        <div className="flex justify-end w-full">
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon-sm"
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
                            onClick={() =>
                                onEdit(index, {
                                    offset: parseFloat(
                                        (offset - 0.5).toFixed(1)
                                    ),
                                })
                            }
                        >
                            –
                        </Button>

                        <span className="text-md w-12 text-center">
                            {formattedOffset}
                        </span>

                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                                onEdit(index, {
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
                index={index}
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
