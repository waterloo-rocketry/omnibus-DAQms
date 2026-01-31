import D3LineGraph from "./D3LineGraph";

import { Button } from "./ui/button.tsx"
import { Ellipsis, Plus, SquarePen, Trash2 } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent} from "./ui/popover";

export const SensorMonitoringDashboard = () => {
    // Map backend channels to dashboard (6 charts from 8 available channels)
    const channels = [
        { name: 'Fake0', title: 'Sensor 0' },
        { name: 'Fake1', title: 'Sensor 1' },
        { name: 'Fake2', title: 'Sensor 2' },
        { name: 'Fake3', title: 'Sensor 3' },
        { name: 'Fake4', title: 'Sensor 4' },
        { name: 'Fake5', title: 'Sensor 5' },
    ]

    /*const handleMoreOnClick = () => {
      
    }*/

  return (
    <div className="mb-4">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <D3LineGraph
            channelName={channels[0].name}
            title={channels[0].title}
          />
        </div>
        <div className="flex-1 min-w-0">
          <D3LineGraph
            channelName={channels[1].name}
            title={channels[1].title}
          />
        </div>
        <div className="flex-1 min-w-0">
          <D3LineGraph
            channelName={channels[2].name}
            title={channels[2].title}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <D3LineGraph
            channelName={channels[3].name}
            title={channels[3].title}
          />
        </div>
        <div className="flex-1 min-w-0">
          <D3LineGraph
            channelName={channels[4].name}
            title={channels[4].title}
          />
        </div>
        <div className="flex-1 min-w-0">
          <D3LineGraph
            channelName={channels[5].name}
            title={channels[5].title}
          />
        </div>

      </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="fixed bottom-6 right-6 z-50 w-12 h-12">
              <Ellipsis className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            sideOffset={10}
            className="w-80 p-0"
          >
            <div className="grid">
              {/* Buttons area: fixed height, split into 4 equal rows */}
              <div className="h-48 grid grid-rows-4">
                <Button className="w-full h-full justify-start">
                  <Plus className="mr-2 h-4 w-4" /> Add Data
                </Button>
                <Button className="w-full h-full justify-start">
                  <SquarePen className="mr-2 h-4 w-4" /> Edit Data
                </Button>
                <Button className="w-full h-full justify-start text-red-500">
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
                <div>
                  <h3 className="text-2xl">DAQms</h3>
                  <p>Build 45df2c3</p>
                  <p>2025 Waterloo Rocketry</p>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
    </div>
  );
};
