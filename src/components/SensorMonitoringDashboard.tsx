import { LineGraph } from "./LineGraph";
import { useDAQContext } from "@/context/DAQContext";

export const SensorMonitoringDashboard = () => {
  // Consume DAQ context to get real-time channel data
  const { channelData } = useDAQContext();

  // Map backend channels to dashboard (6 charts from 8 available channels)
  const channels = [
    { name: "Fake0", title: "Sensor 0" },
    { name: "Fake1", title: "Sensor 1" },
    { name: "Fake2", title: "Sensor 2" },
    { name: "Fake3", title: "Sensor 3" },
    { name: "Fake4", title: "Sensor 4" },
    { name: "Fake5", title: "Sensor 5" },
  ];

  return (
    <div className="mb-4">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <LineGraph
            channelName={channels[0].name}
            data={channelData.get(channels[0].name) || []}
            title={channels[0].title}
          />
        </div>
        <div className="flex-1 min-w-0">
          <LineGraph
            channelName={channels[1].name}
            data={channelData.get(channels[1].name) || []}
            title={channels[1].title}
          />
        </div>
        <div className="flex-1 min-w-0">
          <LineGraph
            channelName={channels[2].name}
            data={channelData.get(channels[2].name) || []}
            title={channels[2].title}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <LineGraph
            channelName={channels[3].name}
            data={channelData.get(channels[3].name) || []}
            title={channels[3].title}
          />
        </div>
        <div className="flex-1 min-w-0">
          <LineGraph
            channelName={channels[4].name}
            data={channelData.get(channels[4].name) || []}
            title={channels[4].title}
          />
        </div>
        <div className="flex-1 min-w-0">
          <LineGraph
            channelName={channels[5].name}
            data={channelData.get(channels[5].name) || []}
            title={channels[5].title}
          />
        </div>
      </div>
    </div>
  );
};
