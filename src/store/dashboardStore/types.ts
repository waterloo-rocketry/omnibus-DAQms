export type TitleColor = 'black' | 'blue' | 'red' | 'green'

export interface GraphConfig {
    id: string
    channelName: string
    title: string

    titleColor: TitleColor
    offset: number
    graphType: string
    displayedHistory: string
}

export type GraphConfigEditable = Omit<GraphConfig, 'id' | 'channelName'>

export const TITLE_COLORS: readonly {
    label: string
    value: TitleColor
    preview: string
}[] = [
    { label: 'Black', value: 'black', preview: 'black' },
    { label: 'Green', value: 'green', preview: 'green' },
    { label: 'Red', value: 'red', preview: 'red' },
    { label: 'Blue', value: 'blue', preview: 'blue' },
]
