import D3LineGraph from "../D3LineGraph";
import { useState } from "react";
import type { SensorPlot } from "./types";

export const SensorMonitoringDashboard = () => {
  // Map backend channels to dashboard (6 charts from 8 available channels)
  const channels: SensorPlot[] = [
    { name: "Fake0", title: "Sensor 0" },
    { name: "Fake1", title: "Sensor 1" },
    { name: "Fake2", title: "Sensor 2" },
    { name: "Fake3", title: "Sensor 3" },
    { name: "Fake4", title: "Sensor 4" },
    { name: "Fake5", title: "Sensor 5" },
  ];

   // State stores currently active plots on dashboard
  const [activePlots, setActivePlots] = useState<SensorPlot[]>(channels);

  return (
  // Responsive grid layout has max 4 columns on large displays
    <div className="max-h-[80vh] overflow-y-auto grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 gap-4">
        {activePlots.map(plot => (
          <div
            key={plot.name}
            className="max-h-[25vh] overflow-hidden">
            <D3LineGraph
              channelName={plot.name}
              title={plot.title}
            />
          </div>
          ))}
    </div>
  );
};
