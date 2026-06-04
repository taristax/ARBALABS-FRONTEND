"use client";

import React, { useState, useRef, useEffect } from "react";

interface TelemetryChartProps {
  title: string;
  data: number[];
  labels: string[];
  color?: "blue" | "green" | "amber" | "red";
  unit?: string;
  minVal?: number;
  maxVal?: number;
}

export default function TelemetryChart({
  title,
  data,
  labels,
  color = "blue",
  unit = "",
  minVal,
  maxVal,
}: TelemetryChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(500);
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 20;

  // Track size for responsive rendering
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setChartWidth(entry.contentRect.width || 500);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Compute stats
  const min = minVal !== undefined ? minVal : Math.min(...data) * 0.95;
  const max = maxVal !== undefined ? maxVal : Math.max(...data) * 1.05;
  const range = max - min || 1;

  // Get color themes (Muted Aerospace Colors)
  const colorMap = {
    blue: {
      stroke: "#0ea5e9",
      border: "border-sky-500/20",
      text: "text-accent-blue",
    },
    green: {
      stroke: "#10b981",
      border: "border-emerald-500/20",
      text: "text-accent-green",
    },
    amber: {
      stroke: "#eab308",
      border: "border-amber-500/20",
      text: "text-accent-amber",
    },
    red: {
      stroke: "#ef4444",
      border: "border-red-500/20",
      text: "text-accent-red",
    },
  };

  const activeColor = colorMap[color];

  // Map data to SVG points
  const points = data.map((val, idx) => {
    const x = paddingX + (idx * (chartWidth - 2 * paddingX)) / (data.length - 1 || 1);
    const y = chartHeight - paddingY - ((val - min) * (chartHeight - 2 * paddingY)) / range;
    return { x, y, val, label: labels[idx] };
  });

  // Create staircase step line path strings (horizontal then vertical)
  const linePath = points.reduce((acc, p, idx) => {
    if (idx === 0) {
      return `M ${p.x} ${p.y}`;
    }
    return `${acc} H ${p.x} V ${p.y}`;
  }, "");

  // Mouse move handler to find closest point
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Find the point closest to mouseX
    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div ref={containerRef} className="w-full relative bg-[#111111] border border-[#27272A] rounded-[2px] p-3 font-mono">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-space tracking-widest text-[#A1A1AA] uppercase font-semibold">
          {title}
        </span>
        <span className={`text-xs font-mono font-bold ${activeColor.text}`}>
          {data[data.length - 1]}
          <span className="text-[9px] text-[#A1A1AA]/75 font-normal ml-1">{unit}</span>
        </span>
      </div>

      <div className="relative h-[160px] w-full select-none">
        <svg
          width="100%"
          height={chartHeight}
          className="overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Faint horizontal alignment grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingY + ratio * (chartHeight - 2 * paddingY);
            const val = max - ratio * range;
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.025)"
                  strokeDasharray="2,4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="rgba(255, 255, 255, 0.2)"
                  className="text-[8px] font-mono"
                >
                  {Math.round(val * 10) / 10}
                </text>
              </g>
            );
          })}

          {/* Step line stroke */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={activeColor.stroke}
              strokeWidth={1.5}
            />
          )}

          {/* Interactive Hover Indicators */}
          {hoverIndex !== null && points[hoverIndex] && (
            <g>
              {/* Vertical scanning line */}
              <line
                x1={points[hoverIndex].x}
                y1={paddingY}
                x2={points[hoverIndex].x}
                y2={chartHeight - paddingY}
                stroke={activeColor.stroke}
                strokeWidth={1}
                strokeDasharray="2,2"
                opacity={0.6}
              />

              {/* Indicator dot on step line (non-pulsing, solid hardware LED look) */}
              <circle
                cx={points[hoverIndex].x}
                cy={points[hoverIndex].y}
                r={3.5}
                fill={activeColor.stroke}
              />
            </g>
          )}

          {/* Bottom X-axis label markers */}
          {points.length > 0 && (
            <g>
              {/* Start label */}
              <text
                x={paddingX}
                y={chartHeight - 4}
                textAnchor="start"
                fill="rgba(255, 255, 255, 0.2)"
                className="text-[8px] font-mono"
              >
                {points[0].label}
              </text>
              {/* End label */}
              <text
                x={chartWidth - paddingX}
                y={chartHeight - 4}
                textAnchor="end"
                fill="rgba(255, 255, 255, 0.2)"
                className="text-[8px] font-mono"
              >
                {points[points.length - 1].label}
              </text>
            </g>
          )}
        </svg>

        {/* Hover Value Tooltip Overlay (HTML) */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className={`absolute z-25 bg-[#18181B] border border-[#27272A] px-2 py-1 rounded-[2px] text-[9px] pointer-events-none`}
            style={{
              left: `${Math.min(
                Math.max(points[hoverIndex].x - 50, 10),
                chartWidth - 110
              )}px`,
              top: `${Math.max(points[hoverIndex].y - 35, 5)}px`,
            }}
          >
            <div className="text-[#A1A1AA]/60 font-mono leading-none mb-0.5">
              {points[hoverIndex].label}
            </div>
            <div className={`font-bold ${activeColor.text}`}>
              {points[hoverIndex].val}
              <span className="text-[8px] text-[#A1A1AA] font-normal ml-0.5">
                {unit}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

