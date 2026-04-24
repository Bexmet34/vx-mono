"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Calendar, ChevronDown, ChevronUp, History, Loader2, Sparkles, Zap, Shield, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// 10 Professional Updates for Veyronix
const staticLogs = [
  {
    version: "2.0.0",
    date: "2024-04-24",
    title_tr: "Monorepo ve Performans Çağı",
    title_en: "The Age of Monorepo & Performance",
    type: "major",
    content_tr: "### Neler Değişti?\n- **Monorepo Geçişi:** Tüm servisler Turborepo ile birleştirildi.\n- **Hız:** Bot yanıt süreleri optimize edildi.\n- **Web:** Dashboard altyapısı Next.js 14+ sürümüne yükseltildi.",
    content_en: "### What's New?\n- **Monorepo Migration:** All services unified with Turborepo.\n- **Speed:** Bot response times optimized.\n- **Web:** Dashboard infrastructure upgraded to Next.js 14+."
  },
  {
    version: "1.9.5",
    date: "2024-04-15",
    title_tr: "Gelişmiş Ticket Sistemi",
    title_en: "Advanced Ticket System",
    type: "feature",
    content_tr: "### Yeni Özellikler\n- Sunucular için çoklu kategori desteği.\n- Yetkili rolleri için özel paneller.\n- Kapanan ticketlar için otomatik transcript oluşturma.",
    content_en: "### New Features\n- Multi-category support for servers.\n- Custom panels for staff roles.\n- Automatic transcript generation for closed tickets."
  },
  {
    version: "1.8.0",
    date: "2024-04-01",
    title_tr: "Albion API Entegrasyonu",
    title_en: "Albion API Integration",
    type: "feature",
    content_tr: "### Oyun Verileri\n- Oyuncu istatistikleri anlık olarak Albion API üzerinden çekilmeye başlandı.\n- Guild üyelerinin rütbe takibi otomatikleşti.",
    content_en: "### Game Data\n- Player stats are now fetched live via Albion API.\n- Guild member rank tracking is now automated."
  },
  {
    version: "1.7.2",
    date: "2024-03-20",
    title_tr: "Dil Desteği ve Yerelleştirme",
    title_en: "Language Support & Localization",
    type: "fix",
    content_tr: "- Tüm bot komutları artık İngilizce ve Türkçe dillerini tam destekliyor.\n- Web dashboard için dil seçeneği eklendi.",
    content_en: "- All bot commands now fully support English and Turkish languages.\n- Language toggle added to the web dashboard."
  },
  {
    version: "1.6.0",
    date: "2024-03-10",
    title_tr: "Dinamik Parti Kurucu",
    title_en: "Dynamic Party Builder",
    type: "feature",
    content_tr: "### Savaş Meydanı Hazırlığı\n- `/create` komutu ile saniyeler içinde ZvZ partileri kurabilme.\n- Rol seçim butonları (Tank, Healer, DPS).",
    content_en: "### Battlefield Prep\n- Create ZvZ parties in seconds with the `/create` command.\n- Role selection buttons (Tank, Healer, DPS)."
  },
  {
    version: "1.5.5",
    date: "2024-02-25",
    title_tr: "Ses Kanalı Entegrasyonu",
    title_en: "Voice Channel Integration",
    type: "feature",
    content_tr: "- Partiye katılan kullanıcıların ses kanallarına otomatik taşınması.\n- Oda limitlerinin otomatik ayarlanması.",
    content_en: "- Automatically move joined users to designated voice channels.\n- Automatic room limit adjustments."
  },
  {
    version: "1.4.0",
    date: "2024-02-15",
    title_tr: "Güvenlik ve Whitelist",
    title_en: "Security & Whitelist",
    type: "security",
    content_tr: "- Spam koruması iyileştirildi.\n- Whitelist sistemi ile güvenilir kullanıcılara özel yetkiler tanımlandı.",
    content_en: "- Improved spam protection.\n- Special permissions defined for trusted users via the Whitelist system."
  },
  {
    version: "1.3.0",
    date: "2024-02-01",
    title_tr: "Discord Role Sync",
    title_en: "Discord Role Sync",
    type: "feature",
    content_tr: "- Oyun içi rütbelerin Discord rolleriyle senkronize edilmesi.\n- Otomatik yetki verme ve alma sistemi.",
    content_en: "- Syncing in-game ranks with Discord roles.\n- Automatic permission granting and removal system."
  },
  {
    version: "1.1.0",
    date: "2024-01-20",
    title_tr: "Hata Düzeltmeleri",
    title_en: "Bug Fixes & Stability",
    type: "fix",
    content_tr: "- Veritabanı bağlantı kopmaları giderildi.\n- Slash komutlarındaki gecikmeler minimize edildi.",
    content_en: "- Database connection issues resolved.\n- Latency in slash commands minimized."
  },
  {
    version: "1.0.0",
    date: "2024-01-01",
    title_tr: "Veyronix Dünyasına Merhaba",
    title_en: "Hello to Veyronix World",
    type: "major",
    content_tr: "### İlk Sürüm\n- Veyronix botun ilk kararlı sürümü yayınlandı.\n- Temel parti kurma ve yönetim özellikleri aktif.",
    content_en: "### Initial Release\n- First stable version of Veyronix bot released.\n- Core party building and management features are live."
  }
];

