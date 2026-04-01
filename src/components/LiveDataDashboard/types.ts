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
