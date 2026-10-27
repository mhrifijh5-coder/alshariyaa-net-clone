import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../admin/_lib";

// GET /api/products/:id (public - read product detail)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${getBackend()}/api/products/${id}`, forwardCookies(req, { method: "GET" }));
  const data = await res.json();
  return NextResponse.json(data, {
    status: res.status,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=31536000",
    },
  });
}

// DELETE /api/products/:id (admin only - should go through /api/admin/products/:id)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${getBackend()}/api/admin/products/${id}`, forwardCookies(req, { method: "DELETE" }));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
