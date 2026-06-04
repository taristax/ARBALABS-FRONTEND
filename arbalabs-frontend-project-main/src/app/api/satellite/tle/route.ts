/**
 * GET /api/satellite/tle?catnr={noradId}
 *
 * Proxies CelesTrak TLE requests server-side to avoid CORS.
 * Supports Sentinel-2A (40697) and Sentinel-2B (42063).
 *
 * CelesTrak is a public, free service — no auth required.
 * Data is cached for 1 hour (TLE sets change infrequently).
 */

import { NextRequest, NextResponse } from "next/server";

const ALLOWED_CATNRS = new Set(["40697", "42063"]); // Sentinel-2A, Sentinel-2B
const TLE_BASE = "https://celestrak.org/NORAD/elements/gp.php";
const CACHE_SECONDS = 3600; // 1 hour

export async function GET(request: NextRequest) {
  const catnr = request.nextUrl.searchParams.get("catnr");

  if (!catnr || !ALLOWED_CATNRS.has(catnr)) {
    return NextResponse.json(
      { error: "Invalid or missing catnr parameter. Allowed: 40697 (Sentinel-2A), 42063 (Sentinel-2B)" },
      { status: 400 }
    );
  }

  try {
    const url = `${TLE_BASE}?CATNR=${catnr}&FORMAT=TLE`;
    const res = await fetch(url, {
      next: { revalidate: CACHE_SECONDS },
      headers: {
        "User-Agent": "ArbaLabs-SatPlatform/1.0",
      },
    });

    if (!res.ok) {
      throw new Error(`CelesTrak responded with HTTP ${res.status}`);
    }

    const tle = await res.text();

    if (!tle.trim() || !tle.includes("1 ")) {
      throw new Error("CelesTrak returned empty or invalid TLE data");
    }

    return new NextResponse(tle, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=300`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch TLE from CelesTrak: ${message}` },
      { status: 502 }
    );
  }
}
