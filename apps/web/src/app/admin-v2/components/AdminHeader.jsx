"use client";

import React from "react";
import { Menu, Sparkles, RefreshCw } from "lucide-react";
import { MENU_ITEMS } from "./AdminSidebar";

export default function AdminHeader({ activeTab, setIsMobileMenuOpen, loading }) {
  const currentTab = MENU_ITEMS.find((item) => item.id === activeTab);

  return (
    <header className="bg-[#1e1f22] border-b border-[#2b2d31] px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden text-[#949ba4] hover:text-white p-1.5 -ml-1.5 rounded-lg hover:bg-[#2b2d31] transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <div className="flex flex-col">
          <h1 className="text-white font-bold text-lg sm:text-xl flex items-center gap-2">
            {currentTab?.icon}
            {currentTab?.label || "Yönetim"}
          </h1>
          <p className="text-[#949ba4] text-[11px] sm:text-xs font-medium">Veyronix Sistem Yönetim Paneli</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {loading && (
          <div className="flex items-center gap-2 bg-[#2b2d31] px-3 py-1.5 rounded-full border border-[#1e1f22] shadow-sm">
            <RefreshCw size={14} className="text-[#5865F2] animate-spin" />
            <span className="text-[#949ba4] text-xs font-semibold hidden sm:inline">Yükleniyor...</span>
          </div>
        )}
        <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#FF3366]/10 to-[#FF9900]/10 border border-[#FF3366]/20 px-3 py-1.5 rounded-full">
          <Sparkles size={14} className="text-[#FF3366]" />
          <span className="text-[#DBDEE1] text-xs font-semibold">Premium Ayrıcalıkları</span>
        </div>
      </div>
    </header>
  );
}
