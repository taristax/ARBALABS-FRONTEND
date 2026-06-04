"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Settings } from "lucide-react";
import Header from "@/components/layout/Header";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isMonitoring = pathname.includes("/workspace/monitoring");
  const isManagement = pathname.includes("/workspace/management");

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />

      {/* Tab Bar */}
      <div className="w-full border-b border-[#27272A] bg-black px-4">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/workspace/monitoring">
              <span
                className={`inline-flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-space font-medium tracking-wider uppercase transition-all duration-150 cursor-pointer select-none ${
                  isMonitoring
                    ? "border-white text-white"
                    : "border-transparent text-[#A1A1AA] hover:text-white"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Monitoring
              </span>
            </Link>

            <Link href="/workspace/management">
              <span
                className={`inline-flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-space font-medium tracking-wider uppercase transition-all duration-150 cursor-pointer select-none ${
                  isManagement
                    ? "border-white text-white"
                    : "border-transparent text-[#A1A1AA] hover:text-white"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Management
              </span>
            </Link>
          </div>

          {/* Status Indicators */}
          <div className="hidden md:flex items-center gap-5 text-[10px] font-mono text-[#A1A1AA] uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              AI Verification: NOMINAL
            </div>
            <div className="flex items-center gap-1.5 border-l border-[#27272A] pl-5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
              Telemetry: LIVE
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-6 flex flex-col">
        {children}
      </main>
    </div>
  );
}
