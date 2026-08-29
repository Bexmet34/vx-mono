"use client";

import React from "react";
import {
  LayoutDashboard,
  Server,
  FileText,
  CreditCard,
  Building,
  Bell,
  Gift,
  Radio,
  Settings,
  BarChart3,
  Power,
  X,
  Megaphone
} from "lucide-react";

export const MENU_ITEMS = [
  { id: "stats", label: "İstatistikler", icon: <BarChart3 size={20} /> },
  { id: "servers", label: "Lisans Yönetimi", icon: <Server size={20} /> },
  { id: "plans", label: "Paketler (Plans)", icon: <FileText size={20} /> },
  { id: "manual-payments", label: "Manuel Ödemeler", icon: <CreditCard size={20} /> },
  { id: "bank-accounts", label: "Banka Hesapları", icon: <Building size={20} /> },
  { id: "notifications", label: "Şablonlar", icon: <Bell size={20} /> },
  { id: "announcements", label: "Duyurular", icon: <Megaphone size={20} /> },
  { id: "campaigns", label: "Kampanyalar", icon: <Gift size={20} /> },
  { id: "broadcast", label: "Toplu Mesaj", icon: <Radio size={20} /> },
  { id: "blog-automation", label: "Blog Otomasyonu", icon: <FileText size={20} /> },
  { id: "settings", label: "Sistem Ayarları", icon: <Settings size={20} /> },
];

export default function AdminSidebar({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-[#111214]/95 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } shadow-2xl shadow-black/50`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#5865F2] via-[#6366f1] to-[#a855f7] p-[1px] shadow-lg shadow-[#5865F2]/20">
              <div className="w-full h-full rounded-2xl bg-[#111214] flex items-center justify-center">
                <LayoutDashboard size={20} className="text-[#5865F2]" />
              </div>
            </div>
            <div>
              <h2 className="text-white font-extrabold text-[1.1rem] tracking-tight leading-tight">Veyronix</h2>
              <p className="text-[#949ba4] text-[0.7rem] font-bold tracking-widest uppercase mt-0.5">Yönetim Paneli</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-[#949ba4] hover:text-white p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          <div className="text-[0.65rem] font-bold text-[#80848e] tracking-wider uppercase mb-3 ml-2 mt-2">Menü</div>
          {MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-left transition-all duration-300 group ${
                  isActive
                    ? "bg-gradient-to-r from-[#5865F2]/20 to-[#5865F2]/5 text-white border border-[#5865F2]/20 shadow-inner"
                    : "text-[#b5bac1] hover:bg-white/[0.04] hover:text-[#dbdee1] border border-transparent"
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? "bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/30" : "bg-[#2b2d31] text-[#949ba4] group-hover:bg-[#313338] group-hover:text-white"}`}>
                  {item.icon}
                </div>
                <span className={`text-[14.5px] ${isActive ? "font-semibold" : "font-medium"}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01]">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left transition-all duration-300 text-[#f87171] hover:bg-[#f87171]/10 hover:text-[#fca5a5] font-medium border border-transparent hover:border-[#f87171]/20"
          >
            <div className="p-1.5 rounded-lg bg-[#f87171]/10 text-[#f87171]">
              <Power size={18} />
            </div>
            <span className="text-[14.5px] font-semibold">Siteye Dön</span>
          </button>
        </div>
      </aside>
    </>
  );
}
