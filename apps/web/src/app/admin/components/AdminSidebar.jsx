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
  X
} from "lucide-react";

export const MENU_ITEMS = [
  { id: "stats", label: "İstatistikler", icon: <BarChart3 size={20} /> },
  { id: "servers", label: "Lisans Yönetimi", icon: <Server size={20} /> },
  { id: "plans", label: "Paketler (Plans)", icon: <FileText size={20} /> },
  { id: "manual-payments", label: "Manuel Ödemeler", icon: <CreditCard size={20} /> },
  { id: "bank-accounts", label: "Banka Hesapları", icon: <Building size={20} /> },
  { id: "notifications", label: "Şablonlar", icon: <Bell size={20} /> },
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#1e1f22] border-r border-[#2b2d31] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#2b2d31]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF3366] to-[#FF9900] flex items-center justify-center shadow-lg shadow-[#FF3366]/20">
              <LayoutDashboard size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Admin Paneli</h2>
              <p className="text-[#949ba4] text-xs font-medium">Veyronix Yönetim</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-[#949ba4] hover:text-white p-2"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
          {MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 min-h-[48px] ${
                  isActive
                    ? "bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/20 font-semibold"
                    : "text-[#b5bac1] hover:bg-[#2b2d31] hover:text-white font-medium"
                }`}
              >
                <div className={`${isActive ? "text-white" : "text-[#949ba4]"}`}>
                  {item.icon}
                </div>
                <span className="text-[15px]">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2b2d31]">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 min-h-[48px] text-[#ef4444] hover:bg-[#ef4444]/10 font-medium"
          >
            <Power size={20} />
            <span className="text-[15px]">Siteye Dön</span>
          </button>
        </div>
      </aside>
    </>
  );
}
