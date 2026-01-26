import { useMemo, useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import D3Chart from "@/components/d3Chart";
import type { DataPoint } from "@/types/omnibus";
import { useLastDatapointStore, type LatestDataPoint } from "@/store/omnibusStore";

interface D3LineGraphProps {
    channelName: string;
    title?: string;
    unit?: string;
    width?: number;
    height?: number;
    strokeColor?: string;
    strokeWidth?: number;
    rangeTickCount?: number;
    fixedDomain?: [number, number];
    domainTickCount?: number;
    timeRangeSec?: number;
    maxDataPoints?: number;
}

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
  timeRangeSec = 60,
  maxDataPoints = 100,
}: D3LineGraphProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const prevChannelRef = useRef(channelName);

  useEffect(() => {
    const cutoffTime = Date.now() - timeRangeSec * 1000;
    setData((prev) => prev.filter((point) => point.timestamp >= cutoffTime).slice(-maxDataPoints));
  }, [timeRangeSec, maxDataPoints]);

  useEffect(() => {
    if (prevChannelRef.current !== channelName) {
      setData([]);
    }
    prevChannelRef.current = channelName;

    const unsubscribe = useLastDatapointStore.subscribe(
      (state) => state.series[channelName],
      (newDataPoint: LatestDataPoint | undefined) => {
        if (!newDataPoint) return;

        const cutoffTime = Date.now() - timeRangeSec * 1000;
        setData((prev) =>
          [...prev, newDataPoint]
            .filter((point) => point.timestamp >= cutoffTime)
            .slice(-maxDataPoints)
        );
      }
    );
    return unsubscribe;
  }, [channelName, timeRangeSec, maxDataPoints]);

  const currentValue = useMemo(() => {
    if (data.length === 0) return null;
    return data[data.length - 1].value;
  }, [data]);

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
