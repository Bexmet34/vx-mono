"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Save, Bell, Loader2, AlertCircle, CheckCircle, Info, 
  LayoutDashboard, Server, MessageSquare, Settings, 
  Users, BarChart3, ShieldAlert, LogOut, ChevronRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("notifications");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState(null);

  // Auth Check
  useEffect(() => {
    const isAdmin = session?.user?.id === ADMIN_ID || session?.user?.id === "407234961582587916";
    if (status === "unauthenticated" || (status === "authenticated" && !isAdmin)) {
      router.push("/");
    }
  }, [status, session, router]);

  // Initial Data Fetch
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

  const handleUpdateTemplate = async (template) => {
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

  const menuItems = [
    { id: "overview", label: "Genel Bakış", icon: <LayoutDashboard size={20} /> },
    { id: "notifications", label: "Bildirim Şablonları", icon: <Bell size={20} /> },
    { id: "servers", label: "Sunucu Listesi", icon: <Server size={20} /> },
    { id: "broadcast", label: "Duyuru Gönder", icon: <MessageSquare size={20} /> },
    { id: "users", label: "Global Kullanıcılar", icon: <Users size={20} /> },
    { id: "stats", label: "İstatistikler", icon: <BarChart3 size={20} /> },
    { id: "settings", label: "Sistem Ayarları", icon: <Settings size={20} /> },
    { id: "security", label: "Güvenlik & Loglar", icon: <ShieldAlert size={20} /> },
  ];

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
      
      <div style={{ display: "flex", paddingTop: "var(--nav-height)", height: "100vh", overflow: "hidden" }}>
        
        {/* SIDEBAR */}
        <aside style={{ 
          width: "280px", 
          borderRight: "1px solid var(--border-color)", 
          background: "rgba(255,255,255,0.02)",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem"
        }}>
          <div style={{ marginBottom: "2rem", padding: "0 0.5rem" }}>
            <h2 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", marginBottom: "1rem" }}>Yönetim Paneli</h2>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
            {menuItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.8rem 1rem",
                  borderRadius: "10px",
                  border: "none",
                  background: activeTab === item.id ? "rgba(252, 163, 17, 0.15)" : "transparent",
                  color: activeTab === item.id ? "var(--accent-color)" : "var(--text-muted)",
                  cursor: "pointer",
                  transition: "0.2s",
                  textAlign: "left",
                  fontSize: "0.95rem",
                  fontWeight: activeTab === item.id ? "600" : "400"
                }}
                className="admin-nav-item"
              >
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
                {activeTab === item.id && <ChevronRight size={16} />}
              </button>
            ))}
          </nav>

          <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem" }}>
              {session?.user?.image && <img src={session.user.image} width={32} height={32} style={{ borderRadius: "50%" }} />}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session?.user?.name}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Bot Sahibi</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <section style={{ flex: 1, overflowY: "auto", padding: "2.5rem" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>
                {menuItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Veyronix sistemini buradan kontrol edin.
              </p>
            </div>
            {message && (
              <div className="glass-panel animate-fade-in" style={{ 
                padding: "0.75rem 1.25rem", 
                display: "flex", 
                alignItems: "center", 
                gap: "0.75rem",
                borderColor: message.type === "success" ? "#2ecc71" : "#e74c3c",
                background: "rgba(0,0,0,0.3)"
              }}>
                {message.type === "success" ? <CheckCircle size={18} color="#2ecc71" /> : <AlertCircle size={18} color="#e74c3c" />}
                <span style={{ fontSize: "0.9rem" }}>{message.text}</span>
              </div>
            )}
          </div>

          {/* TAB CONTENT: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div className="glass-panel" style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-color)", marginBottom: "0.5rem" }}>
                  <Info size={18} />
                  <strong style={{ fontSize: "0.9rem" }}>Kullanılabilir Değişkenler:</strong>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <code>{`{sunucu}`}</code>: Sunucu Adı, <code>{`{tarih}`}</code>: Bitiş Tarihi, <code>{`{kullanici}`}</code>: Sahip Etiketi
                </p>
              </div>

              {templates.map(tpl => (
                <div key={tpl.id} className="glass-panel animate-fade-in" style={{ padding: "2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ background: "var(--accent-color)", padding: "0.5rem", borderRadius: "8px" }}>
                        <Bell size={24} color="black" />
                      </div>
                      <div>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{tpl.id.toUpperCase().replace('_', ' ')}</h2>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ID: {tpl.id}</span>
                      </div>
                    </div>
                    <button 
                      className="btn-primary" 
                      disabled={savingId === tpl.id}
                      onClick={() => handleUpdateTemplate(tpl)}
                      style={{ padding: "0.5rem 1.25rem", fontSize: "0.9rem" }}
                    >
                      {savingId === tpl.id ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
                      Güncelle
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                    {/* TR */}
                    <div className="form-section">
                      <label style={labelStyle}>🇹🇷 Türkçe Başlık</label>
                      <input 
                        className="admin-input"
                        type="text" 
                        value={tpl.title_tr} 
                        onChange={(e) => handleInputChange(tpl.id, 'title_tr', e.target.value)}
                      />
                      <label style={{...labelStyle, marginTop: "1rem"}}>🇹🇷 Mesaj İçeriği</label>
                      <textarea 
                        className="admin-input"
                        rows={5}
                        value={tpl.content_tr} 
                        onChange={(e) => handleInputChange(tpl.id, 'content_tr', e.target.value)}
                      />
                    </div>
                    {/* EN */}
                    <div className="form-section">
                      <label style={labelStyle}>🇺🇸 English Title</label>
                      <input 
                        className="admin-input"
                        type="text" 
                        value={tpl.title_en} 
                        onChange={(e) => handleInputChange(tpl.id, 'title_en', e.target.value)}
                      />
                      <label style={{...labelStyle, marginTop: "1rem"}}>🇺🇸 Message Content</label>
                      <textarea 
                        className="admin-input"
                        rows={5}
                        value={tpl.content_en} 
                        onChange={(e) => handleInputChange(tpl.id, 'content_en', e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Embed Rengi:</span>
                      <input 
                        type="color" 
                        value={tpl.color || "#2ecc71"} 
                        onChange={(e) => handleInputChange(tpl.id, 'color', e.target.value)}
                        style={{ border: "none", background: "none", width: "30px", height: "30px", cursor: "pointer" }}
                      />
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem" }}>
                      <input 
                        type="checkbox" 
                        checked={tpl.is_embed} 
                        onChange={(e) => handleInputChange(tpl.id, 'is_embed', e.target.checked)}
                      />
                      Embed Olarak Gönder
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PLACEHOLDER FOR OTHER TABS */}
          {activeTab !== "notifications" && (
            <div className="glass-panel" style={{ padding: "4rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "2rem", borderRadius: "50%" }}>
                {menuItems.find(i => i.id === activeTab)?.icon}
              </div>
              <h2 style={{ fontSize: "1.5rem" }}>{menuItems.find(i => i.id === activeTab)?.label} Yakında</h2>
              <p style={{ color: "var(--text-muted)", maxWidth: "400px" }}>
                Bu modül şu an geliştirme aşamasındadır. Çok yakında Veyronix'i daha detaylı yönetebileceksiniz.
              </p>
            </div>
          )}

        </section>
      </div>
      
      <style jsx>{`
        .admin-nav-item:hover { background: rgba(255, 255, 255, 0.05) !important; color: white !important; }
        .admin-input {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          padding: 0.8rem;
          borderRadius: 10px;
          width: 100%;
          transition: 0.2s;
          outline: none;
        }
        .admin-input:focus { border-color: var(--accent-color); background: rgba(0,0,0,0.4); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "0.5rem",
  fontSize: "0.8rem",
  fontWeight: "600",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};
