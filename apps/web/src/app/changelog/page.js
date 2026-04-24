"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Calendar, ChevronDown, History, Sparkles, Zap, Shield, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const staticLogs = [
  {
    version: "2.0.0",
    date: "2024-04-24",
    title_tr: "Monorepo ve Performans Çağı",
    title_en: "The Age of Monorepo & Performance",
    type: "major",
    content_tr: "### Neler Değişti?\n- **Monorepo Geçişi:** Tüm servisler Turborepo ile birleştirildi.\n- **Hız:** Bot yanıt süreleri optimize edildi.\n- **Web:** Dashboard altyapısı Next.js sürümüne yükseltildi.",
    content_en: "### What's New?\n- **Monorepo Migration:** All services unified with Turborepo.\n- **Speed:** Bot response times optimized.\n- **Web:** Dashboard infrastructure upgraded."
  },
  {
    version: "1.9.5",
    date: "2024-04-15",
    title_tr: "Gelişmiş Ticket Sistemi",
    title_en: "Advanced Ticket System",
    type: "feature",
    content_tr: "### Yeni Özellikler\n- Sunucular için çoklu kategori desteği.\n- Yetkili rolleri için özel paneller.\n- Kapanan ticketlar için transcript desteği.",
    content_en: "### New Features\n- Multi-category support for servers.\n- Custom panels for staff roles.\n- Transcript support for closed tickets."
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
    content_tr: "### Savaş Meydanı Hazırlığı\n- `/create` komutu ile saniyeler içinde ZvZ partileri kurabilme.\n- Rol seçim butonları eklendi.",
    content_en: "### Battlefield Prep\n- Create ZvZ parties in seconds with the `/create` command.\n- Role selection buttons added."
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
    content_tr: "- Spam koruması iyileştirildi.\n- Whitelist sistemi ile güvenilir kullanıcılara yetkiler tanımlandı.",
    content_en: "- Improved spam protection.\n- Permissions defined for trusted users via the Whitelist system."
  },
  {
    version: "1.3.0",
    date: "2024-02-01",
    title_tr: "Discord Role Sync",
    title_en: "Discord Role Sync",
    type: "feature",
    content_tr: "- Oyun içi rütbelerin Discord rolleriyle senkronize edilmesi.\n- Otomatik yetki verme sistemi.",
    content_en: "- Syncing in-game ranks with Discord roles.\n- Automatic permission granting system."
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
    title_tr: "Veyronix'e Merhaba",
    title_en: "Hello to Veyronix",
    type: "major",
    content_tr: "### İlk Sürüm\n- Veyronix botun ilk kararlı sürümü yayınlandı.\n- Temel parti kurma özellikleri aktif.",
    content_en: "### Initial Release\n- First stable version of Veyronix bot released.\n- Core party building features are live."
  }
];

export default function ChangelogPage() {
  const { lang } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState(0);

  const getTypeIcon = (type) => {
    switch(type) {
      case 'major': return <Sparkles size={18} color="#FCA311" />;
      case 'feature': return <Zap size={18} color="#60A5FA" />;
      case 'security': return <Shield size={18} color="#4ADE80" />;
      default: return <Globe size={18} color="#A78BFA" />;
    }
  };

  return (
    <main style={{ backgroundColor: "var(--bg-color)", minHeight: "100vh", color: "white" }}>
      <Navbar />
      
      <div className="container" style={{ padding: "5rem 1rem" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            background: "rgba(252, 163, 17, 0.1)", 
            color: "var(--accent-color)", 
            padding: "0.5rem 1.2rem", 
            borderRadius: "100px",
            fontSize: "0.9rem",
            fontWeight: "bold",
            marginBottom: "1.5rem",
            border: "1px solid rgba(252, 163, 17, 0.2)"
          }}>
            <History size={16} />
            {lang === "en" ? "Changelog" : "Güncelleme Notları"}
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)", fontWeight: "800", marginBottom: "1rem" }}>
            {lang === "en" ? "Evolution of Veyronix" : "Veyronix'in Gelişimi"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
            {lang === "en" 
              ? "Follow our journey as we build the ultimate tools for the Albion Online community." 
              : "Albion Online topluluğu için en iyi araçları geliştirirken geçirdiğimiz yolculuğu takip edin."}
          </p>
        </div>

        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {staticLogs.map((item, index) => {
            const isExpanded = expandedIndex === index;
            const content = lang === "tr" ? item.content_tr : item.content_en;
            const title = lang === "tr" ? item.title_tr : item.title_en;

            return (
              <div 
                key={item.version}
                className="glass-panel"
                style={{ 
                  borderColor: isExpanded ? "var(--accent-color)" : "var(--border-color)",
                  transition: "all 0.4s ease",
                  overflow: "hidden"
                }}
              >
                <div 
                  onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                  style={{ padding: "1.5rem 2rem", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ 
                        background: "rgba(255,255,255,0.05)", 
                        padding: "0.75rem", 
                        borderRadius: "12px",
                        display: "flex"
                      }}>
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.2rem" }}>
                          <span style={{ color: "var(--accent-color)", fontWeight: "bold", fontSize: "0.9rem" }}>v{item.version}</span>
                          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <Calendar size={12} /> {item.date}
                          </span>
                        </div>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>{title}</h2>
                      </div>
                    </div>
                    <div style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.3s", color: "var(--text-muted)" }}>
                      <ChevronDown size={24} />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: "0 2rem 2rem 2rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
      
      <style jsx global>{`
        .markdown-body h3 { color: white !important; margin-bottom: 1rem; font-size: 1.1rem; }
        .markdown-body ul { padding-left: 0; list-style: none; }
        .markdown-body li { position: relative; padding-left: 1.2rem; margin-bottom: 0.5rem; }
        .markdown-body li::before { content: "•"; color: var(--accent-color); position: absolute; left: 0; font-weight: bold; }
        .markdown-body strong { color: white; }
        .glass-panel:hover { border-color: rgba(252, 163, 17, 0.4); }
      `}</style>
    </main>
  );
}


