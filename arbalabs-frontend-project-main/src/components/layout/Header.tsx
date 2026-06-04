"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import TechButton from "../ui/TechButton";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    const tick = () => {
      setUtcTime(new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const isWorkspace = pathname.startsWith("/workspace");

  return (
    <header className="w-full border-b border-[#27272A] bg-black z-50">
      <div className="max-w-[1920px] mx-auto px-5 py-3 flex flex-col md:flex-row justify-between items-center gap-4">

        {/* Brand — PNG Logo */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <Image
            src="/logo.jpg"
            alt="ArbaLabs"
            width={140}
            height={32}
            className="object-contain"
            priority
          />
        </Link>

        {/* Navigation: context-aware single button */}
        <div className="flex items-center gap-3">
          {isWorkspace ? (
            <TechButton
              onClick={() => router.push("/")}
              variant="outline"
              size="md"
              className="!text-[11px] !px-5 !py-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Open Launchpad
            </TechButton>
          ) : (
            <TechButton
              onClick={() => router.push("/workspace/monitoring")}
              variant="outline"
              size="sm"
              className="!text-[10px]"
            >
              Open Terminal
              <ArrowRight className="w-3.5 h-3.5" />
            </TechButton>
          )}
        </div>

        {/* UTC Clock + Node */}
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-space tracking-widest text-[#52525B] uppercase">System Time</span>
            <span className="text-[11px] font-mono text-white font-data tracking-wider">
              {utcTime || "——"}
            </span>
          </div>
          <div className="hidden sm:flex flex-col items-end border-l border-[#27272A] pl-5">
            <span className="text-[9px] font-space tracking-widest text-[#52525B] uppercase">Satellite Node</span>
            <span className="text-[10px] font-mono text-accent-green font-semibold">ARBA-EDGE-1</span>
          </div>
        </div>

      </div>
    </header>
  );
}
