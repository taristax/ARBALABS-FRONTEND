"use client";

import React from "react";

export type StatusType = "online" | "offline" | "processing" | "warning" | "alert";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export default function StatusBadge({
  status,
  label,
  className = "",
}: StatusBadgeProps) {
  const configs = {
    online: {
      dotClass: "bg-accent-green",
      bgClass: "bg-accent-green/10 text-accent-green border-accent-green/20",
      defaultLabel: "ONLINE",
    },
    offline: {
      dotClass: "bg-accent-red",
      bgClass: "bg-accent-red/10 text-accent-red border-accent-red/20",
      defaultLabel: "OFFLINE",
    },
    processing: {
      dotClass: "bg-accent-blue",
      bgClass: "bg-accent-blue/10 text-accent-blue border-accent-blue/20",
      defaultLabel: "PROCESSING",
    },
    warning: {
      dotClass: "bg-accent-amber",
      bgClass: "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
      defaultLabel: "WARNING",
    },
    alert: {
      dotClass: "bg-accent-red",
      bgClass: "bg-accent-red/10 text-accent-red border-accent-red/20",
      defaultLabel: "CRITICAL",
    },
  };

  const current = configs[status] || configs.online;
  const badgeLabel = label || current.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] border text-[10px] font-mono tracking-widest uppercase ${current.bgClass} ${className}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${current.dotClass}`} />
      </span>
      {badgeLabel}
    </span>
  );
}

