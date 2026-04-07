export interface GraphConfig {
    id: string
    channelName: string
    title: string

    titleColor: string
    offset: number
    graphType: string
    displayedHistory: string
}

export type GraphConfigEditable = Omit<GraphConfig, 'id' | 'channelName'>

export const TITLE_COLORS = [
    { label: 'Black', tw: 'text-foreground', preview: 'black' },
    { label: 'Green', tw: 'text-green-500', preview: 'green' },
    { label: 'Red', tw: 'text-red-500', preview: 'red' },
    { label: 'Blue', tw: 'text-blue-500', preview: 'blue' },
] as const
