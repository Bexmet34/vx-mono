"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Sword, Activity, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileAppDock() {
  const pathname = usePathname();
  const { lang } = useLanguage();

  const navItems = [
    {
      label: lang === "tr" ? "Anasayfa" : "Home",
      href: "/",
      icon: Home,
      exact: true,
    },
    {
      label: lang === "tr" ? "Panel" : "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: false,
    },
    {
      label: lang === "tr" ? "Parti" : "Parties",
      href: "/#commands",
      icon: Sword,
      exact: false,
    },
    {
      label: "Killboard",
      href: "/killboard",
      icon: Activity,
      exact: false,
    },
    {
      label: lang === "tr" ? "Destek" : "Support",
      href: "https://discord.gg/D6T3t4beqa",
      icon: MessageCircle,
      external: true,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-3 pb-[env(safe-area-inset-bottom,8px)] pt-2 bg-[#0B0F19]/90 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = item.exact 
            ? pathname === item.href 
            : item.href !== "/" && pathname.startsWith(item.href);

          const content = (
            <div className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-90 ${
              isActive 
                ? "text-primary-container font-label-bold" 
                : "text-on-surface-variant hover:text-on-surface"
            }`}>
              <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                isActive ? "bg-primary-container/15 text-primary-container shadow-[0_0_12px_rgba(255,215,0,0.2)]" : ""
              }`}>
                <Icon size={20} className={isActive ? "stroke-[2.5]" : "stroke-[1.8]"} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-container rounded-full animate-pulse"></span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 font-medium">
                {item.label}
              </span>
            </div>
          );

          if (item.external) {
            return (
              <a
                key={idx}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-manipulation"
              >
                {content}
              </a>
            );
          }

          return (
            <Link key={idx} href={item.href} className="touch-manipulation">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
