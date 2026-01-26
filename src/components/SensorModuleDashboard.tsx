import { SensorModule } from './SensorModule'

/**
 * Example dashboard using the new SensorModule component
 * Demonstrates the design from the specification sketch
 */
export const SensorModuleDashboard = () => {
    const sensors = [
        {
            channelName: 'Fake0',
            title: 'Ox Fill (psi)',
            unit: 'psi',
        },
        {
            channelName: 'Fake1',
            title: 'Chamber Temp (°C)',
            unit: '°C',
            titleColor: 'text-orange-500',
        },
        {
            channelName: 'Fake2',
            title: 'Tank Pressure (bar)',
            unit: 'bar',
            titleColor: 'text-blue-500',
        },
        {
            channelName: 'Fake3',
            title: 'Flow Rate (L/s)',
            unit: 'L/s',
            titleColor: 'text-purple-500',
        },
        {
            channelName: 'Fake4',
            title: 'Battery (V)',
            unit: 'V',
            titleColor: 'text-green-500',
        },
        {
            channelName: 'Fake5',
            title: 'Vibration (Hz)',
            unit: 'Hz',
            titleColor: 'text-pink-500',
        },
    ]

    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sensors.map((sensor) => (
                    <SensorModule
                        key={sensor.channelName}
                        channelName={sensor.channelName}
                        title={sensor.title}
                        unit={sensor.unit}
                        titleColor={sensor.titleColor}
                    />
                ))}
            </div>
        </div>
    )
}
