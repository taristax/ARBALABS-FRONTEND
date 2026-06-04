"use client";

import React from "react";

interface GridBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  showScanner?: boolean;
}

export default function GridBackground({
  children,
  className = "",
}: GridBackgroundProps) {
  return (
    <div className={`relative w-full min-h-screen bg-black tech-grid overflow-hidden ${className}`}>
      {/* Page Content */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}

