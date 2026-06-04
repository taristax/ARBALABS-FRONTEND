"use client";

import React from "react";

interface TechButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "blue" | "green" | "amber" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function TechButton({
  children,
  onClick,
  variant = "blue",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
}: TechButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    blue:    "bg-[#0ea5e9]/10 hover:bg-[#0ea5e9]/20 border-[#0ea5e9]/30 hover:border-[#0ea5e9]/60 text-[#0ea5e9]",
    green:   "bg-[#10b981]/10 hover:bg-[#10b981]/20 border-[#10b981]/30 hover:border-[#10b981]/60 text-[#10b981]",
    amber:   "bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 border-[#f59e0b]/30 hover:border-[#f59e0b]/60 text-[#f59e0b]",
    danger:  "bg-[#ef4444]/10 hover:bg-[#ef4444]/20 border-[#ef4444]/30 hover:border-[#ef4444]/60 text-[#ef4444]",
    outline: "bg-transparent hover:bg-white/5 border-[#3F3F46] hover:border-[#52525B] text-[#A1A1AA] hover:text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`font-space font-medium tracking-wider uppercase border rounded-[2px] transition-all duration-150 select-none cursor-pointer outline-none active:scale-[0.98] ${
        disabled ? "opacity-40 cursor-not-allowed active:scale-100" : ""
      } ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      <span className="flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}
