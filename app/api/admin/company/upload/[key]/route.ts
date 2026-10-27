import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getBackend, forwardCookies } from "../../../_lib";

export async function POST(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const formData = await req.formData();
  const res = await fetch(`${getBackend()}/api/admin/company/upload/${key}`, forwardCookies(req, {
    method: "POST",
    body: formData,
  }));
  const data = await res.json();
  revalidateTag("company");
  revalidatePath("/", "layout");
  return NextResponse.json(data, { status: res.status });
}
