import { NextResponse } from "next/server";
import { getBackend } from "../admin/_lib";

// Uses the dedicated public endpoint — returns only storefront fields,
// no auth required, no sensitive data (taxNumber, stamps, etc.)
export async function GET() {
  try {
    const res = await fetch(`${getBackend()}/api/admin/company/public`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      return NextResponse.json({}, {
        status: res.status,
        headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
      });
    }
    const data = await res.json();
    // Vercel Edge caches for 5 min; serves stale up to 24h while revalidating
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({}, {
      headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=60" },
    });
  }
}
