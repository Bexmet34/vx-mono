"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { supabase } from "@veyronix/database";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Save, ArrowLeft, PlusCircle, Trash2, Eye, Languages, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChangelogAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    version: "",
    date: new Date().toISOString().split('T')[0],
    title_tr: "",
    title_en: "",
    content_tr: "",
    content_en: "",
    _previewLang: "tr"
  });

  const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID || "407234961582587916";

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/changelog");
      return;
    }

    if (status === "authenticated") {
      if (session?.user?.id !== ADMIN_ID) {
        alert("Yetkisiz erişim!");
        router.push("/changelog");
      } else {
        fetchLogs();
      }
    }
  }, [status, session?.user?.id, router]);

  async function fetchLogs() {
    const { data, error } = await supabase
      .from("changelogs")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Supabase fetch error:", error.message || error);
      return;
    }

    if (data) {
      setLogs(data);
      // Auto-calculate next version
      if (data.length > 0) {
        const lastVer = data[0].version; // Expecting "1.0.0"
        const parts = lastVer.replace("v", "").split(".").map(Number);
        if (parts.length === 3) {
          parts[2] += 1;
          setFormData(prev => ({ ...prev, version: parts.join(".") }));
        }
      } else {
        setFormData(prev => ({ ...prev, version: "1.0.0" }));
      }
    }
  }

  const handleTrTitleChange = (val) => {
    setFormData(prev => ({ 
      ...prev, 
      title_tr: val, 
      title_en: (prev.title_en === "" || prev.title_en === prev.title_tr) ? val : prev.title_en 
    }));
  };

  const handleTrContentChange = (val) => {
    setFormData(prev => ({ 
      ...prev, 
      content_tr: val, 
      content_en: (prev.content_en === "" || prev.content_en === prev.content_tr) ? val : prev.content_en 
    }));
  };

  async function translateFields() {
    if (!formData.title_tr && !formData.content_tr) {
      alert("Önce Türkçe kısımları doldurmalısınız!");
      return;
    }

    setTranslating(true);
    try {
      // Translate Title
      let translatedTitle = formData.title_en;
      if (formData.title_tr) {
        const resTitle = await fetch('/api/translate', {
          method: 'POST',
          body: JSON.stringify({ text: formData.title_tr })
        });
        const dataTitle = await resTitle.json();
        translatedTitle = dataTitle.translatedText;
      }

      // Translate Content
      let translatedContent = formData.content_en;
      if (formData.content_tr) {
        const resContent = await fetch('/api/translate', {
          method: 'POST',
          body: JSON.stringify({ text: formData.content_tr })
        });
        const dataContent = await resContent.json();
        translatedContent = dataContent.translatedText;
      }

      setFormData(prev => ({
        ...prev,
        title_en: translatedTitle,
        content_en: translatedContent
      }));
    } catch (error) {
      console.error("Translation fail:", error);
      alert("Çeviri sırasında bir hata oluştu.");
    } finally {
      setTranslating(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      version: formData.version.replace("v", ""),
      date: formData.date,
      title_tr: formData.title_tr,
      title_en: formData.title_en,
      content_tr: formData.content_tr,
      content_en: formData.content_en
    };

    const { error } = await supabase
      .from("changelogs")
      .insert([payload]);

    if (error) {
      console.error("Supabase insert error:", error.message || error);
      alert("Hata: " + (error.message || "Bilinmeyen bir hata oluştu."));
    } else {
      alert("Başarıyla kaydedildi!");
      const nextVer = formData.version; // This will be updated after fetchLogs
      setFormData({
        version: nextVer, 
        date: new Date().toISOString().split('T')[0],
        title_tr: "",
        title_en: "",
        content_tr: "",
        content_en: "",
        _previewLang: "tr"
      });
      fetchLogs();
    }
    setLoading(false);
  }

  async function deleteLog(id) {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    
    const { error } = await supabase.from("changelogs").delete().eq("id", id);
    if (!error) fetchLogs();
  }

  if (status === "loading") return <p style={{ padding: '2rem' }}>Yükleniyor...</p>;

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      
      <div className="container" style={{ padding: "4rem 1.5rem", flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800" }}>🚀 Güncelleme Yayınla</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={translateFields}
              disabled={translating}
              className="glass-panel" 
              style={{ 
                padding: '0.5rem 1rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                cursor: 'pointer', 
                color: 'var(--accent-color)',
                borderColor: 'var(--accent-color)',
                opacity: translating ? 0.6 : 1
              }}
            >
              {translating ? <Loader2 size={18} className="animate-spin" /> : <Languages size={18} />}
              {translating ? "Çevriliyor..." : "Tercüme Et (EN)"}
            </button>
            <button 
              onClick={() => setShowPreview(!showPreview)} 
              className="glass-panel" 
              style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', border: showPreview ? '1px solid var(--accent-color)' : '1px solid var(--border-color)' }}
            >
              <Eye size={18} /> {showPreview ? "Editöre Dön" : "Önizleme"}
            </button>
            <div style={{ background: 'rgba(252, 163, 11, 0.1)', color: 'var(--accent-color)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '800' }}>
              Sıradaki: {formData.version}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: showPreview ? "1fr" : "1.2fr 0.8fr", gap: "2.5rem" }}>
          {showPreview ? (
            <div className="glass-panel animate-fade-in" style={{ padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1.5rem" }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button 
                  onClick={() => setFormData(p => ({...p, _previewLang: 'tr'}))}
                  style={{ padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid var(--border-color)', background: (formData._previewLang || 'tr') === 'tr' ? 'var(--accent-color)' : 'transparent', color: (formData._previewLang || 'tr') === 'tr' ? 'black' : 'white', cursor: 'pointer', fontWeight: 'bold' }}
                >TR Preview</button>
                <button 
                  onClick={() => setFormData(p => ({...p, _previewLang: 'en'}))}
                  style={{ padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid var(--border-color)', background: (formData._previewLang || 'tr') === 'en' ? 'var(--accent-color)' : 'transparent', color: (formData._previewLang || 'tr') === 'en' ? 'black' : 'white', cursor: 'pointer', fontWeight: 'bold' }}
                >EN Preview</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ background: "var(--accent-color)", color: "var(--bg-color)", padding: "0.3rem 0.8rem", borderRadius: "8px", fontSize: "0.9rem", fontWeight: "bold" }}>
                  {formData.version}
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>{formData.date}</span>
              </div>
              <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "white" }}>{(formData._previewLang === 'en' ? formData.title_en : formData.title_tr) || "Başlık"}</h2>
              <div className="markdown-content" style={{ width: "100%", maxWidth: "800px", color: "var(--text-muted)", lineHeight: "1.8", fontSize: "1.1rem" }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {(formData._previewLang === 'en' ? formData.content_en : formData.content_tr) || "*İçerik buraya gelecek...*"}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: 'var(--accent-color)', fontWeight: 'bold' }}>Başlık (TR)</label>
                    <input 
                      type="text" 
                      placeholder="Neler değişti?"
                      value={formData.title_tr} 
                      onChange={e => handleTrTitleChange(e.target.value)}
                      style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "white" }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: 'var(--text-muted)' }}>Title (EN)</label>
                    <input 
                      type="text" 
                      placeholder="What changed?"
                      value={formData.title_en} 
                      onChange={e => setFormData({...formData, title_en: e.target.value})}
                      style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", color: "white" }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: 'var(--accent-color)', fontWeight: 'bold' }}>Detaylı İçerik (TR) [Markdown]</label>
                    <textarea 
                      value={formData.content_tr} 
                      onChange={e => handleTrContentChange(e.target.value)}
                      rows={10}
                      placeholder="Güncelleme detaylarını buraya yaz... Markdown kullanabilirsiniz."
                      style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "white", resize: "none", fontFamily: 'monospace' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: 'var(--text-muted)' }}>Detailed Content (EN) [Markdown]</label>
                    <textarea 
                      value={formData.content_en} 
                      onChange={e => setFormData({...formData, content_en: e.target.value})}
                      rows={10}
                      placeholder="Write details in English..."
                      style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", color: "white", resize: "none", fontFamily: 'monospace' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: "center", padding: '1rem' }}>
                    <Save size={20} /> {loading ? "Yükleniyor..." : "Yayınla"}
                  </button>
                  <Link href="/changelog" className="signout-btn" style={{ padding: '0px 1.5rem', display: 'flex', alignItems: 'center' }}>
                    İptal
                  </Link>
                </div>
              </form>

              {/* Mini History Sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: 'var(--text-muted)' }}>Geçmiş Yayınlar</h3>
                <div style={{ maxHeight: "500px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {logs.map(log => (
                    <div key={log.id} style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: '1px solid var(--border-color)' }} className="glass-panel">
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: "bold", fontSize: '0.85rem' }}>{log.version} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>• {log.date}</span></div>
                        <div style={{ fontSize: "0.9rem", color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.title_tr}</div>
                      </div>
                      <button onClick={() => deleteLog(log.id)} style={{ color: "rgba(255,77,79,0.5)", background: 'transparent', padding: '0.4rem', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        .markdown-content p { margin-bottom: 1rem; }
        .markdown-content ul, .markdown-content ol { margin-bottom: 1rem; padding-left: 1.5rem; }
        .markdown-content code { background: rgba(252, 163, 11, 0.1); color: var(--accent-color); padding: 0.2rem 0.4rem; borderRadius: 4px; font-family: monospace; }
        .markdown-content pre { background: rgba(0, 0, 0, 0.3); padding: 1rem; borderRadius: 8px; overflow-x: auto; border: 1px solid var(--border-color); }
        .markdown-content pre code { background: transparent; padding: 0; }
        .markdown-content h3 { color: white; margin-top: 1.5rem; }
      `}</style>
    </main>
  );
}
