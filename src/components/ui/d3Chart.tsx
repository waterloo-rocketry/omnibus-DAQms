import { useRef, useMemo, useLayoutEffect } from "react"; // Changed to useLayoutEffect as it runs before useEffect
import * as d3 from 'd3';
import type { DataPoint } from "@/types/omnibus";

interface D3ChartProps {
    data: DataPoint[];
    width?: number;
    height?: number;
    unit?: string;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    strokeColor?: string;
    strokeWidth?: number;
    rangeTickCount?: number; // MUST BE > 0
    fixedDomain?: [number, number];
    domainTickCount?: number; //MUST BE > 0
    title?: string;
    scaleType?: 'linear' | 'log';
}

export default function D3Chart({
    data, 
    width = 700, 
    height = 260, 
    unit = "",
    margin = { top: 10, right: 33, bottom: 24, left: 56 },
    strokeColor = "var(--chart-1)",
    strokeWidth = 2,
    fixedDomain,
    rangeTickCount = 5,
    domainTickCount = 5,
    scaleType = 'linear',
    title = "D3 Line Chart"
}: D3ChartProps) {
    const { top = 10, right = 33, bottom = 24, left = 56 } = margin;

    const innerW = Math.max(0, width - left - right);
    const innerH = Math.max(0, height - top - bottom);

    const yAxisRef = useRef<SVGGElement | null>(null);

    // X scale
    const xScale = useMemo(() => {
        const times = data.map((d) => new Date(d.timestamp));
        const domain = d3.extent(times) as [Date, Date];
        return d3.scaleTime().domain(domain).range([0, innerW]);
    }, [data, innerW]);

    // Fixed Pos X Ticks
    const xTicks = useMemo(() => {
        const domain = xScale.domain();
        const [d0, d1] = domain as [Date, Date];
        const fmt = d3.timeFormat("%I:%M:%S %p"); // 12-hour format
        const ticks: { x: number; t: Date; label: string }[] = [];

        for (let i = 0; i < domainTickCount; i++) {
            let frac = 0;
            if (domainTickCount === 1){
                frac = 0.5; //center tick
            }
            else if (domainTickCount > 1){
                frac = i / (domainTickCount - 1); // evenly spaced
            }
            const timestamp = new Date(d0.getTime() + frac * (d1.getTime() - d0.getTime()));
            const x_val = frac * innerW;
            ticks.push({ x: x_val, t: timestamp, label: fmt(timestamp) });
        }
        return ticks;
    }, [xScale, innerW, domainTickCount]);

    // Y scale
    const yScale = useMemo(() => {
        // Use fixed domain if provided
        if (fixedDomain && fixedDomain.length === 2) {
            if (scaleType === 'log') {
                return d3.scaleLog().domain(fixedDomain).range([innerH, 0]);
            }
            else {
                return d3.scaleLinear().domain(fixedDomain).range([innerH, 0]);
            }
        }

        // No data loaded yet
        if (data.length === 0){
            if (scaleType === 'log') {
                return d3.scaleLog().domain([0, 1]).range([innerH, 0]);
            }
            else {
                return d3.scaleLinear().domain([0, 1]).range([innerH, 0]);
            }
        }

        const values = data.map((d) => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.1;

        if (scaleType === 'log') {
            return d3.scaleLog().domain([min - padding, max + padding]).range([innerH, 0]);
        }
        else {
            return d3.scaleLinear().domain([min - padding, max + padding]).range([innerH, 0]);
        }
    }, [data, innerH, fixedDomain, scaleType]);

    // Latest Value
    const latestValue = useMemo(() => {
        if (data.length === 0) return null;
        return data[data.length - 1].value;
    }, [data]);

    // Line path
    const pathD = useMemo(() => {
        const line = d3.line<DataPoint>()
        .defined((d: DataPoint) => d != null && !Number.isNaN(d.value))
        .x((d: DataPoint) => xScale(new Date(d.timestamp)))
        .y((d: DataPoint) => yScale(d.value))
        .curve(d3.curveMonotoneX);
        return data.length ? (line(data) ?? "") : "";
    }, [data, xScale, yScale]);

    // Render y-axis using D3
    useLayoutEffect(() => {
        if (!yAxisRef.current) return;
        const yAxis = d3.axisLeft<number>(yScale).ticks(rangeTickCount).tickFormat((v: number) => Number(v).toFixed(2));
        d3.select(yAxisRef.current).call(yAxis as any);
        d3.select(yAxisRef.current).selectAll("text").attr("font-size", 11).attr("fill", "var(--muted-foreground)");
    }, [yScale, rangeTickCount, innerH, scaleType]);

    return (
        <svg width={width} height={height} aria-label={title} role="img">
        
            <g transform={`translate(${margin.left},${top})`}>

                {/* Title */}
                <text
                    x={innerW / 2}
                    y={top / 2}
                    textAnchor="middle"
                    style={{ fontSize: 15, fontWeight: 600, fill: "currentColor" }}
                >
                    {title}
                </text>

                {/* Latest Value Display */}
                {latestValue !== null && (
                    <text
                        x={innerW - 4}
                        y={top / 2}
                        textAnchor="end"
                        style={{ fontSize: 13, fill: "var(--muted-foreground)" }}
                    >
                        {`Latest: ${latestValue.toFixed(2)} ${unit}`}
                    </text>
                )}

                {/* Horizontal y-axis stuff */}
                <g aria-hidden="true">
                    {/* Y-axis grid lines (tick labels already rendered by D3) */}
                    {yScale.ticks(5).map((v: number, i: number) => (
                        <g key={`gy-${i}`} transform={`translate(0, ${yScale(v)})`}>
                            <line x1={0} x2={innerW} y1={0} y2={0} stroke="rgba(0,0,0,0.06)" />
                        </g>
                    ))}
                </g>

                {/* Data path */}
                <path d={pathD} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />

                {/* Points */}
                <g>
                {data.map((d, i) => (
                    <circle key={`p-${i}`} cx={xScale(new Date(d.timestamp))} cy={yScale(d.value)} r={2} fill={strokeColor} />
                ))}
                </g>

                {/* X axis manual fixed-position ticks */}
                <g transform={`translate(0, ${innerH})`} aria-hidden="true">
                    {/* baseline */}
                    <line x1={0} x2={innerW} y1={0} y2={0} stroke="rgba(0, 0, 0, 1)" />
                    {xTicks.map((tk, i) => (
                        <g key={`xt-${i}`} transform={`translate(${tk.x},0)`}>
                            <line x1={0} x2={0} y1={0} y2={6} stroke="rgba(0, 0, 0, 1)" /> {/* tick line */}
                            <text x={0} y={16} textAnchor="middle" style={{ fontSize: 11, fill: "var(--muted-foreground)" }}>
                                {tk.label}
                            </text>
                        </g>
                    ))}
                </g>
                <g ref={yAxisRef as any} />
            </g>
        </svg>
    );

}