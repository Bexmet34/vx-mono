"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Save, Bell, Loader2, AlertCircle, CheckCircle, Info, 
  LayoutDashboard, Server, MessageSquare, Settings, 
  Users, BarChart3, ShieldAlert, ChevronRight, Search,
  Clock, Infinity, Power, ExternalLink, Calendar
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
  const [showDayModal, setShowDayModal] = useState(null); // stores guildId
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
        setMessage({ type: "success", text: "İşlem başarıyla tamamlandı!" });
        fetchServers(); // Refresh list
        setShowDayModal(null);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSavingId(null);
    }
  };

  const filteredServers = servers.filter(s => 
    s.guild_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.guild_id?.includes(searchTerm) ||
    s.owner_id?.includes(searchTerm)
  );

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
          width: "280px", 
          borderRight: "1px solid var(--border-color)", 
          background: "rgba(255,255,255,0.02)",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem",
          flexShrink: 0
        }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
            {menuItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.8rem 1rem", borderRadius: "10px", border: "none",
                  background: activeTab === item.id ? "rgba(252, 163, 17, 0.15)" : "transparent",
                  color: activeTab === item.id ? "var(--accent-color)" : "var(--text-muted)",
                  cursor: "pointer", transition: "0.2s", textAlign: "left", fontSize: "0.95rem", fontWeight: activeTab === item.id ? "600" : "400"
                }}
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

        {/* CONTENT */}
        <section style={{ flex: 1, overflowY: "auto", padding: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>{menuItems.find(i => i.id === activeTab)?.label}</h1>
              <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>Sistem yönetim merkezi.</p>
            </div>
            {message && (
              <div className="glass-panel" style={{ padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", borderColor: message.type === "success" ? "#2ecc71" : "#e74c3c", background: "rgba(0,0,0,0.5)" }}>
                {message.type === "success" ? <CheckCircle size={18} color="#2ecc71" /> : <AlertCircle size={18} color="#e74c3c" />}
                <span style={{ fontSize: "0.9rem" }}>{message.text}</span>
              </div>
            )}
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}><Loader2 className="spin" size={32} /></div>
          ) : (
            <>
              {/* NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                  {templates.map(tpl => (
                    <div key={tpl.id} className="glass-panel" style={{ padding: "2rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <div style={{ background: "var(--accent-color)", padding: "0.5rem", borderRadius: "8px" }}><Bell size={24} color="black" /></div>
                          <div>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{tpl.id.toUpperCase().replace('_', ' ')}</h2>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ID: {tpl.id}</span>
                          </div>
                        </div>
                        <button className="btn-primary" disabled={savingId === tpl.id} onClick={() => handleUpdateTemplate(tpl)} style={{ padding: "0.5rem 1.25rem" }}>
                          {savingId === tpl.id ? <Loader2 className="spin" size={16} /> : <Save size={16} />} Güncelle
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                        <div>
                          <label style={labelStyle}>🇹🇷 TR Başlık</label>
                          <input className="admin-input" type="text" value={tpl.title_tr} onChange={(e) => handleInputChange(tpl.id, 'title_tr', e.target.value)} />
                          <label style={{...labelStyle, marginTop: "1rem"}}>🇹🇷 TR İçerik</label>
                          <textarea className="admin-input" rows={4} value={tpl.content_tr} onChange={(e) => handleInputChange(tpl.id, 'content_tr', e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>🇺🇸 EN Title</label>
                          <input className="admin-input" type="text" value={tpl.title_en} onChange={(e) => handleInputChange(tpl.id, 'title_en', e.target.value)} />
                          <label style={{...labelStyle, marginTop: "1rem"}}>🇺🇸 EN Content</label>
                          <textarea className="admin-input" rows={4} value={tpl.content_en} onChange={(e) => handleInputChange(tpl.id, 'content_en', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SERVERS TAB */}
              {activeTab === "servers" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div style={{ position: "relative" }}>
                    <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} size={20} />
                    <input 
                      className="admin-input" 
                      placeholder="Sunucu adı, ID veya sahip ID ile ara..." 
                      style={{ paddingLeft: "3rem" }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="glass-panel" style={{ overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-color)" }}>
                          <th style={thStyle}>Sunucu Bilgisi</th>
                          <th style={thStyle}>Sahip ID</th>
                          <th style={thStyle}>Durum</th>
                          <th style={thStyle}>Bitiş Tarihi</th>
                          <th style={thStyle}>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredServers.map(s => {
                          const isExpired = !s.is_unlimited && new Date(s.expires_at) < new Date();
                          return (
                            <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "0.2s" }} className="table-row-hover">
                              <td style={tdStyle}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                  <div style={{ 
                                    width: "40px", height: "40px", borderRadius: "10px", background: "rgba(252, 163, 17, 0.2)", 
                                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "var(--accent-color)" 
                                  }}>
                                    {s.guild_name?.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>{s.guild_name}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.guild_id}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={tdStyle}><code style={{ fontSize: "0.85rem", opacity: 0.8 }}>{s.owner_id}</code></td>
                              <td style={tdStyle}>
                                {s.is_unlimited ? (
                                  <span className="badge badge-unlimited">Sınırsız</span>
                                ) : isExpired ? (
                                  <span className="badge badge-expired">Süresi Dolmuş</span>
                                ) : (
                                  <span className="badge badge-active">Aktif</span>
                                )}
                                {!s.is_active && <span className="badge" style={{ marginLeft: "0.5rem", background: "gray" }}>Pasif</span>}
                              </td>
                              <td style={tdStyle}>
                                <div style={{ fontSize: "0.9rem" }}>
                                  {s.is_unlimited ? "♾️ Sınırsız" : format(new Date(s.expires_at), "dd MMM yyyy HH:mm", { locale: tr })}
                                </div>
                              </td>
                              <td style={tdStyle}>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                  <button className="icon-btn" title="Süre Yönetimi" onClick={() => setShowDayModal(s.guild_id)}><Clock size={18} /></button>
                                  <button 
                                    className={`icon-btn ${s.is_unlimited ? 'active' : ''}`} 
                                    title="Sınırsız Mod" 
                                    onClick={() => handleServerAction(s.guild_id, 'toggle_unlimited', !s.is_unlimited)}
                                  >
                                    <Infinity size={18} />
                                  </button>
                                  <button 
                                    className={`icon-btn ${!s.is_active ? 'danger' : ''}`} 
                                    title={s.is_active ? "Devre Dışı Bırak" : "Aktif Et"} 
                                    onClick={() => handleServerAction(s.guild_id, 'toggle_active', !s.is_active)}
                                  >
                                    <Power size={18} />
                                  </button>
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

          {/* OTHER TABS */}
          {activeTab !== "notifications" && activeTab !== "servers" && (
            <div className="glass-panel" style={{ padding: "4rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "2rem", borderRadius: "50%" }}>{menuItems.find(i => i.id === activeTab)?.icon}</div>
              <h2 style={{ fontSize: "1.5rem" }}>{menuItems.find(i => i.id === activeTab)?.label} Yakında</h2>
            </div>
          )}
        </section>
      </div>

      {/* DAY MODAL */}
      {showDayModal && (
        <div className="modal-overlay">
          <div className="glass-panel animate-fade-in" style={{ width: "400px", padding: "2rem" }}>
            <h2 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><Calendar size={24} color="var(--accent-color)" /> Süre Ekle</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Sunucuya eklenecek gün sayısını girin.</p>
            <input 
              className="admin-input" 
              type="number" 
              value={daysToAdd} 
              onChange={(e) => setDaysToAdd(e.target.value)}
              style={{ marginBottom: "1.5rem", fontSize: "1.2rem", textAlign: "center" }}
            />
            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="signout-btn" style={{ flex: 1 }} onClick={() => setShowDayModal(null)}>İptal</button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => handleServerAction(showDayModal, 'add_days', daysToAdd)}>
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .admin-input { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 0.8rem; border-radius: 10px; width: 100%; transition: 0.2s; outline: none; }
        .admin-input:focus { border-color: var(--accent-color); background: rgba(0,0,0,0.4); }
        .table-row-hover:hover { background: rgba(255,255,255,0.02); }
        .badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
        .badge-active { background: rgba(46, 204, 113, 0.2); color: #2ecc71; }
        .badge-expired { background: rgba(231, 76, 60, 0.2); color: #e74c3c; }
        .badge-unlimited { background: rgba(155, 89, 182, 0.2); color: #9b59b6; border: 1px solid rgba(155, 89, 182, 0.3); }
        .icon-btn { background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .icon-btn:hover { background: rgba(252, 163, 17, 0.1); color: var(--accent-color); border-color: var(--accent-color); }
        .icon-btn.active { background: rgba(155, 89, 182, 0.2); color: #9b59b6; border-color: #9b59b6; }
        .icon-btn.danger:hover { background: rgba(231, 76, 60, 0.1); color: #e74c3c; border-color: #e74c3c; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

const thStyle = { padding: "1.25rem 1.5rem", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" };
const tdStyle = { padding: "1.25rem 1.5rem", verticalAlign: "middle" };
const labelStyle = { display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" };
