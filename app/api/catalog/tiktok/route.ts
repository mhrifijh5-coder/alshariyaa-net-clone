import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache for 1 hour

const BACKEND =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://alshareehasim-backend.onrender.com";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.alshareehanet.com";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/products?limit=1000`, {
      next: { revalidate: 3600 },
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      return new NextResponse("Failed to fetch products from backend", { status: 502 });
    }

    const products = await res.json();
    if (!Array.isArray(products)) {
      return new NextResponse("Invalid products data", { status: 502 });
    }

    const itemsXml = products
      .map((p) => {
        const id = String(p._id);
        const title = escapeXml(p.name || "منتج");
        const description = escapeXml(
          (p.description || p.brief || p.name || "").slice(0, 5000)
        );
        const link = `${SITE_URL}/product/${id}`;
        
        let imageUrl = p.images?.[0] || p.image || "";
        if (imageUrl && !imageUrl.startsWith("http")) {
          imageUrl = `${BACKEND}${imageUrl}`;
        }
        if (!imageUrl) {
          imageUrl = `${SITE_URL}/logo.webp`;
        }

        const priceNum = p.salePrice || p.originalPrice || p.price || 0;
        const priceStr = `${priceNum} SAR`;
        const availability = p.inStock !== false ? "in stock" : "out of stock";
        const brand = escapeXml(p.brand || "الشريحة الموثوقة");

        return `
    <item>
      <g:id>${id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:brand>${brand}</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${priceStr}</g:price>
      ${p.salePrice && p.originalPrice && p.salePrice < p.originalPrice ? `<g:sale_price>${p.salePrice} SAR</g:sale_price>` : ""}
      <g:google_product_category>536</g:google_product_category>
    </item>`;
      })
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>الشريحة الموثوقة - TikTok Product Catalog Feed</title>
    <link>${SITE_URL}</link>
    <description>تغذية منتجات متجر الشريحة الموثوقة لكتالوج تيك توك وجوجل</description>
    ${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("TikTok Catalog Feed Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
