"use client";

import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "blue" | "green" | "amber";
  title?: string;
  headerAction?: React.ReactNode;
}

export default function GlassCard({
  children,
  className = "",
  title,
  headerAction,
}: GlassCardProps) {
  return (
    <div className={`glass-panel p-4 ${className}`}>
      {title && (
        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
          <h3 className="font-space text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A1A1AA]">
            {title}
          </h3>
          {headerAction && <div className="text-xs">{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
