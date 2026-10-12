"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "./navbar";
import WhatsappButton from "./WhatsappButton";
import AddToCartPopup from "./AddToCartPopup";
import AuthProvider from "./auth/AuthProvider";
import { useCompanyStore } from "../store/companyStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface CompanySSRData {
  logo?: string;
  nameAr?: string;
  nameEn?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  details?: string;
}

export default function ClientLayout({
  children,
  footer,
  company,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
  company?: CompanySSRData;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isVerify = pathname === "/checkout/verify";
  const isMaintenance = pathname.startsWith("/maintenance");
  const isAuth = pathname.startsWith("/auth");
  const hideChrome = isAdmin || isVerify || isMaintenance;

  // Seed the store from SSR data — avoids a client-side /api/company fetch on every page load
  const { fetched, setCompanyData } = useCompanyStore();
  useEffect(() => {
    if (!fetched && company && Object.keys(company).length > 0) {
      const logo = company.logo
        ? company.logo.startsWith("http")
          ? company.logo
          : `${API}${company.logo}`
        : "";
      setCompanyData({
        logo,
        nameAr: company.nameAr || "",
        nameEn: company.nameEn || "",
        phone: company.phone || "",
        whatsapp: company.whatsapp || "",
        email: company.email || "",
        website: company.website || "",
        details: company.details || "",
      });
      // Mark as fetched so fetchCompany() is a no-op
      useCompanyStore.setState({ fetched: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthProvider>
      {!hideChrome && <Navbar />}
      {children}
      {!hideChrome && !isAuth && footer}
      {!hideChrome && !isAuth && <WhatsappButton whatsapp={company?.whatsapp} />}
      {!hideChrome && !isAuth && <AddToCartPopup />}
    </AuthProvider>
  );
}
