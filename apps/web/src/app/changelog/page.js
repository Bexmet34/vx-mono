"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Calendar, ChevronDown, History } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const staticLogs = [
  {
    version: "2.0.0",
    date: "2024-04-24",
    title_tr: "Veyronix Monorepo & Altyapı Güncellemesi",
    title_en: "Veyronix Monorepo & Infrastructure Update",
    content_tr: "### Büyük Yenilikler\n- **Monorepo Geçişi:** Tüm bot ve web servisleri tek bir merkezden yönetilmeye başlandı.\n- **Performans:** Veritabanı sorguları ve bot yanıt süreleri optimize edildi.\n- **Güvenlik:** VPS tarafında PM2 ekosistemi ile kesintisiz çalışma garantilendi.",
    content_en: "### Major Updates\n- **Monorepo Migration:** All bot and web services are now managed from a single core.\n- **Performance:** Database queries and bot response times optimized.\n- **Security:** Guaranteed uptime with PM2 ecosystem on the VPS side."
  },
  {
    version: "1.9.5",
    date: "2024-04-15",
    title_tr: "Gelişmiş Destek ve Ticket Sistemi",
    title_en: "Advanced Support & Ticket System",
    content_tr: "### Yeni Özellikler\n- Sunucular için kategori bazlı ticket oluşturma.\n- Yetkili rolleri için özel yönetim panelleri.\n- Kapalı talepler için arşivleme sistemi.",
    content_en: "### New Features\n- Category-based ticket creation for servers.\n- Custom management panels for staff roles.\n- Archiving system for closed requests."
  },
  {
    version: "1.8.0",
    date: "2024-04-01",
    title_tr: "Albion Online Veri Entegrasyonu",
    title_en: "Albion Online Data Integration",
    content_tr: "### Oyun Verileri\n- Oyuncu istatistikleri doğrudan Albion API üzerinden çekilmeye başlandı.\n- Sunucu bazlı Guild ID yapılandırması iyileştirildi.",
    content_en: "### Game Data\n- Player stats are now fetched directly via Albion API.\n- Server-based Guild ID configuration improved."
  },
  {
    version: "1.7.0",
    date: "2024-03-20",
    title_tr: "Tam Dil ve Yerelleştirme Desteği",
    title_en: "Full Language & Localization Support",
    content_tr: "### Global Erişim\n- Bot komutları ve web arayüzü artık tam Türkçe ve İngilizce desteğine sahip.\n- Kullanıcı bazlı dil tercihi kaydetme özelliği eklendi.",
    content_en: "### Global Access\n- Bot commands and web interface now have full TR/EN support.\n- Added user-based language preference saving."
  },
  {
    version: "1.6.0",
    date: "2024-03-10",
    title_tr: "Yeni Nesil Parti Kurucu",
    title_en: "Next-Gen Party Builder",
    content_tr: "### Kolay Kurulum\n- `/create` komutu ile form tabanlı hızlı parti oluşturma.\n- Buton bazlı rol seçimi ve katılım takibi.",
    content_en: "### Easy Setup\n- Fast form-based party creation with `/create` command.\n- Button-based role selection and attendance tracking."
  },
  {
    version: "1.5.0",
    date: "2024-02-28",
    title_tr: "Ses Kanalı ve Üye Yönetimi",
    title_en: "Voice Channel & Member Management",
    content_tr: "- Partiye katılanların otomatik ses kanalına taşınması özelliği.\n- Dinamik oda limiti ayarlamaları.",
    content_en: "- Auto-move feature for party members to voice channels.\n- Dynamic room limit adjustments."
  },
  {
    version: "1.4.0",
    date: "2024-02-15",
    title_tr: "Güvenlik ve whitelist Geliştirmeleri",
    title_en: "Security & Whitelist Enhancements",
    content_tr: "- Spam koruması ve komut limitleri devreye alındı.\n- Güvenilir sunucular için Whitelist sistemi aktif edildi.",
    content_en: "- Spam protection and command limits implemented.\n- Whitelist system activated for trusted servers."
  },
  {
    version: "1.3.0",
    date: "2024-02-01",
    title_tr: "Discord Rol Senkronizasyonu",
    title_en: "Discord Role Synchronization",
    content_tr: "- Oyun içi rütbelerle Discord rollerinin otomatik eşleşmesi.\n- Sunucu yönetimini kolaylaştıran yetki sistemi.",
    content_en: "- Automatic matching of in-game ranks with Discord roles.\n- Permission system simplifying server management."
  },
  {
    version: "1.1.0",
    date: "2024-01-15",
    title_tr: "Stabilite ve Hata Düzeltmeleri",
    title_en: "Stability & Bug Fixes",
    content_tr: "- Veritabanı bağlantı hataları giderildi.\n- Slash komutlarındaki yavaşlıklar optimize edildi.",
    content_en: "- Database connection errors resolved.\n- Slash command latencies optimized."
  },
  {
    version: "1.0.0",
    date: "2024-01-01",
    title_tr: "Veyronix Yayında!",
    title_en: "Veyronix is Live!",
    content_tr: "### Başlangıç\n- Veyronix botun ilk kararlı sürümü tüm sunuculara açıldı.\n- Temel Albion Online parti yönetim özellikleri aktif.",
    content_en: "### Launch\n- First stable version of Veyronix bot opened to all servers.\n- Core Albion Online party management features active."
  }
];

