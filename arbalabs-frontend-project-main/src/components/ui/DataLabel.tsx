"use client";

import React from "react";

interface DataLabelProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  live?: boolean;
  className?: string;
}

export default function DataLabel({
  label,
  value,
  unit,
  trend,
  trendValue,
  className = "",
}: DataLabelProps) {
  return (
    <div className={`flex justify-between items-center py-2 border-b border-[#27272A] ${className}`}>
      <span className="text-[11px] font-space tracking-wider text-[#A1A1AA] uppercase">
        {label}
      </span>
      <div className="flex items-baseline gap-1 font-data">
        <span className="text-sm font-semibold font-mono text-white">{value}</span>
        {unit && <span className="text-[10px] text-[#52525B] font-mono">{unit}</span>}
        {trend && (
          <span
            className={`text-[9px] font-mono ml-1.5 ${
              trend === "up"
                ? "text-accent-green"
                : trend === "down"
                ? "text-accent-red"
                : "text-[#A1A1AA]"
            }`}
          >
            {trend === "up" ? "▲" : trend === "down" ? "▼" : "—"}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}
