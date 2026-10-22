import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "../../../_lib";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    const res = await fetch(`${getBackend()}/api/admin/company/footer-media/${key}`, forwardCookies(req, { method: "DELETE" }));
    const data = await res.json();
    revalidateTag("company");
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "فشل حذف الملف" }, { status: 500 });
  }
}
