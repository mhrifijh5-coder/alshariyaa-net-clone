import { NextResponse } from "next/server";
import { getBackend } from "../admin/_lib";

export async function GET() {
  const [settingsRes, maxRes] = await Promise.all([
    fetch(`${getBackend()}/api/admin/sub-categories/home-settings`, {
      next: { revalidate: 3600 },
    }),
    fetch(`${getBackend()}/api/admin/sub-categories/max`, {
      next: { revalidate: 3600 },
    }),
  ]);
  const settings = settingsRes.ok ? await settingsRes.json() : [];
  const maxData = maxRes.ok ? await maxRes.json() : { max: 4 };
  return NextResponse.json(
    { settings, max: maxData.max ?? 4 },
    {
      headers: {
        // Serve from Vercel Edge for 1 hour; stale for 24h while revalidating
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
