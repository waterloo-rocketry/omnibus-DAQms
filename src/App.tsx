import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import OmnibusProvider from './components/OmnibusProvider'
import { SensorModuleDashboard } from "./components/SensorModuleDashboard";
export default function App() {
    return (
        <OmnibusProvider>
            <BrowserRouter>
                <NavBar />
                <div className="p-4 md:p-6 lg:p-8 max-w-[1800px] mx-auto mt-4">
                    <Routes>
                        <Route path="/live-data" element={<SensorModuleDashboard />} />
                        <Route path="/historical" element={<div>Historical Page</div>} />
                        <Route path="/alerts" element={<div>Alerts Page</div>} />
                        <Route path="/settings" element={<div>Settings Page</div>} />
                    </Routes>
                </div>
            </BrowserRouter>
        </OmnibusProvider>
    )
}