export default function ChangelogPage() {
  const { lang } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState(0);

  return (
    <main style={{ backgroundColor: "var(--bg-color)", minHeight: "100vh", color: "white" }}>
      <Navbar />
      
      <div className="container" style={{ padding: "6rem 1rem" }}>
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
          <div style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            color: "var(--accent-color)", 
            fontSize: "0.85rem",
            fontWeight: "800",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "1rem"
          }}>
            <History size={16} />
            {lang === "en" ? "Changelog" : "Güncelleme Notları"}
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 8vw, 3.5rem)", fontWeight: "800", marginBottom: "1.5rem", letterSpacing: "-1px" }}>
            {lang === "en" ? "System Updates" : "Sistem Güncellemeleri"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto", opacity: 0.8 }}>
            {lang === "en" 
              ? "A chronological log of all changes and improvements to the Veyronix ecosystem." 
              : "Veyronix ekosisteminde yapılan tüm değişikliklerin ve iyileştirmelerin kronolojik kaydı."}
          </p>
        </div>

        <div style={{ maxWidth: "700px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {staticLogs.map((item, index) => {
            const isExpanded = expandedIndex === index;
            const content = lang === "tr" ? item.content_tr : item.content_en;
            const title = lang === "tr" ? item.title_tr : item.title_en;

            return (
              <div 
                key={item.version}
                className="glass-panel"
                style={{ 
                  borderColor: isExpanded ? "var(--accent-color)" : "rgba(255,255,255,0.05)",
                  background: isExpanded ? "rgba(255,255,255,0.03)" : "var(--glass-bg)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  borderRadius: "16px"
                }}
              >
                <div 
                  onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                  style={{ padding: "1.5rem 2rem", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem" }}>
                      <span style={{ 
                        color: isExpanded ? "var(--accent-color)" : "white", 
                        fontWeight: "800", 
                        fontSize: "1.1rem",
                        fontFamily: "monospace"
                      }}>
                        v{item.version}
                      </span>
                      <h2 style={{ fontSize: "1.1rem", fontWeight: "600", color: isExpanded ? "white" : "var(--text-muted)", transition: "color 0.3s" }}>
                        {title}
                      </h2>
                    </div>
                    <div style={{ 
                      color: isExpanded ? "var(--accent-color)" : "rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Calendar size={12} /> {item.date}
                      </span>
                      <div style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  maxHeight: isExpanded ? "1000px" : "0", 
                  opacity: isExpanded ? 1 : 0,
                  overflow: "hidden",
                  transition: "all 0.4s ease-in-out"
                }}>
                  <div style={{ padding: "0 2rem 2rem 2rem", color: "var(--text-muted)", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "1.5rem" }}>
                    <div className="markdown-body" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
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
        .markdown-body h3 { color: white !important; margin-bottom: 1rem; font-size: 1rem; font-weight: 700; }
        .markdown-body ul { padding-left: 0; list-style: none; }
        .markdown-body li { position: relative; padding-left: 1.2rem; margin-bottom: 0.6rem; }
        .markdown-body li::before { content: "•"; color: var(--accent-color); position: absolute; left: 0; font-weight: bold; }
        .markdown-body strong { color: white; }
        .glass-panel:hover { border-color: rgba(252, 163, 17, 0.3); }
      `}</style>
    </main>
  );
}



