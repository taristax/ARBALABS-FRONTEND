"use client";

import React, { useState, useEffect, useMemo } from "react";
import SatelliteGlobe from "@/components/globe/SatelliteGlobe";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import DataLabel from "@/components/ui/DataLabel";
import ProgressRing from "@/components/ui/ProgressRing";
import TelemetryChart from "@/components/telemetry/TelemetryChart";
import { useWebSocketTelemetry, WSEventLog } from "@/hooks/useWebSocketTelemetry";
import { useTLEPosition } from "@/hooks/useTLEPosition";
import { Activity, Cpu, Filter, RefreshCw } from "lucide-react";

// Mock telemetry history data (1H/6H/24H/7D)
const TELEMETRY_DATA = {
  "1H": {
    labels: ["12:00", "12:05", "12:10", "12:15", "12:20", "12:25", "12:30", "12:35", "12:40", "12:45", "12:50", "12:55"],
    radiation: [0.12, 0.13, 0.15, 0.18, 0.14, 0.13, 0.15, 0.17, 0.19, 0.22, 0.18, 0.15],
    temperature: [22.4, 22.8, 23.1, 23.5, 23.8, 23.6, 23.4, 23.2, 23.5, 23.9, 24.1, 23.8],
    power: [98, 97, 97, 96, 96, 95, 96, 97, 98, 98, 97, 96],
  },
  "6H": {
    labels: ["07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"],
    radiation: [0.10, 0.11, 0.14, 0.25, 0.28, 0.18, 0.12, 0.14, 0.16, 0.20, 0.18, 0.15],
    temperature: [20.1, 21.5, 22.4, 23.6, 24.8, 24.2, 23.0, 22.5, 22.9, 23.8, 24.1, 23.8],
    power: [99, 98, 96, 94, 93, 94, 96, 97, 98, 98, 97, 96],
  },
  "24H": {
    labels: ["13:00", "15:00", "17:00", "19:00", "21:00", "23:00", "01:00", "03:00", "05:00", "07:00", "09:00", "11:00"],
    radiation: [0.11, 0.13, 0.16, 0.18, 0.21, 0.32, 0.44, 0.25, 0.15, 0.12, 0.14, 0.15],
    temperature: [24.5, 24.1, 23.2, 22.1, 20.4, 18.5, 17.2, 18.9, 21.2, 22.8, 23.5, 23.8],
    power: [95, 97, 98, 99, 99, 97, 95, 93, 91, 92, 94, 96],
  },
  "7D": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    radiation: [0.14, 0.18, 0.25, 0.16, 0.15, 0.22, 0.15],
    temperature: [22.8, 23.5, 24.9, 21.4, 22.0, 23.1, 23.8],
    power: [97, 95, 94, 96, 98, 97, 96],
  },
};

const INITIAL_EVENTS: WSEventLog[] = [
  { id: "evt-1", time: "12:54:10", category: "milestone", message: "ORBITAL INSERTION BURN CONFIRMED", details: "Apogee locked at 786 km. Sun-synchronous orbit established." },
  { id: "evt-2", time: "12:52:05", category: "info",      message: "ARBAEDGE INFERENCE NOMINAL (96.4%)", details: "Visual classification model running on edge tensor cores." },
  { id: "evt-3", time: "12:48:32", category: "warning",   message: "RADIATION INCREASE DETECTED",        details: "Sensor reading at 0.22 mSv/h. Shielding thresholds nominal." },
  { id: "evt-4", time: "12:40:15", category: "info",      message: "BATTERY CHARGE MATRIX OPTIMIZED",    details: "Solar cell alignment calibrated. Efficiency at 94.2%." },
  { id: "evt-5", time: "12:31:00", category: "critical",  message: "ARBAEDGE CORE TEMP EXCEEDED",        details: "Edge unit reached 48.2°C. Shifting to secondary cores." },
  { id: "evt-6", time: "12:15:22", category: "milestone", message: "ORBITAL CORRECTION BURN SUCCESSFUL", details: "Thrusters fired 1.4s. Apogee adjusted to 786 km." },
  { id: "evt-7", time: "12:02:40", category: "info",      message: "PROVENANCE SHA-256 VERIFIED",        details: "Onboard integrity fingerprint matches reference hash." },
];

const EVENT_BORDER: Record<WSEventLog["category"], string> = {
  info:      "border-l-[#0ea5e9]",
  warning:   "border-l-[#f59e0b]",
  critical:  "border-l-[#ef4444]",
  milestone: "border-l-[#10b981]",
};

