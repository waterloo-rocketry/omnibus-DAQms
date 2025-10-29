"use client";

// imports
import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts";
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

// part of the LinGraphPops
export interface SocketDataPoint {
  timestamp: number;
  data: number;
  relative_timestamps_nanoseconds: number;
  sample_rate: number;
  message_format_version: number;
}

// what is inputted when this component is called
export interface LineGraphProps {
  title: string;
  unit: string;
  data: SocketDataPoint[];  // raw socket data
  yDomain?: [number, number];
  color?: string;
}

// keeping it as desktop for now
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

// component
export function LineGraphInput({
  title,
  unit,
  data,
  yDomain,
  color = "black",
}: LineGraphProps) {
  // transform the raw socket data to something Recharts can plot
  const chartData = data.map((point) => ({
    time: new Date(point.timestamp * 1000).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    value: point.data,
  }));

  const latestValue = data[data.length - 1]?.data ?? "—";

  return (
    <div className="flex-1">
      <Card>
        <CardHeader className="items-start">
          <div className="pl-4">
            <CardTitle className="text-left pb-2">{title}</CardTitle>
            <CardDescription className="text-left">
              Current: {latestValue} {unit}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart
              data={chartData}
              margin={{ top: 20, left: 12, right: 12 }}
            >
              <CartesianGrid vertical />
              <XAxis
                dataKey="time"
                tickLine
                axisLine
                tickMargin={8}
              />
              <YAxis
                tickLine
                axisLine
                tickMargin={8}
                tickFormatter={(value) => `${value} ${unit}`}
                domain={yDomain ?? ["auto", "auto"]}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Line
                dataKey="value"
                type="natural"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color }}
                activeDot={{ r: 6 }}
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Line>
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
