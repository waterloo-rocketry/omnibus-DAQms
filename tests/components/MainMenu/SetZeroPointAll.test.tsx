// import { describe, it, expect, beforeEach } from 'vitest'
// import { screen } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
// import { MainMenu } from '@/components/MainMenu'
// import { useDashboardStore } from '@/store/dashboardStore'
// import { useGraphDataStore } from '@/store/graphDataStore'
// import { renderWithOmnibus } from 'tests/fixtures/omnibusContext'
// import { createGraphConfig } from '@/store/dashboardStore/utils'

// const baseConfig = {
//     channelName: 'Ch1',
//     title: 'Ox Fill',
//     titleColor: 'text-foreground' as const,
//     offset: 0,
//     graphType: 'Graph',
//     displayedHistory: '30s',
// }

// async function openMenu() {
//     await userEvent.click(screen.getByLabelText('Open main menu'))
// }

// describe('SetZeroPointAll', () => {
//     beforeEach(() => {
//         useDashboardStore.setState({ graphConfigs: [], addDataOpen: false })
//         useGraphDataStore.setState({ data: {} })
//     })

//     it('renders "Set Zero Point All" in the menu', async () => {
//         renderWithOmnibus(<MainMenu />)
//         await openMenu()
//         expect(screen.getByText('Set Zero Point All')).toBeInTheDocument()
//     })

//     it('does nothing when there are no graphs', async () => {
//         renderWithOmnibus(<MainMenu />)
//         await openMenu()
//         await userEvent.click(screen.getByText('Set Zero Point All'))
//         expect(useDashboardStore.getState().graphConfigs).toHaveLength(0)
//     })

//     it('sets offset to negative average of data for each graph', async () => {
//         const config1 = createGraphConfig({ ...baseConfig, channelName: 'Ch1' })
//         const config2 = createGraphConfig({ ...baseConfig, channelName: 'Ch2' })
//         useDashboardStore.setState({ graphConfigs: [config1, config2] })
//         useGraphDataStore.setState({
//             data: {
//                 [config1.id]: [
//                     { timestamp: 1, value: 10 },
//                     { timestamp: 2, value: 30 },
//                 ],
//                 [config2.id]: [{ timestamp: 1, value: 100 }],
//             },
//         })

//         renderWithOmnibus(<MainMenu />)
//         await openMenu()
//         await userEvent.click(screen.getByText('Set Zero Point All'))

//         const configs = useDashboardStore.getState().graphConfigs
//         // avg([10, 30]) = 20 → offset = -20
//         expect(configs.find((c) => c.id === config1.id)!.offset).toBe(-20)
//         // avg([100]) = 100 → offset = -100
//         expect(configs.find((c) => c.id === config2.id)!.offset).toBe(-100)
//     })

//     it('skips graphs with no data and preserves their existing offset', async () => {
//         const config = createGraphConfig({ ...baseConfig, offset: 5 })
//         useDashboardStore.setState({ graphConfigs: [config] })
//         // no data registered for this graph

//         renderWithOmnibus(<MainMenu />)
//         await openMenu()
//         await userEvent.click(screen.getByText('Set Zero Point All'))

//         expect(useDashboardStore.getState().graphConfigs[0].offset).toBe(5)
//     })

//     it('rounds offset to 2 decimal places', async () => {
//         const config = createGraphConfig(baseConfig)
//         useDashboardStore.setState({ graphConfigs: [config] })
//         useGraphDataStore.setState({
//             data: { [config.id]: [{ timestamp: 1, value: 1 / 3 }] },
//         })

//         renderWithOmnibus(<MainMenu />)
//         await openMenu()
//         await userEvent.click(screen.getByText('Set Zero Point All'))

//         // -(1/3) rounded to 2dp = -0.33
//         expect(useDashboardStore.getState().graphConfigs[0].offset).toBe(-0.33)
//     })

//     it('updates all graphs in a single action', async () => {
//         const configs = [
//             createGraphConfig({ ...baseConfig, channelName: 'A' }),
//             createGraphConfig({ ...baseConfig, channelName: 'B' }),
//             createGraphConfig({ ...baseConfig, channelName: 'C' }),
//         ]
//         useDashboardStore.setState({ graphConfigs: configs })
//         useGraphDataStore.setState({
//             data: {
//                 [configs[0].id]: [{ timestamp: 1, value: 5 }],
//                 [configs[1].id]: [{ timestamp: 1, value: 10 }],
//                 [configs[2].id]: [{ timestamp: 1, value: 15 }],
//             },
//         })

//         renderWithOmnibus(<MainMenu />)
//         await openMenu()
//         await userEvent.click(screen.getByText('Set Zero Point All'))

//         const result = useDashboardStore.getState().graphConfigs
//         expect(result[0].offset).toBe(-5)
//         expect(result[1].offset).toBe(-10)
//         expect(result[2].offset).toBe(-15)
//     })
// })
