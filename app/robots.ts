import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.alshareehanet.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/checkout/",
          "/checkout/verify/",
          "/account/",
          "/auth/",
          "/cart/",
          "/search/",
          "/maintenance/",
          "/_next/",
        ],
      },
      {
        userAgent: [
          "Bytespider",
          "AhrefsBot",
          "SemrushBot",
          "DotBot",
          "MJ12bot",
          "PetalBot",
          "Amazonbot",
          "ClaudeBot",
          "GPTBot",
          "CCBot",
          "DataForSeoBot",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
