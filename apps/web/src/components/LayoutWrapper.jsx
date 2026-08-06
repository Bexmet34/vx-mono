"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SystemStatusWidget from "@/components/SystemStatusWidget";
import ScrollToTop from "@/components/ScrollToTop";
import MobileAppDock from "@/components/MobileAppDock";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
    return (
      <div className="min-h-screen bg-background flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 pt-14 h-screen overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", paddingBottom: "70px" }}>
      <Navbar />
      <div style={{ flex: 1, paddingTop: "80px" }}>
        {children}
      </div>
      <Footer />
      <SystemStatusWidget />
      <ScrollToTop />
      <MobileAppDock />
    </div>
  );
}
