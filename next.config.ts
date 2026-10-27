import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV === "development";

const STATIC_CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://maps.googleapis.com https://js.sentry-cdn.com https://www.google-analytics.com https://www.googletagmanager.com https://www.googleadservices.com https://*.googleadservices.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://www.google.com https://sc-static.net https://tr.snapchat.com https://*.snapchat.com https://eauthenticate.saudibusiness.gov.sa https://analytics.tiktok.com https://*.tiktok.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' blob: data: https: http://localhost:5000",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' http://localhost:5000 https://*.vercel.app https://*.railway.app https://*.render.com https://*.onrender.com https://lamsa-simicard-backend.vercel.app https://www.alsharihaa.com https://alsharihaa.com https://alshareehasim.com https://sentry.io https://www.google-analytics.com https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://www.google.com https://www.google.com.sa https://ad.doubleclick.net https://maps.googleapis.com https://nominatim.openstreetmap.org https://tr.snapchat.com https://*.snapchat.com https://sc-static.net https://eauthenticate.saudibusiness.gov.sa https://analytics.tiktok.com https://*.tiktok.com https://business-api.tiktok.com",
  "frame-src 'self' https://www.googletagmanager.com https://www.google.com https://docs.google.com https://tr.snapchat.com https://*.snapchat.com",
  "object-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Consistent canonical URLs — no trailing slash
  trailingSlash: false,
  // Bypasses Vercel image optimization edge compute — serves images directly from CDN / Cloudinary
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // صد مسارات البوتات الشائعة فوراً على مستوى الـ CDN بدون استهلاك Middleware
      {
        source: "/(.*\\.(?:php|asp|aspx|jsp))",
        destination: "/404",
        permanent: false,
      },
      {
        source: "/wp-(.*)",
        destination: "/404",
        permanent: false,
      },
      {
        source: "/xmlrpc(.*)",
        destination: "/404",
        permanent: false,
      },
      {
        source: "/phpmyadmin(.*)",
        destination: "/404",
        permanent: false,
      },
      {
        source: "/(\\.env.*)",
        destination: "/404",
        permanent: false,
      },
      {
        source: "/(\\.git.*)",
        destination: "/404",
        permanent: false,
      },
      {
        source: "/cgi-bin(.*)",
        destination: "/404",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      // Global security headers & CSP applied at CDN level with 0 Edge compute
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: STATIC_CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
      // Next.js static chunks — cached immutable for 1 year
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Static assets — cached for 1 year at browser and CDN level
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|ico|woff|woff2|pdf|lottie|json|txt)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Public product listings — products are fixed forever, long browser & Edge CDN cache
      {
        source: "/api/products",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=31536000",
          },
        ],
      },
      {
        source: "/api/products/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=31536000",
          },
        ],
      },
      // Featured products — fixed forever, long browser & Edge CDN cache
      {
        source: "/api/products/featured",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=31536000",
          },
        ],
      },
      // Company public data — cached shortly at Edge so changes to /admin/files reflect quickly
      {
        source: "/api/company",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
      // Subcategory home settings — fixed, long cache
      {
        source: "/api/sub-categories-home",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=31536000",
          },
        ],
      },
      // Auth endpoints — MUST NOT be cached at CDN level
      {
        source: "/api/auth/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store",
          },
        ],
      },
      // Admin endpoints — never cache
      {
        source: "/api/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store",
          },
        ],
      },
      // Checkout endpoints — never cache
      {
        source: "/api/account/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
