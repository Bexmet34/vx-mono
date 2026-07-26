"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Home, LayoutDashboard, Swords, Menu, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileAppDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang } = useLanguage();

  const isHome = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");
  const isKillboard = pathname.startsWith("/killboard");
  const isPremium = pathname === "/premium";

  const triggerMobileMenu = () => {
    window.dispatchEvent(new CustomEvent("open-mobile-menu"));
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // Dinamik sayfa odaklı buton grubu
  const getDockItems = () => {
    const items = [];

    // Eğer alt sayfadaysak ilk butonu NATIVE GERİ (◀ Geri) butonu yap
    if (!isHome) {
      items.push({
        id: "back",
        label: lang === "tr" ? "Geri" : "Back",
        icon: ArrowLeft,
        onClick: handleBack,
        isBack: true,
      });
    } else {
      items.push({
        id: "home",
        label: lang === "tr" ? "Anasayfa" : "Home",
        icon: Home,
        href: "/",
        isActive: true,
      });
    }

    // Ortadaki Dinamik Butonlar
    items.push({
      id: "dashboard",
      label: lang === "tr" ? "Panel" : "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      isActive: isDashboard,
    });

    items.push({
      id: "killboard",
      label: "Killboard",
      icon: Swords,
      href: "/killboard",
      isActive: isKillboard,
    });

    items.push({
      id: "premium",
      label: "Premium",
      icon: Sparkles,
      href: "/premium",
      isActive: isPremium,
    });

    // En sağdaki buton: Tam Menü Drawer Tetikleyicisi (☰ Menü)
    items.push({
      id: "menu",
      label: lang === "tr" ? "Menü" : "Menu",
      icon: Menu,
      onClick: triggerMobileMenu,
      isMenu: true,
    });

    return items;
  };

  const dockItems = getDockItems();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[90] px-2 pb-[env(safe-area-inset-bottom,6px)] pt-2 bg-[#0B0F19]/95 backdrop-blur-2xl border-t border-outline-variant/30 shadow-[0_-8px_30px_rgba(0,0,0,0.85)]">
      <div className="flex items-center justify-around max-w-sm mx-auto">
        {dockItems.map((item) => {
          const Icon = item.icon;

          const buttonContent = (
            <div
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-90 ${
                item.isActive
                  ? "text-primary-container font-label-bold"
                  : item.isBack
                  ? "text-primary-container/90 hover:text-primary-container"
                  : "text-on-surface-variant/80 hover:text-on-surface"
              }`}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                  item.isActive
                    ? "bg-primary-container/20 text-primary-container shadow-[0_0_12px_rgba(255,215,0,0.25)]"
                    : item.isBack
                    ? "bg-primary-container/10 border border-primary-container/30 text-primary-container"
                    : ""
                }`}
              >
                <Icon
                  size={19}
                  className={item.isActive || item.isBack ? "stroke-[2.2]" : "stroke-[1.6]"}
                />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-container rounded-full animate-pulse"></span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 font-medium whitespace-nowrap">
                {item.label}
              </span>
            </div>
          );

          if (item.onClick) {
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="touch-manipulation focus:outline-none"
                aria-label={item.label}
              >
                {buttonContent}
              </button>
            );
          }

          return (
            <Link key={item.id} href={item.href} className="touch-manipulation">
              {buttonContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
