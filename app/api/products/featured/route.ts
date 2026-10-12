import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../admin/_lib";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(
      `${getBackend()}/api/products/featured`,
      forwardCookies(req, { method: "GET" })
    );
    if (!res.ok) {
      return NextResponse.json([], {
        status: 200,
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      });
    }
    const data: unknown[] = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : [], {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json([], {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" },
    });
  }
}
