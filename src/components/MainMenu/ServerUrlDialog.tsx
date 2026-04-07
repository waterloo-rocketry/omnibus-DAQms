import { useEffect, useState } from 'react'
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
import { useOmnibusContext } from '@/hooks/useOmnibusContext'

interface ServerUrlDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ServerUrlDialog({ open, onOpenChange }: ServerUrlDialogProps) {
    const { serverUrl, setServerUrl } = useOmnibusContext()
    const [inputValue, setInputValue] = useState(serverUrl)

    useEffect(() => {
        if (open) {
            setInputValue(serverUrl)
        }
    }, [open, serverUrl])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = inputValue.trim()
        if (trimmed) {
            setServerUrl(trimmed)
        }
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Server Connection</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-3 mt-4">
                        <Label htmlFor="server-url">Server URL</Label>
                        <Input
                            id="server-url"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="http://localhost:6767"
                        />
                    </div>

                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" className="cursor-pointer">
                            Connect
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
