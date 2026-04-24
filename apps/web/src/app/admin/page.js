"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Save, Bell, Loader2, AlertCircle, CheckCircle, Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { lang } = useLanguage();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const isAdmin = session?.user?.id === ADMIN_ID || session?.user?.id === "407234961582587916";
    if (status === "unauthenticated" || (status === "authenticated" && !isAdmin)) {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    const isAdmin = session?.user?.id === ADMIN_ID || session?.user?.id === "407234961582587916";
    if (status === "authenticated" && isAdmin) {
      fetchTemplates();
    }
  }, [status, session]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (res.ok) setTemplates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (template) => {
    setSavingId(template.id);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Şablon başarıyla güncellendi!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: "Güncelleme sırasında hata oluştu." });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingId(null);
    }
  };

  const handleInputChange = (id, field, value) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  if (status === "loading" || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "var(--bg-color)" }}>
        <Loader2 className="spin" size={48} color="var(--accent-color)" />
      </div>
    );
  }

  return (
    <main style={{ background: "var(--bg-color)", minHeight: "100vh", color: "white" }}>
      <Navbar />
      
      <div className="container" style={{ padding: "6rem 1rem" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "1rem" }}>Admin Mesaj Yönetimi</h1>
          <p style={{ color: "var(--text-muted)" }}>Botun kullanıcılara gönderdiği tüm mesaj şablonlarını buradan yönetebilirsiniz.</p>
        </div>

        {message && (
          <div className={`glass-panel animate-fade-in`} style={{ 
            padding: "1rem", 
            marginBottom: "2rem", 
            display: "flex", 
            alignItems: "center", 
            gap: "1rem",
            borderColor: message.type === "success" ? "#2ecc71" : "#e74c3c",
            background: message.type === "success" ? "rgba(46, 204, 113, 0.1)" : "rgba(231, 76, 60, 0.1)"
          }}>
            {message.type === "success" ? <CheckCircle color="#2ecc71" /> : <AlertCircle color="#e74c3c" />}
            <span>{message.text}</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div className="glass-panel" style={{ padding: "1.5rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-color)", marginBottom: "0.5rem" }}>
              <Info size={18} />
              <strong style={{ fontSize: "0.9rem" }}>Kullanılabilir Değişkenler:</strong>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <code>{`{sunucu}`}</code>: Sunucu Adı, <code>{`{tarih}`}</code>: Bitiş Tarihi, <code>{`{kullanici}`}</code>: Sahip Etiketi
            </p>
          </div>

          {templates.map(tpl => (
            <div key={tpl.id} className="glass-panel" style={{ padding: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ background: "var(--accent-color)", padding: "0.5rem", borderRadius: "8px" }}>
                    <Bell size={24} color="black" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>{tpl.id.toUpperCase().replace('_', ' ')}</h2>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>ID: {tpl.id}</span>
                  </div>
                </div>
                <button 
                  className="btn-primary" 
                  disabled={savingId === tpl.id}
                  onClick={() => handleUpdate(tpl)}
                  style={{ padding: "0.6rem 1.5rem" }}
                >
                  {savingId === tpl.id ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
                  Kaydet
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                {/* Türkçe */}
                <div>
                  <h3 style={{ fontSize: "1rem", marginBottom: "1rem", opacity: 0.8 }}>🇹🇷 Türkçe İçerik</h3>
                  <div className="input-group" style={{ marginBottom: "1rem" }}>
                    <label>Başlık (Title)</label>
                    <input 
                      type="text" 
                      value={tpl.title_tr} 
                      onChange={(e) => handleInputChange(tpl.id, 'title_tr', e.target.value)}
                      style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "0.8rem", borderRadius: "8px", width: "100%" }}
                    />
                  </div>
                  <div className="input-group">
                    <label>Mesaj (Content)</label>
                    <textarea 
                      rows={5}
                      value={tpl.content_tr} 
                      onChange={(e) => handleInputChange(tpl.id, 'content_tr', e.target.value)}
                      style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "0.8rem", borderRadius: "8px", width: "100%", resize: "vertical" }}
                    />
                  </div>
                </div>

                {/* İngilizce */}
                <div>
                  <h3 style={{ fontSize: "1rem", marginBottom: "1rem", opacity: 0.8 }}>🇺🇸 English Content</h3>
                  <div className="input-group" style={{ marginBottom: "1rem" }}>
                    <label>Title</label>
                    <input 
                      type="text" 
                      value={tpl.title_en} 
                      onChange={(e) => handleInputChange(tpl.id, 'title_en', e.target.value)}
                      style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "0.8rem", borderRadius: "8px", width: "100%" }}
                    />
                  </div>
                  <div className="input-group">
                    <label>Content</label>
                    <textarea 
                      rows={5}
                      value={tpl.content_en} 
                      onChange={(e) => handleInputChange(tpl.id, 'content_en', e.target.value)}
                      style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "0.8rem", borderRadius: "8px", width: "100%", resize: "vertical" }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label>Embed Rengi (HEX):</label>
                  <input 
                    type="color" 
                    value={tpl.color || "#2ecc71"} 
                    onChange={(e) => handleInputChange(tpl.id, 'color', e.target.value)}
                    style={{ border: "none", background: "none", width: "40px", height: "40px", cursor: "pointer" }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input 
                    type="checkbox" 
                    checked={tpl.is_embed} 
                    onChange={(e) => handleInputChange(tpl.id, 'is_embed', e.target.checked)}
                    id={`embed-${tpl.id}`}
                  />
                  <label htmlFor={`embed-${tpl.id}`} style={{ cursor: "pointer" }}>Embed Olarak Gönder</label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .input-group label { display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-muted); }
      `}</style>
    </main>
  );
}
