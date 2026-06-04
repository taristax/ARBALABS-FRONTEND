"use client";

import React from "react";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  variant?: "blue" | "green" | "amber";
  title?: string;
  showText?: boolean;
}

export default function ProgressRing({
  percentage,
  size = 80,
  strokeWidth = 6,
  variant = "blue",
  title,
  showText = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    blue: {
      stroke: "stroke-accent-blue",
      text: "text-accent-blue",
    },
    green: {
      stroke: "stroke-accent-green",
      text: "text-accent-green",
    },
    amber: {
      stroke: "stroke-accent-amber",
      text: "text-accent-amber",
    },
  };

  const current = colors[variant];

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG Circle Gauge */}
        <svg className="w-full h-full transform -rotate-90">
          {/* Background track */}
          <circle
            className="stroke-slate-800"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Active progress track */}
          <circle
            className={`${current.stroke} transition-all duration-500 ease-out`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="butt"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>

        {/* Floating text inside circle */}
        {showText && (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-semibold">
            <span className={`${current.text}`}>{percentage}%</span>
          </div>
        )}
      </div>

      {title && (
        <span className="text-[10px] font-space tracking-widest text-slate-400 mt-2 uppercase font-medium">
          {title}
        </span>
      )}
    </div>
  );
}

