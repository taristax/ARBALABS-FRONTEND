/**
 * useTLEPosition — Fetches real TLE (Two-Line Element) data for Sentinel-2A and 2B
 * from the CelesTrak API (via Next.js proxy), then computes live orbital positions
 * using satellite.js SGP4 propagation.
 *
 * Sentinel-2A: NORAD 40697 | Sentinel-2B: NORAD 42063
 * Positions are recomputed every 5 seconds using cached TLE data.
 */

import { useState, useEffect, useRef } from "react";
import {
  twoline2satrec,
  propagate,
  gstime,
  eciToGeodetic,
  degreesLat,
  degreesLong,
  type EciVec3,
  type Kilometer,
  type KilometerPerSecond,
} from "satellite.js";

export interface SatellitePosition {
  lat: number;  // decimal degrees
  lon: number;  // decimal degrees
  alt: number;  // km above Earth surface
  vel: number;  // km/h
}

interface TLEData {
  name: string;
  line1: string;
  line2: string;
}

export interface TLEPositionResult {
  sentinel2A: SatellitePosition | null;
  sentinel2B: SatellitePosition | null;
  isLoading: boolean;
  error: string | null;
}

// Realistic fallback positions if API is unreachable
const FALLBACK: Record<string, SatellitePosition> = {
  a: { lat: 45.2, lon: 12.8, alt: 786, vel: 26640 },
  b: { lat: -33.5, lon: -70.6, alt: 786, vel: 26640 },
};

function parseTLE(raw: string): TLEData | null {
  const lines = raw.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 3) return null;
  return { name: lines[0], line1: lines[1], line2: lines[2] };
}

function propagateTLE(tle: TLEData): SatellitePosition | null {
  try {
    const satrec = twoline2satrec(tle.line1, tle.line2);
    const now = new Date();
    const result = propagate(satrec, now) as any;

    if (!result || !result.position || typeof result.position === "boolean") return null;

    const pos = result.position as EciVec3<Kilometer>;
    const vel = result.velocity as EciVec3<KilometerPerSecond>;
    const gmst = gstime(now);
    const geo = eciToGeodetic(pos, gmst);

    const velKmS = Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2);

    return {
      lat: degreesLat(geo.latitude),
      lon: degreesLong(geo.longitude),
      alt: Math.round(geo.height),
      vel: Math.round(velKmS * 3600),
    };
  } catch {
    return null;
  }
}

async function fetchTLE(catnr: number): Promise<TLEData | null> {
  try {
    const res = await fetch(`/api/satellite/tle?catnr=${catnr}`);
    if (!res.ok) return null;
    const text = await res.text();
    return parseTLE(text);
  } catch {
    return null;
  }
}

export function useTLEPosition(): TLEPositionResult {
  const [result, setResult] = useState<{
    sentinel2A: SatellitePosition | null;
    sentinel2B: SatellitePosition | null;
  }>({ sentinel2A: null, sentinel2B: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tleRef = useRef<{ a: TLEData | null; b: TLEData | null }>({ a: null, b: null });

  // Fetch TLE once on mount
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Promise.all([fetchTLE(40697), fetchTLE(42063)]).then(([tleA, tleB]) => {
      if (cancelled) return;

      if (!tleA && !tleB) {
        setError("Could not reach CelesTrak. Using fallback positions.");
        setResult({ sentinel2A: FALLBACK.a, sentinel2B: FALLBACK.b });
      }
      tleRef.current = { a: tleA, b: tleB };
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  // Propagate every 5 seconds once TLE is loaded
  useEffect(() => {
    if (isLoading) return;

    const tick = () => {
      const posA = tleRef.current.a ? propagateTLE(tleRef.current.a) : null;
      const posB = tleRef.current.b ? propagateTLE(tleRef.current.b) : null;
      setResult({
        sentinel2A: posA ?? FALLBACK.a,
        sentinel2B: posB ?? FALLBACK.b,
      });
    };

    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [isLoading]);

  return { ...result, isLoading, error };
}
