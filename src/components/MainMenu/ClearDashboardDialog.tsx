import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDashboardStore } from '@/store/dashboardStore'

interface ClearDashboardDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ClearDashboardDialog({
    open,
    onOpenChange,
}: ClearDashboardDialogProps) {
    const setGraphConfigs = useDashboardStore((s) => s.setGraphConfigs)

    const handleClear = () => {
        setGraphConfigs([])
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-destructive">
                        Clear Dashboard
                    </DialogTitle>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    Are you sure? This will remove all graphs from the
                    dashboard.
                </p>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" className="cursor-pointer">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={handleClear}
                    >
                        Clear
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
