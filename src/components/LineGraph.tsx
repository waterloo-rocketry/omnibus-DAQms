"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { ChartDataPoint } from "@/types/daq";

/**
 * LineGraph component props
 */
interface LineGraphProps {
  channelName: string;
  data: ChartDataPoint[];
  title?: string;
  unit?: string;
}

// Chart configuration
const chartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function LineGraph({ channelName, data, title, unit = "" }: LineGraphProps) {
  // Transform data for Recharts with memoization
  const chartData = useMemo(() => {
    return data.map((point) => ({
      time: new Date(point.timestamp).toLocaleTimeString(),
      value: point.value,
    }));
  }, [data]);

  // Calculate current value and Y-axis domain
  const currentValue = useMemo(() => {
    if (data.length === 0) return null;
    return data[data.length - 1].value;
  }, [data]);

  const yDomain = useMemo(() => {
    if (data.length === 0) return [0, 1];
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1 || 0.1; // 10% padding or 0.1 if all values are same
    return [min - padding, max + padding];
  }, [data]);

  const displayTitle = title || channelName;
  const displayDescription = currentValue !== null
    ? `Current: ${currentValue.toFixed(2)} ${unit}`
    : "No data";

  return (
    <Card>
      <CardHeader className="items-start">
        <div className="pl-4">
          <CardTitle className="text-left pb-2">{displayTitle}</CardTitle>
          <CardDescription className="text-left">{displayDescription}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={true} />
            <XAxis
              dataKey="time"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <YAxis
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              tickFormatter={(value) => `${value.toFixed(2)} ${unit}`}
              domain={yDomain as [number, number]}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="value"
              type="natural"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{
                fill: "var(--chart-1)",
                r: 3,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
