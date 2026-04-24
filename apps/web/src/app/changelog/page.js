"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@veyronix/database";
import { Calendar, ChevronDown, ChevronUp, Tag, History, Loader2 } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ChangelogPage() {
  const { lang, t } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState(-1);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from("changelogs")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (data) {
        setLogs(data);
        // Check hash after logs are loaded
        const hash = window.location.hash.replace('#', '');
        if (hash) {
          const index = data.findIndex(log => log.version === hash || `v${log.version}` === hash || log.version === `v${hash}`);
          if (index !== -1) setExpandedIndex(index);
        }
      }
      setLoading(false);
    }
    fetchLogs();
  }, []);

  const toggleAccordion = (index) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
    if (expandedIndex !== index && logs[index]) {
      window.history.replaceState(null, null, `#${logs[index].version}`);
    } else {
      window.history.replaceState(null, null, ' ');
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      
      <div className="container" style={{ padding: "4rem 1.5rem", flex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }} className="animate-fade-in">
          <div style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            background: "rgba(252, 163, 11, 0.1)", 
            color: "var(--accent-color)", 
            padding: "0.5rem 1.2rem", 
            borderRadius: "100px",
            fontSize: "0.9rem",
            fontWeight: "bold",
            marginBottom: "1rem"
          }}>
            <History size={16} />
            {t.changelog}
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: "800", marginBottom: "1rem" }}>
            {lang === "en" ? "Development History" : "Gelişim Geçmişi"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
            {lang === "en" 
              ? "Stay updated with the latest improvements, bug fixes, and feature additions to the Veyronix ecosystem." 
              : "Veyronix ekosistemindeki en son iyileştirmeler, hata düzeltmeleri ve özellik eklemeleri hakkında güncel kalın."}
          </p>
        </div>

        <div style={{ 
          maxWidth: "800px", 
          margin: "0 auto", 
          display: "flex", 
          flexDirection: "column", 
          gap: "1.5rem" 
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem' }} />
              Yükleniyor...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Henüz bir güncelleme notu bulunmuyor.
            </div>
          ) : logs.map((item, index) => {
            const isExpanded = expandedIndex === index;
            const content = lang === "tr" ? item.content_tr : item.content_en;
            const title = lang === "tr" ? item.title_tr : item.title_en;
            const displayContent = isExpanded ? content : (content.length > 250 ? content.substring(0, 250) + "..." : content);

            return (
              <div 
                id={item.version}
                key={index} 
                className="glass-panel animate-fade-in" 
                style={{ 
                  overflow: "hidden", 
                  transition: "all 0.3s ease",
                  animationDelay: `${index * 0.1}s`,
                  boxShadow: isExpanded ? "0 10px 40px rgba(0,0,0,0.4)" : "none",
                  borderColor: isExpanded ? "var(--accent-color)" : "var(--border-color)",
                  borderWidth: isExpanded ? "2px" : "1px"
                }}
              >
                <div 
                  onClick={() => toggleAccordion(index)}
                  style={{ 
                    padding: "2rem", 
                    cursor: "pointer", 
                    display: "flex", 
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: "1rem",
                    background: isExpanded ? "rgba(255, 255, 255, 0.03)" : "transparent"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
                    <span style={{ 
                      background: "var(--accent-color)", 
                      color: "var(--bg-color)", 
                      padding: "0.3rem 0.8rem", 
                      borderRadius: "8px", 
                      fontSize: "0.9rem", 
                      fontWeight: "bold" 
                    }}>
                      v{item.version}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                      <Calendar size={16} />
                      {new Date(item.date).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  
                  <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "white" }}>{title}</h2>

                  <div className={`markdown-content ${isExpanded ? 'expanded' : 'collapsed'}`} style={{ 
                    color: "var(--text-muted)", 
                    lineHeight: "1.8", 
                    fontSize: "1.05rem",
                    width: "100%",
                    textAlign: "center"
                  }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {displayContent}
                    </ReactMarkdown>
                  </div>

                  <div style={{ 
                    color: isExpanded ? "var(--accent-color)" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    marginTop: "0.5rem"
                  }}>
                    {isExpanded ? (
                      <>{lang === 'tr' ? 'Daha az göster' : 'Show less'} <ChevronUp size={18} /></>
                    ) : (
                      <>{lang === 'tr' ? 'Devamını oku' : 'Read more'} <ChevronDown size={18} /></>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        .markdown-content p {
          margin-bottom: 1rem;
        }
        .markdown-content ul, .markdown-content ol {
          margin-bottom: 1rem;
          padding-left: 0;
          list-style-position: inside;
        }
        .markdown-content li {
          margin-bottom: 0.5rem;
        }
        .markdown-content code {
          background: rgba(252, 163, 11, 0.1);
          color: var(--accent-color);
          padding: 0.2rem 0.4rem;
          borderRadius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9em;
        }
        .markdown-content pre {
          background: rgba(0, 0, 0, 0.3);
          padding: 1rem;
          borderRadius: 8px;
          overflow-x: auto;
          margin-bottom: 1.5rem;
          border: 1px solid var(--border-color);
        }
        .markdown-content pre code {
          background: transparent;
          padding: 0;
          color: #e2e8f0;
        }
        .markdown-content h3 {
          color: white;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-size: 1.25rem;
        }
        .markdown-content strong {
          color: white;
        }
        
        .collapsed {
          max-height: 150px;
          overflow: hidden;
          position: relative;
        }
        
        .collapsed::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 60px;
          background: linear-gradient(transparent, rgba(10, 10, 12, 0.8));
          pointer-events: none;
        }

        .glass-panel:hover {
          border-color: rgba(252, 163, 11, 0.4);
          transform: translateY(-2px);
        }
      `}</style>
    </main>
  );
}
