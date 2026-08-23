"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, Check, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function CookieConsent() {
  const { lang } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie_consent_choice");
    if (!consent) {
      // Small delay for smooth entrance after initial page render
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie_consent_choice", "all");
    localStorage.setItem("cookie_consent_timestamp", new Date().toISOString());
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("cookie_consent_choice", "essential");
    localStorage.setItem("cookie_consent_timestamp", new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 max-w-lg z-[9999] animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="bg-[#081425]/95 backdrop-blur-2xl border border-primary-container/30 rounded-2xl p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,215,0,0.1)] relative overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-container/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-container/15 border border-primary-container/30 flex items-center justify-center text-primary-container flex-shrink-0 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
            <Cookie size={22} />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h4 className="font-headline-md text-sm md:text-base text-on-surface font-bold flex items-center gap-2">
                {lang === "tr" ? "Çerez & Gizlilik Tercihleri" : "Cookie & Privacy Preferences"}
                <span className="text-[10px] font-label-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  GDPR & AdSense
                </span>
              </h4>
              <button
                onClick={handleAcceptEssential}
                className="text-on-surface-variant/60 hover:text-on-surface transition-colors p-1"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed mb-4 font-light">
              {lang === "tr" ? (
                <>
                  Veyronix olarak deneyiminizi iyileştirmek, site trafiğini analiz etmek ve kişiselleştirilmiş içerikler (Google AdSense dahil) sunmak için çerezleri kullanıyoruz. Detaylar için{" "}
                  <Link href="/privacy" className="text-primary-container underline hover:brightness-125">
                    Gizlilik Politikası
                  </Link>
                  {"'"}nı inceleyebilirsiniz.
                </>
              ) : (
                <>
                  We use cookies to improve your experience, analyze site traffic, and deliver personalized content (including Google AdSense ads). For details, check our{" "}
                  <Link href="/privacy" className="text-primary-container underline hover:brightness-125">
                    Privacy Policy
                  </Link>
                  .
                </>
              )}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={handleAcceptAll}
                className="w-full sm:w-auto flex-1 bg-primary-container text-on-primary px-4 py-2.5 rounded-xl font-label-bold text-xs uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:brightness-110 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Check size={14} strokeWidth={3} />
                {lang === "tr" ? "Tümünü Kabul Et" : "Accept All"}
              </button>

              <button
                onClick={handleAcceptEssential}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all font-label-bold text-xs uppercase tracking-wider active:scale-95"
              >
                {lang === "tr" ? "Yalnızca Gerekli" : "Essential Only"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