const EVENT_TITLE: Record<WSEventLog["category"], string> = {
  info:      "text-[#0ea5e9]",
  warning:   "text-[#f59e0b]",
  critical:  "text-[#ef4444] font-bold",
  milestone: "text-[#10b981] font-bold",
};

export default function MonitoringPage() {
  const [selectedRange, setSelectedRange] = useState<"1H" | "6H" | "24H" | "7D">("1H");
  const [liveSatellite, setLiveSatellite] = useState({ alt: 786, vel: 26640 });
  const [eventFilter, setEventFilter] = useState<"all" | "info" | "warning" | "critical" | "milestone">("all");
  const [events, setEvents] = useState<WSEventLog[]>(INITIAL_EVENTS);

  // Real-time mock telemetry at 1Hz
  const { metrics, connected: wsConnected, log: wsLog } = useWebSocketTelemetry();

  // Real orbital positions from CelesTrak TLE
  const { sentinel2A, sentinel2B } = useTLEPosition();

  useEffect(() => {
    if (wsLog) setEvents((prev) => [wsLog, ...prev.slice(0, 14)]);
  }, [wsLog]);

  const filteredEvents = useMemo(() => {
    if (eventFilter === "all") return events;
    return events.filter((e) => e.category === eventFilter);
  }, [events, eventFilter]);

  // Live telemetry merged with history
  const chartData = useMemo(() => {
    const h = TELEMETRY_DATA[selectedRange];
    const rad = [...h.radiation]; rad[rad.length - 1] = metrics.radiation;
    const tmp = [...h.temperature]; tmp[tmp.length - 1] = metrics.temp;
    const pwr = [...h.power]; pwr[pwr.length - 1] = metrics.power;
    return { labels: h.labels, radiation: rad, temperature: tmp, power: pwr };
  }, [selectedRange, metrics]);

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0">

      {/* TOP ROW: Orbital Tracking + AI Status — side by side, balanced */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Orbital Tracking — 3/5 width */}
        <GlassCard
          title="ORBITAL TRACKING"
          className="lg:col-span-3 flex flex-col p-0 overflow-hidden"
          headerAction={
            <div className="flex gap-2 pr-4 pt-4">
              <StatusBadge status={wsConnected ? "online" : "offline"} label={wsConnected ? "LIVE" : "OFFLINE"} />
              <StatusBadge status="processing" label="POSITION SYNC" />
            </div>
          }
        >
          <div className="relative w-full h-[280px]">
            <SatelliteGlobe
              onSatelliteUpdate={(pos) => setLiveSatellite({ alt: pos.alt, vel: pos.vel })}
              panelMode
              sentinel2A={sentinel2A}
              sentinel2B={sentinel2B}
            />

            {/* Telemetry readout overlay */}
            <div className="absolute bottom-4 right-4 z-10 bg-black/80 border border-[#27272A] px-3 py-2.5 rounded-[2px] font-mono text-[10px] space-y-1.5">
              <div className="text-[#52525B] uppercase tracking-widest text-[8px] border-b border-[#27272A] pb-1 mb-1">
                Live Telemetry
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-[#A1A1AA]">ALTITUDE</span>
                <span className="text-white font-bold font-data">{liveSatellite.alt} km</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-[#A1A1AA]">VELOCITY</span>
                <span className="text-white font-bold font-data">{liveSatellite.vel.toLocaleString("en-US")} km/h</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-[#A1A1AA]">ORBIT</span>
                <span className="text-white">SSO / 786 km</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* AI Edge Status — 2/5 width */}
        <GlassCard
          title="ARBAEDGE V4 — ORBIT MONITOR"
          className="lg:col-span-2"
          headerAction={
            <StatusBadge status="processing" label="INFERENCE ACTIVE" />
          }
        >
          <div className="space-y-5">
            {/* Device Identity */}
            <div className="flex items-center gap-3 p-3 bg-black/40 border border-[#27272A] rounded-[2px]">
              <div className="p-2 border border-[#27272A] rounded-[2px] bg-black/60">
                <Cpu className="w-5 h-5 text-[#A1A1AA]" />
              </div>
              <div>
                <p className="text-[9px] font-mono text-[#52525B] uppercase">Edge Intelligence Node</p>
                <p className="text-xs font-space font-semibold text-white uppercase tracking-wide">ARBAEDGE-CORE-LEO-01</p>
                <p className="text-[10px] font-mono text-accent-green mt-0.5">Processing visual grid classification...</p>
              </div>
            </div>

            {/* Compute Rings */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-[#27272A] rounded-[2px] flex flex-col items-center gap-2">
                <ProgressRing percentage={metrics.aiLoad} size={60} strokeWidth={4} variant="green" showText />
                <span className="text-[9px] font-space text-[#A1A1AA] uppercase tracking-wider">Compute</span>
              </div>
              <div className="p-3 border border-[#27272A] rounded-[2px] flex flex-col items-center gap-2">
                <ProgressRing percentage={metrics.aiMemory} size={60} strokeWidth={4} variant="blue" showText />
                <span className="text-[9px] font-space text-[#A1A1AA] uppercase tracking-wider">Memory</span>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="space-y-0">
              <DataLabel label="Inference Rate" value={metrics.inferenceRate} unit=" FPS" />
              <DataLabel label="Onboard Model" value="ResNet50-ArbaEdge" />
              <DataLabel label="Active Grid Targets" value="14 Sectors" />
            </div>

            {/* Verification Status */}
            <div className="flex items-center justify-between p-3 border border-[#27272A] rounded-[2px] bg-black/40">
              <div>
                <p className="text-[9px] font-mono text-[#52525B] uppercase mb-1">AI Model Integrity</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-green" />
                  <span className="text-sm font-space font-bold text-accent-green uppercase tracking-wider">VERIFIED</span>
                </div>
              </div>
              <Activity className="w-5 h-5 text-[#3F3F46]" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* BOTTOM ROW: Telemetry Charts + Mission Feed — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Telemetry Charts — 3/5 width */}
        <GlassCard
          title="SATELLITE SYSTEMS TELEMETRY"
          className="lg:col-span-3"
          headerAction={
            <div className="flex items-center gap-3">
              <div className="flex bg-black border border-[#27272A] rounded-[2px] overflow-hidden">
                {(["1H", "6H", "24H", "7D"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRange(r)}
                    className={`px-2.5 py-1 text-[9px] font-mono tracking-wider transition-colors uppercase ${
                      selectedRange === r
                        ? "bg-[#27272A] text-white"
                        : "text-[#A1A1AA] hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <RefreshCw className="w-3.5 h-3.5 text-[#52525B] hover:text-white cursor-pointer transition-colors" />
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TelemetryChart
              title="RADIATION DENSITY"
              data={chartData.radiation}
              labels={chartData.labels}
              color={metrics.radiation > 0.35 ? "red" : metrics.radiation > 0.22 ? "amber" : "blue"}
              unit="mSv/h"
              minVal={0.05}
              maxVal={0.5}
            />
            <TelemetryChart
              title="STRUCTURE TEMPERATURE"
              data={chartData.temperature}
              labels={chartData.labels}
              color={metrics.temp > 24 ? "amber" : "green"}
              unit="°C"
              minVal={15}
              maxVal={30}
            />
            <TelemetryChart
              title="MAIN POWER BUS"
              data={chartData.power}
              labels={chartData.labels}
              color="blue"
              unit="%"
              minVal={80}
              maxVal={100}
            />
          </div>
        </GlassCard>

        {/* Mission Event Feed — 2/5 width */}
        <GlassCard
          title="MISSION EVENT FEED"
          className="lg:col-span-2 flex flex-col"
          headerAction={
            <div className="flex items-center gap-1 bg-black/40 border border-[#27272A] rounded-[2px] p-0.5">
              <Filter className="w-3 h-3 text-[#52525B] mx-1" />
              {(["all", "info", "warning", "critical", "milestone"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setEventFilter(f)}
                  className={`px-1.5 py-0.5 text-[8px] font-mono tracking-wider transition-colors rounded-[2px] uppercase ${
                    eventFilter === f
                      ? "bg-[#27272A] text-white"
                      : "text-[#52525B] hover:text-[#A1A1AA]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          }
        >
          <div className="flex-1 overflow-y-auto max-h-[400px] space-y-2 custom-scrollbar">
            {filteredEvents.length === 0 ? (
              <p className="text-center py-8 text-[#52525B] text-xs font-mono uppercase">
                No events for filter &quot;{eventFilter}&quot;
              </p>
            ) : (
              filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`border-l-2 pl-3 pr-2 py-2.5 border border-[#27272A] rounded-r-[2px] ${EVENT_BORDER[evt.category]}`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className={`text-[10px] tracking-wide uppercase font-semibold leading-tight ${EVENT_TITLE[evt.category]}`}>
                      {evt.message}
                    </span>
                    <span className="text-[8px] text-[#52525B] flex-shrink-0 font-mono">{evt.time}</span>
                  </div>
                  {evt.details && (
                    <p className="text-[9px] text-[#A1A1AA] leading-relaxed font-mono">{evt.details}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
