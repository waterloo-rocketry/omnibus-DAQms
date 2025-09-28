"use client";

// imports (currently keeping unused imports)
import { TrendingUp } from "lucide-react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis, Label } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

// import the data from socket.io into chartData (currently dummy data)
const chartData = [
  { time: "00:00", value: 1013.2 },
  { time: "04:00", value: 1012.5 },
  { time: "08:00", value: 1013.8 },
  { time: "12:00", value: 1014.7 },
  { time: "16:00", value: 1014.1 },
  { time: "22:00", value: 1013.4 },
];

// keeping this in case we want to add separate code for mobile (can take out)
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function LineGraph() {
  return (
    <Card>
      <CardHeader className="items-start" >
        <div className="pl-4" > 
          <CardTitle className="text-left pb-2" >Pressure Sensor</CardTitle>
          <CardDescription className="text-left" >Current: 1013.4 hPa | 24h average</CardDescription>
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
              tickFormatter={(value) => `${value} hPa`}
              domain={[1011.5, 1015]}
            >
            </YAxis>

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="value"
              type="natural"
              stroke="none"
              strokeWidth={2}
              dot={{
                fill: "black",
              }}
              activeDot={{
                r: 6,
              }}
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
  );
}
