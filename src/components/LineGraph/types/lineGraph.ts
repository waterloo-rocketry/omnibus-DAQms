/**
 * Typescript type definitions for Line Graph features
 */

import type { Dispatch, SetStateAction } from 'react'

/**
 * Graph modification options
 */
export const COLOR_OPTIONS = ['black', 'green', 'red', 'blue'] as const
export type ColorType = (typeof COLOR_OPTIONS)[number]

export const GRAPH_OPTIONS = ['Graph', 'Number'] as const
export type GraphType = (typeof GRAPH_OPTIONS)[number]

export const HISTORY_OPTIONS = ['30s', '1min', '5min', '10min', '30min'] as const
export type HistoryType = (typeof HISTORY_OPTIONS)[number]

/**
 * Edit graph options
 */
export interface GraphOptions {
    graphTitle: string
    setGraphTitle: (title: string) => void
    titleColor: ColorType
    setTitleColor: (color: ColorType) => void
    offset: number
    setOffset: Dispatch<SetStateAction<number>>
    graphType: GraphType
    setGraphType: (type: GraphType) => void
    displayedHistory: HistoryType
    setDisplayedHistory: (history: HistoryType) => void
}