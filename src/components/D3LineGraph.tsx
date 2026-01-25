import { useMemo, useRef, useEffect, useReducer } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import D3Chart from "@/components/ui/d3Chart";
import type { DataPoint } from "@/types/omnibus";
import { useOmnibusStore } from "@/store/omnibusStore";

/**
 * LineGraph component props
*/

interface D3LineGraphProps {
    channelName: string;
    title?: string;
    unit?: string;
    width?: number;
    height?: number;
    strokeColor?: string;
    strokeWidth?: number;
    rangeTickCount?: number; // MUST BE > 0
    fixedDomain?: [number, number];
    domainTickCount?: number; //MUST BE > 0

    maxDataPoints?: number; // Maximum number of data points to keep in history
}

// Chart configuration
const chartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-1)",
  },
} as const;

export default function D3LineGraph({
  channelName,
  title,
  unit = "",
  width = 700,
  height = 260,
  strokeColor = "var(--chart-1)",
  strokeWidth = 2,
  rangeTickCount = 5,
  fixedDomain,
  domainTickCount = 5,
  maxDataPoints = 100,
}: D3LineGraphProps) {
  // Subscribe to ONLY this channel's latest value + timestamp from Zustand
  const latestDataPoint = useOmnibusStore((s) => s.channels[channelName]);

  // Store history locally in ref (persists across renders, doesn't trigger re-renders)
  const historyRef = useRef<DataPoint[]>([]);

  // Force re-render when history updates
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  // When new value arrives, add to local history
  useEffect(() => {
  if (latestDataPoint !== undefined) {
    const newPoint: DataPoint = {
    timestamp: latestDataPoint.timestamp,
    value: latestDataPoint.value,
    };

    // Prevent duplicates by checking last timestamp
    const lastPoint = historyRef.current[historyRef.current.length - 1];
    if (lastPoint && lastPoint.timestamp === newPoint.timestamp && lastPoint.value === newPoint.value) {
        return;
    }

    // Update history (keep last N points)
    historyRef.current = [...historyRef.current, newPoint].slice(-maxDataPoints);

    // Force re-render to display new data
    forceUpdate();
  }
  }, [latestDataPoint, maxDataPoints]);

  // Use local history instead of prop data
  const data = historyRef.current;

  // Get current value for display
  const currentValue = useMemo(() => {
  if (data.length === 0) return null;
  return data[data.length - 1].value;
  }, [data]);

  // Prepare display title and description
  const displayTitle = title || channelName;
  const displayDescription = currentValue !== null ? `Current: ${currentValue.toFixed(2)} ${unit}` : "No data";

  const rangeTickCountNew = rangeTickCount > 0 ? rangeTickCount : 5;
  const domainTickCountNew = domainTickCount > 0 ? domainTickCount : 5;

  if (rangeTickCount <= 0 || domainTickCount <= 0) {
    console.warn("rangeTickCount and domainTickCount must be > 0; using defaults (5)");
  }
  
  return (
  <Card>
      <CardHeader className="items-start">
      <div className="pl-4">
          <CardTitle className="text-left pb-2">{displayTitle}</CardTitle>
          <CardDescription className="text-left">{displayDescription}</CardDescription>
      </div>
      </CardHeader>
      <CardContent>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <D3Chart data={data} width={width} height={height} unit={unit} strokeColor={strokeColor} strokeWidth={strokeWidth} rangeTickCount={rangeTickCountNew} fixedDomain={fixedDomain} domainTickCount={domainTickCountNew} />
      </ChartContainer>
      </CardContent>
  </Card>
  );
}
