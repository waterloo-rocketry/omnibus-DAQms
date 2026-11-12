import { Crosshair } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useDashboardStore } from '@/store/dashboardStore'

export function SetZeroPointAll() {
    const setZeroPointAll = useDashboardStore((s) => s.setZeroPointAll)

    return (
        <DropdownMenuItem
            className="cursor-pointer py-2 text-sm"
            onSelect={() => setZeroPointAll()}
        >
            <Crosshair />
            Set Zero Point All
        </DropdownMenuItem>
    )
}
