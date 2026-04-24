"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Save, Bell, Loader2, AlertCircle, CheckCircle,
  LayoutDashboard, Server, MessageSquare, Settings, 
  Users, BarChart3, Search, Clock, Infinity, Power, 
  Calendar, Trash2, ChevronRight, ArrowLeft
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import "./admin.css";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState("servers");
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

  const isAdmin = session?.user?.id === ADMIN_ID || session?.user?.id === "407234961582587916";

  // Auth Check
  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && !isAdmin)) {
      router.push("/");
    }
  }, [status, session, router, isAdmin]);

  // Initial Data Fetch
  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      if (activeTab === "notifications") fetchTemplates();
      if (activeTab === "servers") fetchServers();
    }
  }, [status, session, activeTab, isAdmin]);

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
        showToast("Şablon başarıyla güncellendi!", "success");
      }
    } catch (err) {
      showToast(err.message, "error");
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
        showToast("İşlem başarıyla gerçekleşti!", "success");
        fetchServers();
        setShowDayModal(null);
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingId(null);
    }
  };

  const showToast = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
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
    { id: "overview", label: "Genel Bakış", icon: <LayoutDashboard size={20} /> },
    { id: "servers", label: "Sunucu Yönetimi", icon: <Server size={20} /> },
    { id: "notifications", label: "Bildirim Şablonları", icon: <Bell size={20} /> },
    { id: "broadcast", label: "Duyuru Merkezi", icon: <MessageSquare size={20} /> },
    { id: "stats", label: "Veri Analizi", icon: <BarChart3 size={20} /> },
    { id: "settings", label: "Sistem Ayarları", icon: <Settings size={20} /> },
  ];

  if (status === "loading" || !session) {
    return (
      <div className="admin-container" style={{ justifyContent: "center", alignItems: "center" }}>
        <Loader2 className="spin" size={48} color="var(--admin-accent)" />
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Premium Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
           <div className="text-logo" style={{fontSize: '1.5rem'}}>VEYRONIX</div>
           <div style={{fontSize: '0.65rem', fontWeight: '800', color: 'var(--admin-accent)', letterSpacing: '2px', marginTop: '0.2rem'}}>ADMIN PANEL</div>
        </div>

        <nav className="admin-nav-group">
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ marginTop: "auto", paddingTop: "1.5rem", borderTop: "1px solid var(--admin-border)" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.5rem" }}>
              {session.user?.image ? (
                <img src={session.user.image} width={36} height={36} style={{ borderRadius: "12px", border: '1px solid var(--admin-border)' }} />
              ) : (
                <div style={{width: 36, height: 36, borderRadius: '12px', background: 'var(--admin-accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-accent)', fontWeight: '800'}}>A</div>
              )}
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "0.9rem", fontWeight: "700" }}>{session.user?.name}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)" }}>Administrator</div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="admin-main">
        <header className="admin-header">
           <div className="admin-title">
              <h1>{menuItems.find(i => i.id === activeTab)?.label}</h1>
              <p>Veyronix ekosistemindeki tüm aktif ve pasif varlıkları denetleyin.</p>
           </div>
           
           {message && (
             <div className={`status-msg ${message.type} animate-slide-up`} style={{marginBottom: '0.5rem', padding: '0.8rem 1.5rem', borderRadius: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                {message.type === 'success' ? <CheckCircle size={18} color="var(--admin-success)" /> : <AlertCircle size={18} color="var(--admin-error)" />}
                <span style={{fontWeight: '600', fontSize: '0.9rem'}}>{message.text}</span>
             </div>
           )}
        </header>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "8rem" }}>
            <Loader2 className="spin" size={40} color="var(--admin-accent)" />
          </div>
        ) : (
          <div className="animate-slide-up">
            
            {/* SERVER MANAGEMENT TAB */}
            {activeTab === "servers" && (
              <>
                <div className="admin-search-container">
                  <Search style={{ position: "absolute", left: "1.2rem", top: "50%", transform: "translateY(-50%)", color: "var(--admin-text-muted)" }} size={18} />
                  <input 
                    className="admin-search-input" 
                    placeholder="Sunucu ismi, ID veya Sahip ID ile ara..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="admin-card">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>SUNUCU BİLGİSİ</th>
                        <th>SAHİP ID</th>
                        <th>DURUM</th>
                        <th>BİTİŞ TARİHİ</th>
                        <th style={{textAlign: "right"}}>İŞLEMLER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServers.map(s => {
                        const isExpired = !s.is_unlimited && new Date(s.expires_at) < new Date();
                        const isPassive = !s.is_active;
                        
                        return (
                          <tr key={s.id} className="admin-tr-hover" style={{opacity: isPassive ? 0.5 : 1}}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{ 
                                  width: "42px", height: "42px", borderRadius: "12px", 
                                  background: "linear-gradient(135deg, rgba(252,163,17,0.2) 0%, rgba(252,163,17,0.05) 100%)",
                                  border: "1px solid var(--admin-border)",
                                  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "var(--admin-accent)"
                                }}>
                                  {s.guild_name?.charAt(0).toUpperCase() || 'V'}
                                </div>
                                <div>
                                  <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>{s.guild_name}</div>
                                  <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", fontFamily: "monospace" }}>{s.guild_id}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <code style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)", background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>{s.owner_id}</code>
                            </td>
                            <td>
                              {isPassive ? (
                                <span className="admin-badge badge-passive">Pasif</span>
                              ) : s.is_unlimited ? (
                                <span className="admin-badge badge-unlimited">Sınırsız</span>
                              ) : isExpired ? (
                                <span className="admin-badge badge-expired">Süresi Dolmuş</span>
                              ) : (
                                <span className="admin-badge badge-active">Aktif</span>
                              )}
                            </td>
                            <td>
                              <div style={{ fontSize: "0.9rem", fontWeight: "600", color: isExpired && !s.is_unlimited ? "var(--admin-error)" : "inherit" }}>
                                {s.is_unlimited ? "Süresiz" : format(new Date(s.expires_at), "dd MMM yyyy", { locale: lang === 'tr' ? tr : enUS })}
                              </div>
                              <div style={{fontSize: '0.75rem', color: 'var(--admin-text-muted)'}}>
                                {s.is_unlimited ? "∞" : format(new Date(s.expires_at), "HH:mm")}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end" }}>
                                <button 
                                  className="admin-action-btn" 
                                  title="Süre Ekle" 
                                  onClick={() => { setShowDayModal(s.guild_id); setDaysToAdd(30); }}
                                >
                                  <Clock size={18} />
                                </button>
                                
                                <button 
                                  className={`admin-action-btn ${s.is_unlimited ? 'active' : ''}`} 
                                  title={!s.is_active ? "Önce aktif etmelisiniz" : "Sınırsız Yap"} 
                                  disabled={!s.is_active || savingId === s.guild_id}
                                  style={{ opacity: !s.is_active ? 0.3 : 1, cursor: !s.is_active ? 'not-allowed' : 'pointer' }}
                                  onClick={() => handleServerAction(s.guild_id, 'toggle_unlimited', !s.is_unlimited)}
                                >
                                  <Infinity size={18} />
                                </button>
                                
                                <button 
                                  className={`admin-action-btn ${!s.is_active ? 'danger' : ''}`} 
                                  title={s.is_unlimited ? "Süresiz sunucu devre dışı bırakılamaz" : (s.is_active ? "Devre Dışı Bırak" : "Etkinleştir")} 
                                  disabled={s.is_unlimited || savingId === s.guild_id}
                                  style={{ opacity: s.is_unlimited ? 0.3 : 1, cursor: s.is_unlimited ? 'not-allowed' : 'pointer' }}
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
              </>
            )}

            {/* NOTIFICATION TEMPLATES TAB */}
            {activeTab === "notifications" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
                {templates.map(tpl => (
                  <div key={tpl.id} className="admin-tpl-card animate-slide-up">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ background: "var(--admin-accent-muted)", padding: "0.75rem", borderRadius: "14px" }}><Bell size={24} color="var(--admin-accent)" /></div>
                        <div>
                          <h2 style={{ fontSize: "1.2rem", fontWeight: "800", margin: 0 }}>{tpl.id.toUpperCase().replace('_', ' ')}</h2>
                          <p style={{fontSize: '0.8rem', color: 'var(--admin-text-muted)', margin: 0}}>Olay tetiklendiğinde sahiplere gidecek mesaj.</p>
                        </div>
                      </div>
                      <button className="btn-primary" disabled={savingId === tpl.id} onClick={() => handleUpdateTemplate(tpl)} style={{ padding: "0.6rem 1.5rem", borderRadius: '10px' }}>
                        {savingId === tpl.id ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
                        Kaydet
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem" }}>
                      <div className="glass-panel" style={{padding: '1.5rem', background: 'rgba(0,0,0,0.2)'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
                           <span style={{fontSize: '1.2rem'}}>🇹🇷</span>
                           <span style={{fontWeight: '700', fontSize: '0.9rem'}}>Türkçe İçerik</span>
                        </div>
                        <label className="admin-label">Mesaj Başlığı</label>
                        <input className="admin-search-input" style={{paddingLeft: '1rem', marginBottom: '1.5rem'}} value={tpl.title_tr} onChange={(e) => handleInputChange(tpl.id, 'title_tr', e.target.value)} />
                        <label className="admin-label">Mesaj Metni</label>
                        <textarea className="admin-search-input" style={{paddingLeft: '1rem', height: '120px', resize: 'none'}} value={tpl.content_tr} onChange={(e) => handleInputChange(tpl.id, 'content_tr', e.target.value)} />
                        <p style={{fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginTop: '0.5rem'}}>Değişkenler: <code>{'{sunucu}'}</code>, <code>{'{tarih}'}</code></p>
                      </div>

                      <div className="glass-panel" style={{padding: '1.5rem', background: 'rgba(0,0,0,0.2)'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
                           <span style={{fontSize: '1.2rem'}}>🇺🇸</span>
                           <span style={{fontWeight: '700', fontSize: '0.9rem'}}>English Content</span>
                        </div>
                        <label className="admin-label">Embed Title</label>
                        <input className="admin-search-input" style={{paddingLeft: '1rem', marginBottom: '1.5rem'}} value={tpl.title_en} onChange={(e) => handleInputChange(tpl.id, 'title_en', e.target.value)} />
                        <label className="admin-label">Embed Description</label>
                        <textarea className="admin-search-input" style={{paddingLeft: '1rem', height: '120px', resize: 'none'}} value={tpl.content_en} onChange={(e) => handleInputChange(tpl.id, 'content_en', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PLACEHOLDERS FOR OTHER TABS */}
            {["overview", "broadcast", "stats", "settings"].includes(activeTab) && (
              <div style={{padding: '10rem', textAlign: 'center', opacity: 0.3}}>
                 <Settings size={64} style={{marginBottom: '1rem'}} />
                 <h3>Bu modül yakında eklenecektir.</h3>
                 <p>Geliştirme süreci devam ediyor.</p>
              </div>
            )}

          </div>
        )}
      </main>

      {/* RENEWED MODAL */}
      {showDayModal && (
        <div className="admin-modal-overlay" onClick={() => setShowDayModal(null)}>
          <div className="admin-modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div style={{textAlign: 'center', marginBottom: '2rem'}}>
               <div style={{background: 'var(--admin-accent-muted)', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'}}>
                  <Calendar size={32} color="var(--admin-accent)" />
               </div>
               <h2 style={{ fontSize: "1.5rem", fontWeight: "800" }}>Süre Ekle</h2>
               <p style={{color: 'var(--admin-text-muted)', fontSize: '0.9rem'}}>Sunucuya eklenecek gün sayısını girin.</p>
            </div>
            
            <input 
              className="admin-input-field" 
              type="number" 
              autoFocus
              value={daysToAdd} 
              onChange={(e) => setDaysToAdd(e.target.value)} 
            />

            <div className="admin-btn-group">
              <button className="admin-btn-secondary" onClick={() => setShowDayModal(null)}>İptal</button>
              <button className="admin-btn-primary" onClick={() => handleServerAction(showDayModal, 'add_days', daysToAdd)}>
                {savingId === showDayModal ? <Loader2 className="spin" size={18} /> : "Süreyi Güncelle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
