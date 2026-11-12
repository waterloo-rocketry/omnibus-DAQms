import { useOmnibusContext } from '@/hooks/useOmnibusContext'

const statusConfig = {
    connected: { color: 'bg-green-500', text: 'Connected' },
    connecting: { color: 'bg-yellow-500', text: 'Connecting' },
    disconnected: { color: 'bg-orange-500', text: 'Disconnected' },
    error: { color: 'bg-red-500', text: 'Error' },
} as const

interface ConnectionStatusProps {
    onClick?: () => void
}

export function ConnectionStatus({ onClick }: ConnectionStatusProps) {
    const { connectionStatus } = useOmnibusContext()
    const { color, text } = statusConfig[connectionStatus] ?? {
        color: 'bg-gray-500',
        text: 'Unknown',
    }

    return (
        <button
            className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-accent rounded-l-lg transition-colors"
            title={text}
            onClick={onClick}
        >
            <span className="text-sm text-muted-foreground">{text}</span>
            <span className={`size-2.5 rounded-full ${color}`} />
        </button>
    )
}
