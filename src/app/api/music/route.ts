// ─── GET /api/music ───────────────────────────────────────────────────────────
// Aggregates music data from all providers, caches for 20 minutes.

import { NextResponse } from "next/server";
import { aggregateMusicData } from "@/lib/music/aggregator";

// Next.js route segment config: revalidate every 20 minutes
export const revalidate = 1200;
export const dynamic = "force-dynamic"; // always run, use ISR caching

export async function GET() {
  try {
    const { data, providers } = await aggregateMusicData();

    return NextResponse.json(
      {
        data,
        cachedAt: new Date().toISOString(),
        providers,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=1200, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("[/api/music] Aggregation failed:", error);
    return NextResponse.json(
      { error: "Failed to aggregate music data", details: String(error) },
      { status: 500 }
    );
  }
}
