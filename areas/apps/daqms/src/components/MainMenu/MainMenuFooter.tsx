const REPO_URL = 'https://github.com/waterloo-rocketry/omnibus-DAQms'

export function MainMenuFooter() {
    const hash = import.meta.env.VITE_COMMIT_HASH ?? 'unknown'

    return (
        <div className="px-2 py-1.5">
            <p className="text-sm font-semibold">DAQms</p>
            <p className="text-xs text-muted-foreground">
                {hash !== 'unknown' ?
                    <a
                        href={`${REPO_URL}/commit/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                    >
                        Build {hash}
                    </a>
                :   'Build unknown'}
            </p>
            {/* Waterloo Rocketry logo slot */}
            <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} Waterloo Rocketry
            </p>
        </div>
    )
}
