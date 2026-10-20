import type { Metadata, Viewport } from "next";
import Script from "next/script";

import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import Footer from "./components/Footer";
import { getCompany } from "./lib/getCompany";
import { Analytics } from "@vercel/analytics/next";

// Single source of truth for the production domain
const SITE_URL = "https://www.alshareehanet.com";

export const viewport: Viewport = {
  themeColor: "#04454A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const c = await getCompany();

  const siteName = c.nameAr || "الشريحة الموثوقة";
  const titleDefault = `${siteName} | أفضل متجر لبيع شرائح الاتصال في السعودية`;
  const description =
    c.details ||
    "الشريحة الموثوقة - تسوق أفضل شرائح الاتصال وباقات الإنترنت من فيرجن وSTC وزين وموبايلي بأسعار مميزة. توصيل سريع لجميع مناطق المملكة العربية السعودية.";
  const ogImage = `${SITE_URL}/logo.webp`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: titleDefault,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: [
      "الشريحة الموثوقة",
      "alshariyaa",
      "بيع شرائح الاتصال",
      "شرائح اتصال",
      "باقات إنترنت",
      "شريحة SIM",
      "شريحة بيانات",
      "فيرجن موبايل",
      "Virgin Mobile",
      "STC",
      "زين",
      "موبايلي",
      "إنترنت مفتوح",
      "باقة شهرية",
      "باقة سنوية",
      "5G",
      "4G",
      "شريحة إنترنت",
      "باقة بيانات",
      "سوشيال مفتوح",
      "السعودية",
      "الرياض",
      "جدة",
      "مكة",
      "المدينة",
      "الدمام",
      "الخبر",
      "أرخص باقات الإنترنت",
      "عروض شرائح الاتصال",
    ],
    authors: [{ name: siteName, url: SITE_URL }],
    creator: siteName,
    publisher: siteName,
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "ar_SA",
      url: SITE_URL,
      siteName,
      title: titleDefault,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: siteName,
          type: "image/webp",
        },
        {
          url: `${SITE_URL}/web-app-manifest-512x512.png`,
          width: 512,
          height: 512,
          alt: siteName,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description,
      images: [ogImage],
      creator: "@alshariyaa",
      site: "@alshariyaa",
    },
    alternates: {
      canonical: SITE_URL,
      languages: { "ar-SA": SITE_URL },
    },
    verification: {
      google: "qnIBTn6iSyGB8-lV_1qJy0wSw4t7cJaetXEZh1OrzOk",
    },
    category: "electronics",
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const c = await getCompany();

  // GA4 Measurement ID — set NEXT_PUBLIC_GA_MEASUREMENT_ID in .env.local
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Google Tag Manager — Container 1 — مخفي مؤقتاً */}
        {/*
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NSC7CM78');`}
        </Script>
        */}
        {/* Google Tag Manager — Container 2 — مخفي مؤقتاً */}
        {/*
        <Script id="google-tag-manager-2" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KB4BDRCC');`}
        </Script>
        */}
      
        <Script id="google-tag-manager-3" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WS8L6DZV');`}
        </Script>
        {/* End Google Tag Manager */}

        {/* Google Fonts: Cairo */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Preconnect to Image CDN */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* Google Ads Conversion Tag */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18484617025"
          strategy="afterInteractive"
        />
        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18484617025');
          `}
        </Script>

        {/* Google Analytics 4 — only loaded when Measurement ID is configured */}
        {gaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-4" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        {/* Snap Pixel */}
        <Script id="snap-pixel" strategy="afterInteractive">
          {`(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script',r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u);})(window,document,'https://sc-static.net/scevent.min.js');
snaptr('init','63affeda-67e1-4bb4-9c18-e08a4526b9f7',{});
snaptr('track','PAGE_VIEW');`}
        </Script>

        {/* TikTok Pixel */}
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('DBB5GLBC77U1UMSUNCAG');
  ttq.page();
}(window, document, 'ttq');`}
        </Script>
      </head>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        {/* Google Tag Manager (noscript) */}
        {/* GTM-NSC7CM78 — مخفي مؤقتاً
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NSC7CM78"
        height="0" width="0" style={{display:"none",visibility:"hidden"}}></iframe></noscript>
        */}
        {/* GTM-KB4BDRCC — مخفي مؤقتاً
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KB4BDRCC"
        height="0" width="0" style={{display:"none",visibility:"hidden"}}></iframe></noscript>
        */}
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WS8L6DZV"
        height="0" width="0" style={{display:"none",visibility:"hidden"}}></iframe></noscript>
       
        {/* End Google Tag Manager (noscript) */}
        <ClientLayout footer={<Footer />} company={c}>
          {children}
        </ClientLayout>
        <div
          className="sbc-verify-seal"
          data-token="UGdEMHMvZm1nSlJGN0ZnVmpYZEF0UT09"
          data-position="bottom-left"
        />
        {/* <Script
          id="saudi-business-verification-seal"
          src="https://eauthenticate.saudibusiness.gov.sa/EAuthSealApi/seal.js"
          strategy="lazyOnload"
        /> */}
        <Analytics />
      </body>
    </html>
  );
}