export default function ChangelogPage() {
  const { lang } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState(0);

  const getTypeIcon = (type) => {
    switch(type) {
      case 'major': return <Sparkles size={18} className="text-yellow-400" />;
      case 'feature': return <Zap size={18} className="text-blue-400" />;
      case 'security': return <Shield size={18} className="text-green-400" />;
      default: return <Globe size={18} className="text-purple-400" />;
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white">
      <Navbar />
      
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 bg-[#FCA30B]/10 text-[#FCA30B] px-4 py-2 rounded-full text-sm font-bold mb-6 border border-[#FCA30B]/20">
            <History size={16} />
            {lang === "en" ? "Changelog" : "Güncelleme Notları"}
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            {lang === "en" ? "Evolution of Veyronix" : "Veyronix'in Gelişimi"}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            {lang === "en" 
              ? "Follow our journey as we build the ultimate tools for the Albion Online community." 
              : "Albion Online topluluğu için en iyi araçları geliştirirken geçirdiğimiz yolculuğu takip edin."}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {staticLogs.map((item, index) => {
            const isExpanded = expandedIndex === index;
            const content = lang === "tr" ? item.content_tr : item.content_en;
            const title = lang === "tr" ? item.title_tr : item.title_en;

            return (
              <div 
                key={item.version}
                className={`group relative rounded-2xl border transition-all duration-500 overflow-hidden ${
                  isExpanded 
                    ? "bg-[#111114] border-[#FCA30B]/50 shadow-[0_0_40px_rgba(252,163,11,0.1)]" 
                    : "bg-[#0d0d0f] border-white/5 hover:border-white/20"
                }`}
              >
                <button 
                  onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                  className="w-full text-left p-8 focus:outline-none"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-colors ${isExpanded ? "bg-[#FCA30B] text-black" : "bg-white/5 text-gray-400"}`}>
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[#FCA30B] font-mono font-bold text-sm">v{item.version}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20"></span>
                          <div className="flex items-center gap-1.5 text-gray-500 text-xs uppercase tracking-widest font-bold">
                            <Calendar size={12} />
                            {item.date}
                          </div>
                        </div>
                        <h2 className="text-xl font-bold group-hover:text-[#FCA30B] transition-colors">{title}</h2>
                      </div>
                    </div>
                    <div className={`transition-transform duration-500 ${isExpanded ? "rotate-180 text-[#FCA30B]" : "text-gray-600"}`}>
                      <ChevronDown size={24} />
                    </div>
                  </div>
                </button>

                <div className={`transition-all duration-500 ease-in-out ${isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="px-8 pb-8 pt-0 text-gray-400 border-t border-white/5 mt-2">
                    <div className="prose prose-invert prose-orange max-w-none pt-6">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
      
      <style jsx global>{`
        .prose h3 { color: white !important; font-weight: 800; margin-top: 0 !important; }
        .prose ul { list-style-type: none; padding-left: 0; }
        .prose li { position: relative; padding-left: 1.5rem; margin-bottom: 0.5rem; }
        .prose li::before { content: "→"; position: absolute; left: 0; color: #FCA30B; font-weight: bold; }
        .prose strong { color: white; }
      `}</style>
    </main>
  );
}

