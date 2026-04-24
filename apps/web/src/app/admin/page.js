"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Save, Bell, Loader2, AlertCircle, CheckCircle, Info, 
  LayoutDashboard, Server, MessageSquare, Settings, 
  Users, BarChart3, ShieldAlert, ChevronRight, Search,
  Clock, Infinity, Power, Calendar
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("notifications");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Data States
  const [templates, setTemplates] = useState([]);
  const [servers, setServers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [savingId, setSavingId] = useState(null);
  
  // Modal States
  const [showDayModal, setShowDayModal] = useState(null);
  const [daysToAdd, setDaysToAdd] = useState(30);

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
      if (activeTab === "notifications") fetchTemplates();
      if (activeTab === "servers") fetchServers();
    }
  }, [status, session, activeTab]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (res.ok) setTemplates(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchServers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/servers");
      const data = await res.json();
      if (res.ok) setServers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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

  const handleServerAction = async (guildId, action, value) => {
    setSavingId(guildId);
    try {
      const res = await fetch("/api/admin/servers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId, action, value }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "İşlem başarılı!" });
        fetchServers();
        setShowDayModal(null);
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

  const filteredServers = servers.filter(s => 
    s.guild_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.guild_id?.includes(searchTerm) ||
    s.owner_id?.includes(searchTerm)
  );

  const menuItems = [
    { id: "overview", label: "Genel Bakış", icon: <LayoutDashboard size={18} /> },
    { id: "notifications", label: "Bildirimler", icon: <Bell size={18} /> },
    { id: "servers", label: "Sunucu Listesi", icon: <Server size={18} /> },
    { id: "broadcast", label: "Duyuru", icon: <MessageSquare size={18} /> },
    { id: "stats", label: "İstatistik", icon: <BarChart3 size={18} /> },
    { id: "settings", label: "Ayarlar", icon: <Settings size={18} /> },
  ];

  if (status === "loading") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "var(--bg-color)" }}>
        <Loader2 className="spin" size={48} color="var(--accent-color)" />
      </div>
    );
  }

  return (
    <main style={{ background: "var(--bg-color)", height: "100vh", color: "white", overflow: "hidden" }}>
      <Navbar />
      
      <div style={{ display: "flex", height: "calc(100vh - var(--nav-height))", overflow: "hidden" }}>
        
        {/* SIDEBAR */}
        <aside style={{ 
          width: "250px", borderRight: "1px solid rgba(255,255,255,0.05)", background: "rgba(11, 12, 16, 0.5)",
          display: "flex", flexDirection: "column", padding: "1.5rem", flexShrink: 0
        }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
            {menuItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.75rem 1rem", borderRadius: "10px", border: "none",
                  background: activeTab === item.id ? "rgba(252, 163, 17, 0.08)" : "transparent",
                  color: activeTab === item.id ? "var(--accent-color)" : "var(--text-muted)",
                  cursor: "pointer", transition: "0.2s", textAlign: "left", fontSize: "0.9rem", fontWeight: activeTab === item.id ? "600" : "400"
                }}
                className="admin-nav-item"
              >
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
              </button>
            ))}
          </nav>
          <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem" }}>
              {session?.user?.image && <img src={session.user.image} width={28} height={28} style={{ borderRadius: "50%" }} />}
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "white" }}>{session?.user?.name}</div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Administrator</div>
              </div>
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <section style={{ flex: 1, overflowY: "auto", padding: "2rem 3rem", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: "800", letterSpacing: "-0.5px" }}>{menuItems.find(i => i.id === activeTab)?.label}</h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>Sistem kaynaklarını ve yapılandırmalarını yönetin.</p>
            </div>
            {message && (
              <div className="glass-panel animate-fade-in" style={{ padding: "0.6rem 1rem", display: "flex", alignItems: "center", gap: "0.6rem", borderColor: message.type === "success" ? "rgba(46, 204, 113, 0.4)" : "rgba(231, 76, 60, 0.4)", background: "rgba(0,0,0,0.6)" }}>
                {message.type === "success" ? <CheckCircle size={16} color="#2ecc71" /> : <AlertCircle size={16} color="#e74c3c" />}
                <span style={{ fontSize: "0.85rem" }}>{message.text}</span>
              </div>
            )}
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "10rem" }}><Loader2 className="spin" size={32} color="var(--accent-color)" /></div>
          ) : (
            <>
              {/* NOTIFICATIONS */}
              {activeTab === "notifications" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {templates.map(tpl => (
                    <div key={tpl.id} className="glass-panel" style={{ padding: "1.5rem", background: "rgba(255,255,255,0.01)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ background: "rgba(252, 163, 17, 0.1)", padding: "0.5rem", borderRadius: "8px" }}><Bell size={20} color="var(--accent-color)" /></div>
                          <h2 style={{ fontSize: "1rem", fontWeight: "700" }}>{tpl.id.toUpperCase().replace('_', ' ')}</h2>
                        </div>
                        <button className="btn-primary" disabled={savingId === tpl.id} onClick={() => handleUpdateTemplate(tpl)} style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                          {savingId === tpl.id ? <Loader2 className="spin" size={14} /> : <Save size={14} />} Kaydet
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div>
                          <label style={labelStyle}>🇹🇷 TR Başlık</label>
                          <input className="admin-input" value={tpl.title_tr} onChange={(e) => handleInputChange(tpl.id, 'title_tr', e.target.value)} />
                          <label style={{...labelStyle, marginTop: "1rem"}}>🇹🇷 TR İçerik</label>
                          <textarea className="admin-input" rows={3} value={tpl.content_tr} onChange={(e) => handleInputChange(tpl.id, 'content_tr', e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>🇺🇸 EN Title</label>
                          <input className="admin-input" value={tpl.title_en} onChange={(e) => handleInputChange(tpl.id, 'title_en', e.target.value)} />
                          <label style={{...labelStyle, marginTop: "1rem"}}>🇺🇸 EN Content</label>
                          <textarea className="admin-input" rows={3} value={tpl.content_en} onChange={(e) => handleInputChange(tpl.id, 'content_en', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SERVERS */}
              {activeTab === "servers" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div style={{ position: "relative", maxWidth: "400px" }}>
                    <Search style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} size={16} />
                    <input 
                      className="admin-input" 
                      placeholder="Sunucu veya Sahip Ara..." 
                      style={{ paddingLeft: "2.5rem", fontSize: "0.85rem", borderRadius: "12px" }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="glass-panel" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <th style={thStyle}>Sunucu</th>
                          <th style={thStyle}>Sahip ID</th>
                          <th style={thStyle}>Durum</th>
                          <th style={thStyle}>Bitiş Tarihi</th>
                          <th style={{...thStyle, textAlign: "right"}}>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredServers.map(s => {
                          const isExpired = !s.is_unlimited && new Date(s.expires_at) < new Date();
                          const isPassive = !s.is_active;
                          
                          return (
                            <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)", opacity: isPassive ? 0.6 : 1 }} className="row-hover">
                              <td style={tdStyle}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                  <div style={{ 
                                    width: "36px", height: "36px", borderRadius: "8px", 
                                    background: "linear-gradient(135deg, rgba(252, 163, 17, 0.2) 0%, rgba(252, 163, 17, 0.05) 100%)",
                                    border: "1px solid rgba(252, 163, 17, 0.2)",
                                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "var(--accent-color)", fontSize: "0.9rem"
                                  }}>
                                    {s.guild_name?.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{s.guild_name}</div>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{s.guild_id}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={tdStyle}><code style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{s.owner_id}</code></td>
                              <td style={tdStyle}>
                                {isPassive ? (
                                  <span className="badge badge-passive">Pasif</span>
                                ) : s.is_unlimited ? (
                                  <span className="badge badge-unlimited">Sınırsız</span>
                                ) : isExpired ? (
                                  <span className="badge badge-expired">Süresi Dolmuş</span>
                                ) : (
                                  <span className="badge badge-active">Aktif</span>
                                )}
                              </td>
                              <td style={tdStyle}>
                                <div style={{ fontSize: "0.85rem", color: isExpired && !s.is_unlimited ? "#e74c3c" : "inherit" }}>
                                  {s.is_unlimited ? "Süresiz" : format(new Date(s.expires_at), "dd MMM yyyy HH:mm", { locale: tr })}
                                </div>
                              </td>
                              <td style={{...tdStyle, textAlign: "right"}}>
                                <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                                  <button className="minimal-btn" title="Süre" onClick={() => setShowDayModal(s.guild_id)}><Clock size={16} /></button>
                                  <button className={`minimal-btn ${s.is_unlimited ? 'active' : ''}`} title="Sınırsız" onClick={() => handleServerAction(s.guild_id, 'toggle_unlimited', !s.is_unlimited)}><Infinity size={16} /></button>
                                  <button className={`minimal-btn ${!s.is_active ? 'danger' : ''}`} title="Durum" onClick={() => handleServerAction(s.guild_id, 'toggle_active', !s.is_active)}><Power size={16} /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* MODAL */}
      {showDayModal && (
        <div className="modal-overlay" onClick={() => setShowDayModal(null)}>
          <div className="glass-panel animate-fade-in" style={{ width: "350px", padding: "1.5rem", background: "#0b0c10" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><Calendar size={20} color="var(--accent-color)" /> Süre Ekle</h2>
            <input className="admin-input" type="number" value={daysToAdd} onChange={(e) => setDaysToAdd(e.target.value)} style={{ marginBottom: "1.5rem", textAlign: "center", fontSize: "1.1rem" }} />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="signout-btn" style={{ flex: 1, padding: "0.6rem" }} onClick={() => setShowDayModal(null)}>İptal</button>
              <button className="btn-primary" style={{ flex: 1, padding: "0.6rem", justifyContent: "center" }} onClick={() => handleServerAction(showDayModal, 'add_days', daysToAdd)}>Onayla</button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .admin-nav-item:hover { color: white !important; background: rgba(255,255,255,0.03) !important; }
        .admin-input { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); color: white; padding: 0.6rem 0.8rem; border-radius: 8px; width: 100%; transition: 0.2s; outline: none; font-size: 0.9rem; }
        .admin-input:focus { border-color: var(--accent-color); background: rgba(0,0,0,0.3); }
        .row-hover:hover { background: rgba(255,255,255,0.015); }
        .badge { padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-active { background: rgba(46, 204, 113, 0.1); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.2); }
        .badge-expired { background: rgba(231, 76, 60, 0.1); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.2); }
        .badge-unlimited { background: rgba(155, 89, 182, 0.1); color: #9b59b6; border: 1px solid rgba(155, 89, 182, 0.2); }
        .badge-passive { background: rgba(255, 255, 255, 0.05); color: #888; border: 1px solid rgba(255, 255, 255, 0.1); }
        .minimal-btn { background: rgba(255,255,255,0.03); color: var(--text-muted); border: 1px solid rgba(255,255,255,0.05); padding: 0.4rem; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .minimal-btn:hover { background: rgba(252, 163, 17, 0.1); color: var(--accent-color); border-color: var(--accent-color); }
        .minimal-btn.active { background: rgba(155, 89, 182, 0.1); color: #9b59b6; border-color: #9b59b6; }
        .minimal-btn.danger:hover { background: rgba(231, 76, 60, 0.1); color: #e74c3c; border-color: #e74c3c; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

const thStyle = { padding: "1rem 1.25rem", fontSize: "0.75rem", fontWeight: "700", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" };
const tdStyle = { padding: "1rem 1.25rem", verticalAlign: "middle" };
const labelStyle = { display: "block", marginBottom: "0.4rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" };
