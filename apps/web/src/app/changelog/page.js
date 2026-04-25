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
      
      <div className="container" style={{ padding: "4rem 1rem" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div className="changelog-badge">
            <History size={16} />
            {lang === "en" ? "Changelog" : "Güncelleme Notları"}
          </div>
          <h1 className="changelog-title">
            {lang === "en" ? "System Updates" : "Sistem Güncellemeleri"}
          </h1>
          <p className="changelog-desc">
            {lang === "en" 
              ? "A chronological log of all changes and improvements to the Veyronix ecosystem." 
              : "Veyronix ekosisteminde yapılan tüm değişikliklerin ve iyileştirmelerin kronolojik kaydı."}
          </p>
        </div>

        <div className="changelog-list">
          {staticLogs.map((item, index) => {
            const isExpanded = expandedIndex === index;
            const content = lang === "tr" ? item.content_tr : item.content_en;
            const title = lang === "tr" ? item.title_tr : item.title_en;

            return (
              <div 
                key={item.version}
                className={`glass-panel changelog-item ${isExpanded ? 'active' : ''}`}
                onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
              >
                <div className="changelog-header">
                  <div className="header-main">
                    <span className="version-pill">v{item.version}</span>
                    <h2 className="item-title">{title}</h2>
                  </div>
                  <div className="header-meta">
                    <span className="date-tag">
                      <Calendar size={12} /> {item.date}
                    </span>
                    <div className={`chevron ${isExpanded ? 'up' : ''}`}>
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                <div className={`changelog-content ${isExpanded ? 'show' : ''}`}>
                  <div className="content-inner">
                    <div className="markdown-body">
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
      
      <style jsx>{`
        .changelog-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--accent-color);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }
        .changelog-title {
          font-size: clamp(2rem, 8vw, 3rem);
          font-weight: 800;
          margin-bottom: 1.5rem;
          letter-spacing: -1px;
        }
        .changelog-desc {
          color: var(--text-muted);
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
          opacity: 0.8;
        }
        .changelog-list {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .changelog-item {
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 0 !important;
        }
        .changelog-item.active {
          border-color: var(--accent-color);
          background: rgba(255, 255, 255, 0.03);
        }
        .changelog-header {
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .header-main {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }
        .version-pill {
          color: var(--accent-color);
          font-weight: 800;
          font-size: 1rem;
          font-family: monospace;
          background: rgba(252, 163, 17, 0.1);
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
        }
        .item-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-muted);
        }
        .changelog-item.active .item-title {
          color: white;
        }
        .header-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: var(--text-muted);
        }
        .date-tag {
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          white-space: nowrap;
        }
        .chevron {
          transition: transform 0.3s;
        }
        .chevron.up {
          transform: rotate(180deg);
          color: var(--accent-color);
        }
        .changelog-content {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: all 0.4s ease-in-out;
        }
        .changelog-content.show {
          max-height: 1000px;
          opacity: 1;
        }
        .content-inner {
          padding: 0 2rem 2rem 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          padding-top: 1.5rem;
        }

        @media (max-width: 768px) {
          .changelog-header {
            padding: 1.25rem 1rem;
            flex-direction: column;
            align-items: flex-start;
          }
          .header-main {
            width: 100%;
          }
          .header-meta {
            width: 100%;
            justify-content: space-between;
          }
          .content-inner {
            padding: 1.25rem 1rem;
          }
        }
      `}</style>
      <style jsx global>{`
        .markdown-body h3 { color: white !important; margin-bottom: 1rem; font-size: 1rem; font-weight: 700; }
        .markdown-body ul { padding-left: 0; list-style: none; }
        .markdown-body li { position: relative; padding-left: 1.2rem; margin-bottom: 0.6rem; }
        .markdown-body li::before { content: "•"; color: var(--accent-color); position: absolute; left: 0; font-weight: bold; }
        .markdown-body strong { color: white; }
      `}</style>
    </main>
  );
}




