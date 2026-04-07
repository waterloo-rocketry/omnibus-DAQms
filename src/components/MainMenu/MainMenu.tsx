import { Ellipsis, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConnectionStatus } from './ConnectionStatus'
import { MainMenuFooter } from './MainMenuFooter'

export function MainMenu() {
    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div className="flex items-center rounded-lg border bg-popover shadow-lg">
                <ConnectionStatus />
                <div className="h-10 w-px bg-border" />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-lg"
                            className="cursor-pointer rounded-lg"
                            aria-label="Open main menu"
                        >
                            <Ellipsis />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="top"
                        align="end"
                        className="w-60"
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                className="cursor-pointer py-2 text-sm"
                                onSelect={() => {}}
                            >
                                <Plus />
                                Add Item
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer py-2 text-sm"
                                onSelect={() => {}}
                            >
                                <Pencil />
                                Edit Dashboard
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer py-2 text-sm"
                            variant="destructive"
                            onSelect={() => {}}
                        >
                            <Trash2 />
                            Clear
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <MainMenuFooter />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
