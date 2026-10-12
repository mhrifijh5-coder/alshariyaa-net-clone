import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Shared no-store headers — auth responses must never be cached by CDN
const NO_CACHE = { "Cache-Control": "private, no-store" };

export async function GET(req: NextRequest) {
  try {
    // If customer token cookie is missing or empty, user is definitely unauthenticated.
    // Return immediately — no backend call, no Fluid CPU, no CDN hit that could cache user data.
    const token = req.cookies.get("customer_token")?.value;
    if (!token || !token.trim()) {
      return NextResponse.json({ authenticated: false }, { status: 200, headers: NO_CACHE });
    }

    const cookie = req.headers.get("cookie") || "";

    const backendRes = await fetch(`${BACKEND}/api/customers/auth/me`, {
      headers: {
        cookie,
        "x-internal-secret": process.env.INTERNAL_SECRET || "",
      },
      // Reduced from 10000ms — if backend is down, fail fast so client can show UI quickly
      signal: AbortSignal.timeout(5000),
    });

    if (backendRes.status === 401) {
      return NextResponse.json({ authenticated: false }, { status: 200, headers: NO_CACHE });
    }

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: "تعذر التحقق من الجلسة، حاول مرة أخرى" },
        { status: 503, headers: NO_CACHE }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data, { headers: NO_CACHE });
  } catch {
    return NextResponse.json(
      { error: "تعذر الاتصال للتحقق من الجلسة" },
      { status: 503, headers: NO_CACHE }
    );
  }
}
