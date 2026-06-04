"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SatelliteGlobe from "@/components/globe/SatelliteGlobe";
import TechButton from "@/components/ui/TechButton";
import { useTLEPosition } from "@/hooks/useTLEPosition";
import { ArrowRight } from "lucide-react";

const LAUNCH_DATE = new Date("2026-06-10T12:00:00Z");

function useCountdown() {
  const [time, setTime] = useState({ days: "000", hours: "00", minutes: "00", seconds: "00" });
  useEffect(() => {
    const tick = () => {
      const diff = LAUNCH_DATE.getTime() - Date.now();
      if (diff <= 0) { setTime({ days: "000", hours: "00", minutes: "00", seconds: "00" }); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTime({
        days:    String(d).padStart(3, "0"),
        hours:   String(h).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function LaunchpadPage() {
  const countdown = useCountdown();
  const { sentinel2A, sentinel2B } = useTLEPosition();
  const [satData, setSatData] = useState({ alt: 786, vel: 26640 });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white select-none">

      {/* Globe — full-screen background */}
      <div className="absolute inset-0 z-0">
        <SatelliteGlobe
          onSatelliteUpdate={(pos) => setSatData({ alt: pos.alt, vel: pos.vel })}
          panelMode={false}
          sentinel2A={sentinel2A}
          sentinel2B={sentinel2B}
        />
      </div>

      {/* Faint grid alignment overlay */}
      <div className="absolute inset-0 tech-grid pointer-events-none z-[1] opacity-30" />

      {/* ── Top Bar ── */}
      <header className="absolute top-0 left-0 w-full z-10 px-5 py-4 flex justify-between items-center bg-black/50 border-b border-[#27272A]">
        <div className="flex items-center gap-3 cursor-pointer">
          <Image
            src="/logo.jpg"
            alt="ArbaLabs"
            width={140}
            height={32}
            className="object-contain"
            priority
          />
        </div>

        <Link href="/workspace/monitoring">
          <TechButton variant="outline" size="sm">
            Open Terminal
            <ArrowRight className="w-3.5 h-3.5" />
          </TechButton>
        </Link>
      </header>

      {/* ── Center: Mission Countdown ── */}
      {/* ── Mission Countdown ── */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 text-center w-full max-w-2xl px-6 pointer-events-none">
        <p className="text-[9px] font-mono tracking-[0.2em] text-[#A1A1AA] uppercase mb-6">
          T-MINUS COUNTDOWN / TARGET: JUNE 10, 2026
        </p>

        <div className="flex justify-center gap-3">
          {[
            { label: "Days",    val: countdown.days },
            { label: "Hours",   val: countdown.hours },
            { label: "Minutes", val: countdown.minutes },
            { label: "Seconds", val: countdown.seconds },
          ].map((item) => (
            <div key={item.label} className="border border-[#27272A] bg-black/80 px-5 py-4 rounded-[2px] min-w-[80px] text-center">
              <span className="text-4xl font-mono font-bold tracking-tight text-white block font-data">
                {item.val}
              </span>
              <span className="text-[9px] font-space tracking-widest text-[#52525B] uppercase mt-1.5 block">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Left Panel: Mission Specs ── */}
      <div className="absolute top-50 left-5 z-10 hidden md:block w-64">
        <div className="bg-black/80 border border-[#27272A] rounded-[2px] p-4 space-y-4">
          <div>
            <p className="text-[9px] font-mono text-[#52525B] uppercase tracking-widest mb-3">Mission Specs</p>
            <div className="space-y-0">
              {[
                { label: "Orbit Class",    value: "LEO" },
                { label: "Altitude",       value: `${satData.alt} km` },
                { label: "Velocity",       value: `${satData.vel.toLocaleString("en-US")} km/h` },
                { label: "Inclination",    value: "98.6° SSO" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-[#1C1C1F]">
                  <span className="text-[10px] font-space text-[#A1A1AA] uppercase">{label}</span>
                  <span className="text-[11px] font-mono text-white font-semibold font-data">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Orbital API status */}
          <div className="pt-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              <span className="text-[9px] font-mono text-accent-green uppercase tracking-wider">
                {sentinel2A ? "TLE Position Active" : "Orbital Simulation"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Launch Readiness ── */}
      <div className="absolute top-50 right-5 z-10 hidden lg:block w-64">
        <div className="bg-black/80 border border-[#27272A] rounded-[2px] p-4 space-y-4">
          <p className="text-[9px] font-mono text-[#52525B] uppercase tracking-widest">Launch Readiness</p>

          {[
            { label: "Propulsion Array",  status: "NOMINAL" },
            { label: "Avionics Check",    status: "READY" },
            { label: "Communication Link", status: "LOCK" },
            { label: "AI Model Integrity", status: "VERIFIED" },
          ].map(({ label, status }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[10px] font-space text-[#A1A1AA] uppercase">{label}</span>
              <span className="text-[10px] font-mono text-accent-green font-bold">{status}</span>
            </div>
          ))}

          <div className="pt-2 border-t border-[#27272A]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-green" />
              <span className="text-sm font-space font-bold text-accent-green uppercase tracking-wider">GO FOR LAUNCH</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom: Mission Status (single bar, no duplicate workspace tab) ── */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 border-t border-[#27272A] bg-black/80 px-5 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4 text-[9px] font-mono text-[#52525B] uppercase tracking-widest">
          <span>Mission Phase: Pre-Launch</span>
          <span className="border-l border-[#27272A] pl-4">Target Orbit: SSO 786 km</span>
        </div>
        <div className="text-[9px] font-mono text-[#52525B] uppercase tracking-widest hidden md:block">
          ArbaLabs Launchpad v1.0
        </div>
      </footer>

    </div>
  );
}
