import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache for 1 hour

const BACKEND =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://alshareehasim-backend.onrender.com";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.alshareehanet.com";

function escapeCsv(val: string): string {
  const str = String(val || "").replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/products?limit=1000`, {
      next: { revalidate: 3600 },
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      return new NextResponse("Failed to fetch products", { status: 502 });
    }

    const products = await res.json();
    if (!Array.isArray(products)) {
      return new NextResponse("Invalid products data", { status: 502 });
    }

    // Standard TikTok Catalog CSV Headers
    const headers = [
      "id",
      "title",
      "description",
      "availability",
      "condition",
      "price",
      "link",
      "image_link",
      "brand",
    ];

    const rows = products.map((p) => {
      const id = String(p._id);
      const title = p.name || "منتج";
      const description = (p.description || p.brief || p.name || "").replace(/\r?\n|\r/g, " ");
      const availability = p.inStock !== false ? "in stock" : "out of stock";
      const condition = "new";
      const priceNum = p.salePrice || p.originalPrice || p.price || 0;
      const price = `${priceNum} SAR`;
      const link = `${SITE_URL}/product/${id}`;
      
      let imageUrl = p.images?.[0] || p.image || "";
      if (imageUrl && !imageUrl.startsWith("http")) {
        imageUrl = `${BACKEND}${imageUrl}`;
      }
      if (!imageUrl) {
        imageUrl = `${SITE_URL}/logo.webp`;
      }
      const brand = p.brand || "الشريحة الموثوقة";

      return [
        escapeCsv(id),
        escapeCsv(title),
        escapeCsv(description),
        escapeCsv(availability),
        escapeCsv(condition),
        escapeCsv(price),
        escapeCsv(link),
        escapeCsv(imageUrl),
        escapeCsv(brand),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'inline; filename="tiktok-catalog.csv"',
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("TikTok Catalog CSV Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
