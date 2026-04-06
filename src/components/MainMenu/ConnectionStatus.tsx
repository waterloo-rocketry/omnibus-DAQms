import { useOmnibusContext } from '@/hooks/useOmnibusContext'

const statusConfig = {
    connected: { color: 'bg-green-500', text: 'Connected' },
    connecting: { color: 'bg-yellow-500', text: 'Connecting' },
    disconnected: { color: 'bg-orange-500', text: 'Disconnected' },
    error: { color: 'bg-red-500', text: 'Error' },
} as const

export function ConnectionStatus() {
    const { connectionStatus } = useOmnibusContext()
    const { color, text } = statusConfig[connectionStatus] ?? {
        color: 'bg-gray-500',
        text: 'Unknown',
    }

    return (
        <div className="flex items-center gap-2 px-4 py-3" title={text}>
            <span className="text-sm text-muted-foreground">{text}</span>
            <span className={`size-2.5 rounded-full ${color}`} />
        </div>
    )
}
