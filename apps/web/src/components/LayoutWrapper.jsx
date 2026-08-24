"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SystemStatusWidget from "@/components/SystemStatusWidget";
import ScrollToTop from "@/components/ScrollToTop";
import MobileAppDock from "@/components/MobileAppDock";
import CookieConsent from "@/components/CookieConsent";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const isAdmin = pathname?.startsWith("/admin");

  if (isDashboard || isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 pt-14 h-screen overflow-hidden">
          {children}
        </div>
        <CookieConsent />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Navbar />
      <div className="flex-1 pt-14 md:pt-16">
        {children}
      </div>
      <Footer />
      <SystemStatusWidget />
      <ScrollToTop />
      <MobileAppDock />
      <CookieConsent />
    </div>
  );
}
