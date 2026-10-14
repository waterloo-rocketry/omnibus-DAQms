import OmnibusProvider from './components/OmnibusProvider'
import { LiveDataDashboard } from './components/LiveDataDashboard'
import { MainMenu } from './components/MainMenu'

export default function App() {
    return (
        <OmnibusProvider>
            <div className="p-4 md:p-6 lg:p-8 max-w-[1800px] mx-auto">
                <LiveDataDashboard />
            </div>
            <MainMenu />
        </OmnibusProvider>
    )
}
