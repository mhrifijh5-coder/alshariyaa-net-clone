import { NextResponse } from "next/server";

// The backend uses a stateless JWT. Clearing its browser cookie is the logout
// operation; it must not depend on a round-trip to the backend.
export async function POST() {
  const res = NextResponse.json({ ok: true });
  const isProd = process.env.NODE_ENV === "production";
  try {
    res.cookies.delete("customer_token");
  } catch {}
  res.cookies.set("customer_token", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}
