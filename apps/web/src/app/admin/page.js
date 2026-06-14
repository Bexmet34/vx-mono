"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Save, Bell, Loader2, AlertCircle, CheckCircle,
  LayoutDashboard, Server, MessageSquare, Settings, 
  Users, BarChart3, Search, Clock, Infinity, Power, 
  Calendar, Trash2, ChevronRight, ArrowLeft, Gift, Plus, Send, Edit3, Eye, EyeOff, DollarSign, Check, X, Gamepad2
} from "lucide-react";
import { useCallback } from "react";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import "./admin.css";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
  const [expiryDate, setExpiryDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, unlimited, passive

  // Campaign States
  const [campaigns, setCampaigns] = useState([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title_tr: "", title_en: "", description_tr: "", description_en: "",
    promo_code: "", reward_days: 30, usage_limit: 10, target_type: "active"
  });

  // Scheduled Messages States
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [showScheduledModal, setShowScheduledModal] = useState(false);
  const [newScheduled, setNewScheduled] = useState({
    message_content: "",
    ping_everyone: false,
    schedule_type: "recurring",
    interval_days: 1,
    send_time: "",
    buttons: []
  });

  // Plans States
  const [plans, setPlans] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [newPlan, setNewPlan] = useState({
    id: "", name_tr: "", name_en: "", amount: "", duration_days: 30, is_active: true, is_featured: false, sort_order: 0, features_tr: [], features_en: []
  });

  // Settings States
  const [systemSettings, setSystemSettings] = useState({ vote_cooldown_hours: 168 });

  const isAdmin = session?.user?.id === ADMIN_ID || session?.user?.id === "407234961582587916";

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (res.ok) setTemplates(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  const fetchServers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/servers");
      const data = await res.json();
      if (res.ok) setServers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/campaigns");
      const data = await res.json();
      if (res.ok) setCampaigns(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  const fetchScheduledMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/scheduled");
      const data = await res.json();
      if (res.ok) setScheduledMessages(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plans");
      const data = await res.json();
      if (res.ok) setPlans(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok) setSystemSettings(prev => ({...prev, ...data}));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  // Auth Check
  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && !isAdmin)) {
      router.push("/");
    }
  }, [status, isAdmin, router]);

  // Initial Data Fetch
  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      setTimeout(() => {
        if (activeTab === "notifications") fetchTemplates();
        if (activeTab === "servers") fetchServers();
        if (activeTab === "campaigns") fetchCampaigns();
        if (activeTab === "broadcast") fetchScheduledMessages();
        if (activeTab === "plans") fetchPlans();
        if (activeTab === "settings") fetchSettings();
      }, 0);
    }
  }, [status, isAdmin, activeTab, fetchTemplates, fetchServers, fetchCampaigns, fetchScheduledMessages, fetchPlans, fetchSettings]);


  const handleCreateCampaign = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCampaign),
      });
      if (res.ok) {
        showToast("Kampanya başarıyla oluşturuldu ve kuyruğa alındı!", "success");
        setShowCampaignModal(false);
        fetchCampaigns();
      }
    } catch (err) { showToast(err.message, "error"); }
    finally { setLoading(false); }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(systemSettings),
      });
      if (res.ok) {
        showToast("Sistem ayarları başarıyla güncellendi!", "success");
      } else {
        showToast("Ayarlar güncellenirken hata oluştu", "error");
      }
    } catch (err) { showToast(err.message, "error"); }
    finally { setLoading(false); }
  };

  const handleCreateScheduled = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/scheduled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newScheduled),
      });
      if (res.ok) {
        showToast("Zamanlanmış mesaj başarıyla eklendi!", "success");
        setShowScheduledModal(false);
        fetchScheduledMessages();
        setNewScheduled({ message_content: "", ping_everyone: false, schedule_type: "recurring", interval_days: 1, send_time: "", buttons: [] });
      } else {
        const data = await res.json();
        showToast(data.error || "Hata", "error");
      }
    } catch (err) { showToast(err.message, "error"); }
    finally { setLoading(false); }
  };

  const handleDeleteScheduled = async (id) => {
    if (!confirm('Emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/scheduled?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Mesaj silindi", "success");
        fetchScheduledMessages();
      }
    } catch (err) { showToast(err.message, "error"); }
  };

  const handleSavePlan = async () => {
    setLoading(true);
    try {
      const method = editingPlanId ? "PATCH" : "POST";
      const res = await fetch("/api/admin/plans", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlan),
      });
      if (res.ok) {
        showToast(`Paket başarıyla ${editingPlanId ? 'güncellendi' : 'eklendi'}!`, "success");
        setShowPlanModal(false);
        setEditingPlanId(null);
        fetchPlans();
      } else {
        const data = await res.json();
        showToast(data.error || "Hata", "error");
      }
    } catch (err) { showToast(err.message, "error"); }
    finally { setLoading(false); }
  };

  const handleDeletePlan = async (id) => {
    if (!confirm('Bu paketi silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/plans?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Paket silindi", "success");
        fetchPlans();
      }
    } catch (err) { showToast(err.message, "error"); }
  };

  const handleToggleCampaign = async (id, field, value) => {
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
      if (res.ok) {
        setCampaigns(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
        showToast("Kampanya güncellendi.", "success");
      }
    } catch (err) { showToast(err.message, "error"); }
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
        const result = await res.json();
        showToast("İşlem başarıyla gerçekleşti!", "success");
        
        // Update local state instead of full re-fetch
        if (result.updatedData) {
          setServers(prev => prev.map(s => s.guild_id === guildId ? { ...s, ...result.updatedData } : s));
        } else {
          fetchServers(); // Fallback if data not returned
        }
        
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

  const filteredServers = servers.filter(s => {
    const matchesSearch = s.guild_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.guild_id?.includes(searchTerm) ||
                         s.owner_id?.includes(searchTerm);
    
    if (!matchesSearch) return false;
    
    if (statusFilter === 'premium') return s.is_active && !s.is_unlimited && new Date(s.expires_at) >= new Date();
    if (statusFilter === 'unlimited') return s.is_unlimited;
    if (statusFilter === 'passive') return !s.is_active;
    if (statusFilter === 'freemium') return s.is_active && !s.is_unlimited && new Date(s.expires_at) < new Date();
    
    return true;
  });

  const menuItems = [
    { id: "overview", label: "Genel Bakış", icon: <LayoutDashboard size={20} /> },
    { id: "servers", label: "Sunucu Yönetimi", icon: <Server size={20} /> },
    { id: "plans", label: "Paket Yönetimi", icon: <DollarSign size={20} /> }, 
    { id: "campaigns", label: "Kampanya & Hediye", icon: <Gift size={20} /> },
    { id: "notifications", label: "Bildirim Şablonları", icon: <Bell size={20} /> },
    { id: "broadcast", label: "Duyuru Merkezi", icon: <MessageSquare size={20} /> },
    { id: "stats", label: "Veri Analizi", icon: <BarChart3 size={20} /> },
    { id: "settings", label: "Sistem Ayarları", icon: <Settings size={20} /> },
  ];

  // During SSR and initial client hydration, suppress differences
  // by not rendering any content until session status is resolved.
  if (status === "loading") {
    return (
      <div className="admin-container" style={{ justifyContent: "center", alignItems: "center" }}>
        <Loader2 className="spin" size={48} color="var(--admin-accent)" />
      </div>
    );
  }

  if (!session || !isAdmin) {
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
                <div className="server-tab-header">
                   <div>
                      <div className="admin-search-container" style={{marginBottom: 0}}>
                        <Search style={{ position: "absolute", left: "1.2rem", top: "50%", transform: "translateY(-50%)", color: "var(--admin-text-muted)" }} size={18} />
                        <input 
                          className="admin-search-input" 
                          placeholder="Sunucu ismi, ID veya Sahip ID ile ara..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                   </div>
                   
                   <div className="server-stats-row">
                      <div className="stat-mini-card">
                         <div className="label">Toplam</div>
                         <div className="value">{servers.length}</div>
                      </div>
                      <div className="stat-mini-card">
                         <div className="label" style={{color: 'var(--admin-success)'}}>Premium</div>
                         <div className="value">{servers.filter(s => s.is_active && !s.is_unlimited && new Date(s.expires_at) >= new Date()).length}</div>
                      </div>
                      <div className="stat-mini-card">
                         <div className="label" style={{color: '#fca311'}}>Sınırsız</div>
                         <div className="value">{servers.filter(s => s.is_unlimited).length}</div>
                      </div>
                      <div className="stat-mini-card">
                         <div className="label" style={{color: '#ff4757'}}>Freemium</div>
                         <div className="value">{servers.filter(s => s.is_active && !s.is_unlimited && new Date(s.expires_at) < new Date()).length}</div>
                      </div>
                      <div className="stat-mini-card">
                         <div className="label" style={{color: 'var(--admin-error)'}}>Pasif</div>
                         <div className="value">{servers.filter(s => !s.is_active).length}</div>
                      </div>
                   </div>
                </div>

                <div className="server-filter-row">
                   {['all', 'premium', 'unlimited', 'passive', 'freemium'].map(f => (
                     <button 
                       key={f}
                       onClick={() => setStatusFilter(f)}
                       className={`filter-btn ${statusFilter === f ? 'active' : ''}`}
                       style={f === 'freemium' ? {borderColor: '#ff4757', color: statusFilter === 'freemium' ? 'white' : '#ff4757'} : {}}
                     >
                       {f === 'all' && 'Hepsi'}
                       {f === 'premium' && 'Sadece Premium'}
                       {f === 'unlimited' && 'Sadece Sınırsız'}
                       {f === 'passive' && 'Sadece Pasif'}
                       {f === 'freemium' && 'Sadece Freemium'}
                     </button>
                   ))}
                </div>

                <div className="admin-card">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>SUNUCU BİLGİSİ</th>
                        <th className="hide-on-tablet">SAHİP ID</th>
                        <th>DURUM</th>
                        <th>PLAN</th>
                        <th style={{textAlign: "right"}}>İŞLEMLER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServers.map(s => {
                        const isExpired = !s.is_unlimited && new Date(s.expires_at) < new Date();
                        const isPassive = !s.is_active;
                        
                        return (
                          <tr key={s.id} className="admin-tr-hover" style={{opacity: isPassive ? 0.5 : 1}}>
                            <td data-label="SUNUCU BİLGİSİ">
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
                            <td className="hide-on-tablet" data-label="SAHİP ID">
                              <code style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)", background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>{s.owner_id}</code>
                            </td>
                            <td data-label="DURUM">
                              {isPassive ? (
                                <span className="admin-badge badge-passive">Pasif</span>
                              ) : (
                                <span className="admin-badge badge-active">Aktif</span>
                              )}
                              {s.unlimited_party && (
                                <span className="admin-badge" style={{background: 'rgba(252,163,17,0.12)', color: '#fca311', border: '1px solid rgba(252,163,17,0.3)', marginLeft: '0.4rem', fontSize: '0.62rem'}}>🎮 Party ∞</span>
                              )}
                            </td>
                            <td data-label="PLAN">
                              {/* PLAN column: Freemium / Premium / Unlimited */}
                              {s.is_unlimited ? (
                                <span className="admin-badge badge-unlimited" style={{fontSize:'0.8rem'}}>♾️ Sınırsız</span>
                              ) : !isExpired ? (
                                <span className="admin-badge badge-active" style={{fontSize:'0.8rem'}}>💎 Premium</span>
                              ) : (
                                <span className="admin-badge badge-expired" style={{fontSize:'0.8rem'}}>🆓 Freemium</span>
                              )}
                            </td>
                            <td data-label="İŞLEMLER">
                              <div className="table-actions">
                                <button 
                                  className="admin-action-btn" 
                                  title="+30 Gün Ekle" 
                                  disabled={savingId === s.guild_id}
                                  onClick={() => handleServerAction(s.guild_id, 'add_days', 30)}
                                  style={{color: 'var(--admin-success)', borderColor: 'rgba(46, 204, 113, 0.3)'}}
                                >
                                  {savingId === s.guild_id ? <Loader2 size={18} className="spin" /> : <Plus size={18} />}
                                </button>
                                
                                <button 
                                  className="admin-action-btn danger" 
                                  title="-30 Gün Çıkar" 
                                  disabled={savingId === s.guild_id}
                                  onClick={() => handleServerAction(s.guild_id, 'remove_days', 30)}
                                >
                                  {savingId === s.guild_id ? <Loader2 size={18} className="spin" /> : <Clock size={18} />}
                                </button>

                                <button 
                                  className={`admin-action-btn ${s.unlimited_party ? 'party-unlimited' : ''}`}
                                  title={s.unlimited_party ? 'Sınırsız Party Aç: AÇIK — Kapat' : 'Sınırsız Party Aç: KAPALI — Aç'}
                                  disabled={savingId === s.guild_id}
                                  onClick={() => handleServerAction(s.guild_id, 'toggle_unlimited_party', !s.unlimited_party)}
                                >
                                  {savingId === s.guild_id ? <Loader2 size={18} className="spin" /> : <Gamepad2 size={18} />}
                                </button>
                                
                                <button 
                                  className={`admin-action-btn ${s.is_unlimited ? 'active' : ''}`} 
                                  title={!s.is_active ? "Önce aktif etmelisiniz" : "Sınırsız Yap"} 
                                  disabled={!s.is_active || savingId === s.guild_id}
                                  style={{ opacity: !s.is_active ? 0.3 : 1, cursor: !s.is_active ? 'not-allowed' : 'pointer' }}
                                  onClick={() => handleServerAction(s.guild_id, 'toggle_unlimited', !s.is_unlimited)}
                                >
                                  {savingId === s.guild_id ? <Loader2 size={18} className="spin" /> : <Infinity size={18} />}
                                </button>
                                
                                <button 
                                  className={`admin-action-btn ${!s.is_active ? 'danger' : ''}`} 
                                  title={s.is_unlimited ? "Süresiz sunucu devre dışı bırakılamaz" : (s.is_active ? "Devre Dışı Bırak" : "Etkinleştir")} 
                                  disabled={s.is_unlimited || savingId === s.guild_id}
                                  style={{ opacity: s.is_unlimited ? 0.3 : 1, cursor: s.is_unlimited ? 'not-allowed' : 'pointer' }}
                                  onClick={() => handleServerAction(s.guild_id, 'toggle_active', !s.is_active)}
                                >
                                  {savingId === s.guild_id ? <Loader2 size={18} className="spin" /> : <Power size={18} />}
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

            {/* PLANS TAB */}
            {activeTab === "plans" && (
              <div className="animate-slide-up">
                {!showPlanModal ? (
                  <>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem'}}>
                       <div>
                          <h2 style={{fontSize: '1.5rem', fontWeight: '800'}}>Paket Yönetimi</h2>
                          <p style={{color: 'var(--admin-text-muted)'}}>Sistemdeki fiyatlandırma paketlerini ve özelliklerini düzenleyin.</p>
                       </div>
                       <button className="btn-primary" onClick={() => {
                         setEditingPlanId(null);
                         setNewPlan({id: "", name_tr: "", name_en: "", amount: "", duration_days: 30, is_active: true, is_featured: false, sort_order: 0, features_tr: [], features_en: []});
                         setShowPlanModal(true);
                       }} style={{padding: '0.8rem 1.5rem', borderRadius: '12px'}}>
                          <Plus size={20} /> Yeni Paket Ekle
                       </button>
                    </div>

                    <div className="admin-card">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>PAKET ADI / ID</th>
                            <th>FİYAT</th>
                            <th>SÜRE</th>
                            <th>DURUM</th>
                            <th style={{textAlign: "right"}}>İŞLEMLER</th>
                          </tr>
                        </thead>
                        <tbody>
                          {plans.length === 0 ? (
                            <tr><td colSpan={5} style={{textAlign: 'center', padding: '4rem', opacity: 0.5}}>Henüz paket bulunmuyor.</td></tr>
                          ) : plans.map(p => (
                            <tr key={p.id}>
                              <td data-label="PAKET ADI / ID">
                                <div style={{fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                  {p.name_tr}
                                  {p.is_featured && <span className="admin-badge badge-unlimited" style={{fontSize: '0.65rem', padding: '0.1rem 0.4rem'}}>Öne Çıkan</span>}
                                </div>
                                <code style={{fontSize: '0.8rem', color: 'var(--admin-text-muted)'}}>{p.id}</code>
                              </td>
                              <td data-label="FİYAT">
                                <div style={{fontWeight: '600', color: 'var(--admin-accent)'}}>{p.amount} {p.currency}</div>
                              </td>
                              <td data-label="SÜRE">
                                <div style={{fontSize: '0.9rem', fontWeight: '500'}}>{p.duration_days} Gün</div>
                              </td>
                              <td data-label="DURUM">
                                {p.is_active ? (
                                  <span className="admin-badge badge-active">Aktif</span>
                                ) : (
                                  <span className="admin-badge badge-passive">Pasif</span>
                                )}
                              </td>
                              <td data-label="İŞLEMLER">
                                <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                                   <button className="admin-action-btn" onClick={() => {
                                     setEditingPlanId(p.id);
                                     setNewPlan({...p});
                                     setShowPlanModal(true);
                                   }}>
                                      <Edit3 size={18} />
                                   </button>
                                   <button className="admin-action-btn danger" onClick={() => handleDeletePlan(p.id)}>
                                      <Trash2 size={18} />
                                   </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
                       <button className="admin-action-btn" onClick={() => setShowPlanModal(false)} style={{padding: '0.5rem'}}>
                          <ArrowLeft size={20} />
                       </button>
                       <div>
                          <h2 style={{fontSize: '1.5rem', fontWeight: '800'}}>{editingPlanId ? 'Paketi Düzenle' : 'Yeni Paket Ekle'}</h2>
                          <p style={{color: 'var(--admin-text-muted)'}}>Paket detaylarını ve kullanıcıların göreceği özellikleri belirleyin.</p>
                       </div>
                    </div>

                    <div className="admin-card" style={{padding: '2.5rem'}}>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem'}}>
                         <div>
                            <label className="admin-label">Paket ID (Örn: 1_month)</label>
                            <input className="admin-input-field" value={newPlan.id} disabled={!!editingPlanId} onChange={e => setNewPlan({...newPlan, id: e.target.value})} />
                         </div>
                         <div>
                            <label className="admin-label">Fiyat (USDT)</label>
                            <input className="admin-input-field" type="number" step="0.01" value={newPlan.amount} onChange={e => setNewPlan({...newPlan, amount: e.target.value})} />
                         </div>
                         <div>
                            <label className="admin-label">Süre (Gün)</label>
                            <input className="admin-input-field" type="number" value={newPlan.duration_days} onChange={e => setNewPlan({...newPlan, duration_days: parseInt(e.target.value)})} />
                         </div>
                      </div>

                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem'}}>
                         <div>
                            <label className="admin-label">Paket Adı (TR)</label>
                            <input className="admin-input-field" value={newPlan.name_tr} onChange={e => setNewPlan({...newPlan, name_tr: e.target.value})} />
                         </div>
                         <div>
                            <label className="admin-label">Paket Adı (EN)</label>
                            <input className="admin-input-field" value={newPlan.name_en} onChange={e => setNewPlan({...newPlan, name_en: e.target.value})} />
                         </div>
                      </div>
                      
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem'}}>
                         <div>
                            <label className="admin-label">Özellikler (TR) — Her satıra bir özellik yazın</label>
                            <textarea 
                              className="admin-input-field" 
                              style={{height: '140px', resize: 'vertical'}} 
                              value={newPlan.features_tr.join('\n')} 
                              onChange={e => {
                                // Support both newline and comma separated input
                                const raw = e.target.value;
                                const items = raw.split(/[\n,]/).map(x => x.trim()).filter(x => x !== '');
                                setNewPlan({...newPlan, features_tr: items});
                              }}
                              placeholder={"Gelişmiş Parti Sistemi\nSınırsız Parti Kurma\nOy Vermeden Sınırsız Kullanım"}
                            />
                         </div>
                         <div>
                            <label className="admin-label">Features (EN) — One feature per line</label>
                            <textarea 
                              className="admin-input-field" 
                              style={{height: '140px', resize: 'vertical'}} 
                              value={newPlan.features_en.join('\n')} 
                              onChange={e => {
                                const raw = e.target.value;
                                const items = raw.split(/[\n,]/).map(x => x.trim()).filter(x => x !== '');
                                setNewPlan({...newPlan, features_en: items});
                              }}
                              placeholder={"Advanced Party System\nUnlimited Party Setup\nVote-Free Unlimited Usage"}
                            />
                         </div>
                      </div>

                      <div style={{display: 'flex', gap: '2rem', marginBottom: '3rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px'}}>
                         <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <input type="checkbox" id="isActive" checked={newPlan.is_active} onChange={e => setNewPlan({...newPlan, is_active: e.target.checked})} style={{width: '20px', height: '20px', accentColor: 'var(--admin-accent)'}} />
                            <label htmlFor="isActive" style={{fontWeight: '600', cursor: 'pointer'}}>Aktif (Satışta)</label>
                         </div>
                         <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <input type="checkbox" id="isFeatured" checked={newPlan.is_featured} onChange={e => setNewPlan({...newPlan, is_featured: e.target.checked})} style={{width: '20px', height: '20px', accentColor: 'var(--admin-accent)'}} />
                            <label htmlFor="isFeatured" style={{fontWeight: '600', cursor: 'pointer'}}>Öne Çıkan (Best Seller)</label>
                         </div>
                         <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto'}}>
                            <label className="admin-label" style={{margin: 0}}>Sıralama:</label>
                            <input type="number" className="admin-input-field" style={{width: '80px', padding: '0.4rem'}} value={newPlan.sort_order} onChange={e => setNewPlan({...newPlan, sort_order: parseInt(e.target.value)})} />
                         </div>
                      </div>

                      <div style={{display: 'flex', gap: '1rem'}}>
                        <button className="admin-btn-secondary" style={{width: '200px'}} onClick={() => setShowPlanModal(false)}>İptal</button>
                        <button className="btn-primary" style={{width: '250px', padding: '1rem'}} onClick={handleSavePlan} disabled={loading || !newPlan.id || !newPlan.amount}>
                          {loading ? <Loader2 size={20} className="spin" /> : <><Save size={20}/> {editingPlanId ? 'Değişiklikleri Kaydet' : 'Paketi Oluştur'}</>}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
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

            {/* CAMPAIGNS TAB */}
            {activeTab === "campaigns" && (
              <div className="animate-slide-up">
                {!showCampaignModal ? (
                  <>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem'}}>
                       <div>
                          <h2 style={{fontSize: '1.5rem', fontWeight: '800'}}>Kampanya & Kod Yönetimi</h2>
                          <p style={{color: 'var(--admin-text-muted)'}}>Süresi biten kullanıcıları geri kazanın veya aktif üyelere hediye dağıtın.</p>
                       </div>
                       <button className="btn-primary" onClick={() => setShowCampaignModal(true)} style={{padding: '0.8rem 1.5rem', borderRadius: '12px'}}>
                          <Plus size={20} /> Yeni Kampanya Başlat
                       </button>
                    </div>

                    <div className="admin-card">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>KAMPANYA ADI / KOD</th>
                        <th>HEDEF</th>
                        <th>ÖDÜL</th>
                        <th>KULLANIM</th>
                        <th>DURUM</th>
                        <th style={{textAlign: "right"}}>İŞLEMLER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.length === 0 ? (
                        <tr><td colSpan={6} style={{textAlign: 'center', padding: '4rem', opacity: 0.5}}>Henüz kampanya oluşturulmadı.</td></tr>
                      ) : campaigns.map(c => (
                        <tr key={c.id}>
                          <td data-label="KAMPANYA ADI / KOD">
                            <div style={{fontWeight: '700'}}>{c.title_tr}</div>
                            <code style={{fontSize: '0.8rem', color: 'var(--admin-accent)', background: 'var(--admin-accent-muted)', padding: '0.2rem 0.5rem', borderRadius: '4px'}}>{c.promo_code}</code>
                          </td>
                          <td data-label="HEDEF">
                            <span style={{fontSize: '0.85rem', textTransform: 'capitalize'}}>
                              {c.target_type === 'active' && 'Aktif Üyeler'}
                              {c.target_type === 'expired' && 'Süresi Bitenler'}
                              {c.target_type === 'all' && 'Tüm Sunucular'}
                              {c.target_type === 'manual' && 'Özel Seçim'}
                            </span>
                          </td>
                          <td data-label="ÖDÜL">
                            <div style={{fontWeight: '600', color: 'var(--admin-success)'}}>+{c.reward_days} Gün</div>
                          </td>
                          <td data-label="KULLANIM">
                            <div style={{fontSize: '0.9rem', fontWeight: '700'}}>
                              {c.current_usage} / {c.usage_limit}
                            </div>
                            <div style={{width: '100px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '0.4rem', overflow: 'hidden'}}>
                               <div style={{width: `${(c.current_usage / c.usage_limit) * 100}%`, height: '100%', background: 'var(--admin-accent)'}} />
                            </div>
                          </td>
                          <td data-label="DURUM">
                            {c.is_active ? (
                              <span className="admin-badge badge-active">Yayında</span>
                            ) : (
                              <span className="admin-badge badge-passive">Pasif</span>
                            )}
                          </td>
                          <td data-label="İŞLEMLER">
                            <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                               <button className="admin-action-btn" title="Anasayfa Görünürlüğü" onClick={() => handleToggleCampaign(c.id, 'show_on_home', !c.show_on_home)}>
                                  {c.show_on_home ? <Eye size={18} color="var(--admin-accent)" /> : <EyeOff size={18} />}
                               </button>
                               <button className="admin-action-btn" onClick={() => handleToggleCampaign(c.id, 'is_active', !c.is_active)}>
                                  <Power size={18} color={c.is_active ? 'var(--admin-success)' : ''} />
                               </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
                <>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
                   <button className="admin-action-btn" onClick={() => setShowCampaignModal(false)} style={{padding: '0.5rem'}}>
                      <ArrowLeft size={20} />
                   </button>
                   <div>
                      <h2 style={{fontSize: '1.5rem', fontWeight: '800'}}>Yeni Kampanya Başlat</h2>
                      <p style={{color: 'var(--admin-text-muted)'}}>Hedef kitlenizi seçin ve mesajınızı hazırlayın.</p>
                   </div>
                </div>

                <div className="admin-card" style={{padding: '2.5rem'}}>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem'}}>
                     <div className="glass-panel" style={{padding: '1.5rem', background: 'rgba(255,255,255,0.02)'}}>
                        <h4 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                           <span style={{fontSize: '1.2rem'}}>🇹🇷</span> Türkçe Mesaj İçeriği
                        </h4>
                        <label className="admin-label">Kampanya Başlığı</label>
                        <input className="admin-input-field" placeholder="Örn: 30 Gün Hediye Fırsatı!" value={newCampaign.title_tr} onChange={e => setNewCampaign({...newCampaign, title_tr: e.target.value})} />
                        <label className="admin-label" style={{marginTop: '1rem'}}>Mesaj Detayı</label>
                        <textarea className="admin-input-field" style={{height: '150px', resize: 'none'}} placeholder="Kullanıcıya gidecek mesaj..." value={newCampaign.description_tr} onChange={e => setNewCampaign({...newCampaign, description_tr: e.target.value})} />
                     </div>
                     <div className="glass-panel" style={{padding: '1.5rem', background: 'rgba(255,255,255,0.02)'}}>
                        <h4 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                           <span style={{fontSize: '1.2rem'}}>🇺🇸</span> English Message Content
                        </h4>
                        <label className="admin-label">Campaign Title</label>
                        <input className="admin-input-field" placeholder="Ex: Get 30 Days Free!" value={newCampaign.title_en} onChange={e => setNewCampaign({...newCampaign, title_en: e.target.value})} />
                        <label className="admin-label" style={{marginTop: '1rem'}}>Message Description</label>
                        <textarea className="admin-input-field" style={{height: '150px', resize: 'none'}} placeholder="Message content for user..." value={newCampaign.description_en} onChange={e => setNewCampaign({...newCampaign, description_en: e.target.value})} />
                     </div>
                  </div>

                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem'}}>
                     <div>
                        <label className="admin-label">Promosyon Kodu</label>
                        <input className="admin-input-field" placeholder="30DAILY" style={{textTransform: 'uppercase'}} value={newCampaign.promo_code} onChange={e => setNewCampaign({...newCampaign, promo_code: e.target.value.toUpperCase()})} />
                     </div>
                     <div>
                        <label className="admin-label">Hediye Gün</label>
                        <input className="admin-input-field" type="number" value={newCampaign.reward_days} onChange={e => setNewCampaign({...newCampaign, reward_days: parseInt(e.target.value)})} />
                     </div>
                     <div>
                        <label className="admin-label">Kullanım Sınırı (Kişi) (0 = Sınırsız)</label>
                        <input className="admin-input-field" type="number" value={newCampaign.usage_limit} onChange={e => setNewCampaign({...newCampaign, usage_limit: parseInt(e.target.value)})} />
                     </div>
                  </div>

                  <div style={{marginBottom: '3rem'}}>
                     <label className="admin-label">Hedef Kitle</label>
                     <select className="admin-input-field" style={{maxWidth: '400px'}} value={newCampaign.target_type} onChange={e => setNewCampaign({...newCampaign, target_type: e.target.value})}>
                        <option value="active">Sadece Aktif Kullanıcılar</option>
                        <option value="expired">Süresi Biten Kullanıcılar</option>
                        <option value="all">Tüm Kullanıcılar</option>
                        <option value="manual">Özel Seçim (Sadece Kod Oluştur)</option>
                     </select>
                     <p style={{fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginTop: '0.5rem'}}>Mesajlar bot üzerinden DM yoluyla yavaşça (rate-limited) gönderilecektir.</p>
                  </div>

                  <div style={{display: 'flex', gap: '1rem'}}>
                    <button className="admin-btn-secondary" style={{width: '200px'}} onClick={() => setShowCampaignModal(false)}>İptal</button>
                    <button className="btn-primary" style={{width: '250px', padding: '1rem'}} onClick={handleCreateCampaign} disabled={loading}>
                      {loading ? <Loader2 size={20} className="spin" /> : <><Send size={20}/> Kampanyayı Başlat</>}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* BROADCAST / SCHEDULED MESSAGES TAB */}
            {activeTab === "broadcast" && (
              <div className="animate-slide-up">
                {!showScheduledModal ? (
                  <>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem'}}>
                       <div>
                          <h2 style={{fontSize: '1.5rem', fontWeight: '800'}}>Duyuru Merkezi</h2>
                          <p style={{color: 'var(--admin-text-muted)'}}>Botun bulunduğu tüm sunuculara otomatik atılacak zamanlanmış mesajlar oluşturun.</p>
                       </div>
                       <button className="btn-primary" onClick={() => setShowScheduledModal(true)} style={{padding: '0.8rem 1.5rem', borderRadius: '12px'}}>
                          <Plus size={20} /> Yeni Mesaj Planla
                       </button>
                    </div>

                    <div className="admin-card">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>MESAJ İÇERİĞİ</th>
                            <th>TÜR & ZAMAN</th>
                            <th>EKSTRALAR</th>
                            <th>DURUM</th>
                            <th style={{textAlign: "right"}}>İŞLEMLER</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scheduledMessages.length === 0 ? (
                            <tr><td colSpan={5} style={{textAlign: 'center', padding: '4rem', opacity: 0.5}}>Henüz zamanlanmış mesaj yok.</td></tr>
                          ) : scheduledMessages.map(m => (
                            <tr key={m.id}>
                              <td style={{maxWidth: '300px'}} data-label="MESAJ İÇERİĞİ">
                                <div style={{fontWeight: '500', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                  {m.message_content}
                                </div>
                              </td>
                              <td data-label="TÜR & ZAMAN">
                                <div style={{fontWeight: '700'}}>
                                  {m.schedule_type === 'recurring' ? (m.interval_days > 1 ? `${m.interval_days} Günde Bir` : 'Her Gün') : 'Tek Seferlik'}
                                </div>
                                <code style={{fontSize: '0.8rem', color: 'var(--admin-accent)', background: 'var(--admin-accent-muted)', padding: '0.2rem 0.5rem', borderRadius: '4px'}}>{m.send_time}</code>
                              </td>
                              <td data-label="EKSTRALAR">
                                <div style={{display: 'flex', gap: '0.5rem'}}>
                                  {m.ping_everyone && <span className="admin-badge" style={{background: 'rgba(88, 101, 242, 0.2)', color: '#5865F2'}}>@everyone</span>}
                                  {m.buttons?.length > 0 && <span className="admin-badge" style={{background: 'rgba(252, 163, 17, 0.2)', color: '#fca311'}}>{m.buttons.length} Buton</span>}
                                </div>
                              </td>
                              <td data-label="DURUM">
                                {m.is_active ? (
                                  <span className="admin-badge badge-active">Aktif</span>
                                ) : (
                                  <span className="admin-badge badge-passive">Pasif</span>
                                )}
                              </td>
                              <td data-label="İŞLEMLER">
                                <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                                   <button className="admin-action-btn danger" onClick={() => handleDeleteScheduled(m.id)}>
                                      <Trash2 size={18} />
                                   </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
                       <button className="admin-action-btn" onClick={() => setShowScheduledModal(false)} style={{padding: '0.5rem'}}>
                          <ArrowLeft size={20} />
                       </button>
                       <div>
                          <h2 style={{fontSize: '1.5rem', fontWeight: '800'}}>Yeni Mesaj Planla</h2>
                          <p style={{color: 'var(--admin-text-muted)'}}>Tüm sunuculara otomatik gidecek mesajı hazırlayın.</p>
                       </div>
                    </div>

                    <div className="admin-card" style={{padding: '2.5rem'}}>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem'}}>
                         <div>
                            <label className="admin-label">Zamanlama Türü</label>
                            <select className="admin-input-field" value={newScheduled.schedule_type} onChange={e => setNewScheduled({...newScheduled, schedule_type: e.target.value})}>
                               <option value="recurring">Tekrarlanan (Recurring)</option>
                               <option value="once">Tek Seferlik (Once)</option>
                            </select>
                            {newScheduled.schedule_type === 'recurring' && (
                              <div style={{marginTop: '1rem'}}>
                                 <label className="admin-label">Tekrar Aralığı (Gün)</label>
                                 <input 
                                   type="number" 
                                   min="1"
                                   className="admin-input-field" 
                                   value={newScheduled.interval_days || 1} 
                                   onChange={e => setNewScheduled({...newScheduled, interval_days: parseInt(e.target.value) || 1})} 
                                 />
                                 <p style={{fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '0.3rem'}}>1 = Her gün, 3 = 3 günde bir, 7 = Haftalık vb.</p>
                              </div>
                            )}
                         </div>
                         <div>
                            <label className="admin-label">
                              {newScheduled.schedule_type === 'recurring' ? 'Saat (HH:mm formatında, örn: 14:30)' : 'Tarih & Saat (YYYY-MM-DD HH:mm)'}
                            </label>
                            <input 
                              type={newScheduled.schedule_type === 'recurring' ? "time" : "datetime-local"}
                              className="admin-input-field" 
                              value={newScheduled.send_time} 
                              onChange={e => setNewScheduled({...newScheduled, send_time: e.target.value})} 
                            />
                         </div>
                      </div>

                      <div style={{marginBottom: '2rem'}}>
                         <label className="admin-label">Mesaj İçeriği</label>
                         <textarea 
                           className="admin-input-field" 
                           style={{height: '150px', resize: 'none'}} 
                           placeholder="Kullanıcılara gönderilecek mesaj içeriği..." 
                           value={newScheduled.message_content} 
                           onChange={e => setNewScheduled({...newScheduled, message_content: e.target.value})} 
                         />
                      </div>

                      <div style={{marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                         <input 
                           type="checkbox" 
                           id="pingEveryone"
                           checked={newScheduled.ping_everyone}
                           onChange={e => setNewScheduled({...newScheduled, ping_everyone: e.target.checked})}
                           style={{width: '20px', height: '20px', accentColor: 'var(--admin-accent)'}}
                         />
                         <label htmlFor="pingEveryone" style={{fontWeight: '600', cursor: 'pointer'}}>@everyone etiketi kullan</label>
                      </div>

                      <div style={{marginBottom: '2.5rem'}}>
                         <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                            <label className="admin-label" style={{margin: 0}}>Alt Butonlar (Linkler)</label>
                            <button 
                              className="admin-btn-secondary" 
                              style={{padding: '0.4rem 1rem', fontSize: '0.8rem'}}
                              onClick={() => setNewScheduled({...newScheduled, buttons: [...newScheduled.buttons, {label: '', url: ''}]})}
                            >
                              <Plus size={14} style={{marginRight: '0.3rem'}} /> Buton Ekle
                            </button>
                         </div>
                         
                         {newScheduled.buttons.length === 0 && (
                            <p style={{fontSize: '0.85rem', color: 'var(--admin-text-muted)', fontStyle: 'italic'}}>Henüz buton eklenmedi.</p>
                         )}
                         
                         {newScheduled.buttons.map((btn, index) => (
                           <div key={index} style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                              <input 
                                className="admin-input-field" 
                                placeholder="Buton Adı" 
                                value={btn.label} 
                                onChange={e => {
                                  const newBtns = [...newScheduled.buttons];
                                  newBtns[index].label = e.target.value;
                                  setNewScheduled({...newScheduled, buttons: newBtns});
                                }} 
                                style={{flex: 1}}
                              />
                              <input 
                                className="admin-input-field" 
                                placeholder="https://..." 
                                value={btn.url} 
                                onChange={e => {
                                  const newBtns = [...newScheduled.buttons];
                                  newBtns[index].url = e.target.value;
                                  setNewScheduled({...newScheduled, buttons: newBtns});
                                }} 
                                style={{flex: 2}}
                              />
                              <button 
                                className="admin-action-btn danger" 
                                onClick={() => {
                                  const newBtns = newScheduled.buttons.filter((_, i) => i !== index);
                                  setNewScheduled({...newScheduled, buttons: newBtns});
                                }}
                              >
                                <Trash2 size={18} />
                              </button>
                           </div>
                         ))}
                      </div>

                      <div style={{display: 'flex', gap: '1rem'}}>
                        <button className="admin-btn-secondary" style={{width: '200px'}} onClick={() => setShowScheduledModal(false)}>İptal</button>
                        <button className="btn-primary" style={{width: '250px', padding: '1rem'}} onClick={handleCreateScheduled} disabled={loading || !newScheduled.send_time || !newScheduled.message_content}>
                          {loading ? <Loader2 size={20} className="spin" /> : <><Save size={20}/> Planı Kaydet</>}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="animate-slide-up">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem'}}>
                   <div>
                      <h2 style={{fontSize: '1.5rem', fontWeight: '800'}}>Sistem Ayarları</h2>
                      <p style={{color: 'var(--admin-text-muted)'}}>Global bot ve site ayarlarını yapılandırın.</p>
                   </div>
                   <button className="btn-primary" onClick={handleSaveSettings} disabled={loading} style={{padding: '0.8rem 1.5rem', borderRadius: '12px'}}>
                      {loading ? <Loader2 size={20} className="spin" /> : <><Save size={20} /> Ayarları Kaydet</>}
                   </button>
                </div>

                <div className="admin-card" style={{padding: '2.5rem'}}>
                  <h3 style={{marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '700'}}>Top.gg Oy Sistemi</h3>
                  
                  <div style={{marginBottom: '2rem'}}>
                     <label className="admin-label">Oy Geçerlilik Süresi (Saat)</label>
                     <p style={{fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginBottom: '1rem'}}>
                        Bir kullanıcı Top.gg üzerinden oy verdiğinde, bu oy sistemde kaç saat boyunca geçerli sayılsın? (Örn: 1 Hafta = 168 Saat)
                     </p>
                     <input 
                       className="admin-input-field" 
                       type="number" 
                       value={systemSettings.vote_cooldown_hours || 168} 
                       onChange={e => setSystemSettings({...systemSettings, vote_cooldown_hours: parseInt(e.target.value) || 0})} 
                       style={{width: '200px'}}
                     />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      {/* RENEWED MODAL */}
      {showDayModal && (
        <div className="admin-modal-overlay" onClick={() => setShowDayModal(null)}>
          <div className="admin-modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div style={{textAlign: 'center', marginBottom: '2rem'}}>
               <div style={{background: showDayModal.mode === 'remove' ? 'rgba(231, 76, 60, 0.1)' : 'var(--admin-accent-muted)', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'}}>
                  <Calendar size={32} color={showDayModal.mode === 'remove' ? 'var(--admin-error)' : 'var(--admin-accent)'} />
               </div>
               <h2 style={{ fontSize: "1.5rem", fontWeight: "800" }}>
                 {showDayModal.mode === 'add' && 'Süre Ekle'}
                 {showDayModal.mode === 'remove' && 'Süre Çıkar'}
                 {showDayModal.mode === 'set_date' && 'Tarih Belirle'}
               </h2>
               <p style={{color: 'var(--admin-text-muted)', fontSize: '0.9rem'}}>
                 {showDayModal.mode === 'set_date' ? 'Yeni bitiş tarihini seçin.' : 'Uygulanacak gün sayısını girin.'}
               </p>
            </div>

            <div className="modal-tab-bar">
               <button 
                 className="modal-tab-btn"
                 onClick={() => setShowDayModal({...showDayModal, mode: 'add'})}
                 style={{background: showDayModal.mode === 'add' ? 'var(--admin-accent)' : 'transparent', color: showDayModal.mode === 'add' ? 'var(--admin-bg)' : 'white'}}
               >Ekle</button>
               <button 
                 className="modal-tab-btn"
                 onClick={() => setShowDayModal({...showDayModal, mode: 'remove'})}
                 style={{background: showDayModal.mode === 'remove' ? 'var(--admin-error)' : 'transparent', color: 'white'}}
               >Çıkar</button>
               <button 
                 className="modal-tab-btn"
                 onClick={() => setShowDayModal({...showDayModal, mode: 'set_date'})}
                 style={{background: showDayModal.mode === 'set_date' ? 'var(--admin-accent)' : 'transparent', color: showDayModal.mode === 'set_date' ? 'var(--admin-bg)' : 'white'}}
               >Tarih</button>
            </div>
            
            {showDayModal.mode === 'set_date' ? (
              <input 
                className="admin-input-field" 
                type="date" 
                value={expiryDate} 
                onChange={(e) => setExpiryDate(e.target.value)} 
              />
            ) : (
              <input 
                className="admin-input-field" 
                type="number" 
                autoFocus
                value={daysToAdd} 
                onChange={(e) => setDaysToAdd(e.target.value)} 
              />
            )}

            <div className="admin-btn-group">
              <button className="admin-btn-secondary" onClick={() => setShowDayModal(null)}>İptal</button>
              <button 
                className={(showDayModal.mode === 'add' || showDayModal.mode === 'set_date') ? 'admin-btn-primary' : 'admin-btn-primary danger'} 
                style={showDayModal.mode === 'remove' ? {background: 'var(--admin-error)'} : {}}
                onClick={() => {
                  const val = showDayModal.mode === 'set_date' ? expiryDate : daysToAdd;
                  const action = showDayModal.mode === 'set_date' ? 'set_expiry' : (showDayModal.mode === 'add' ? 'add_days' : 'remove_days');
                  handleServerAction(showDayModal.guildId, action, val);
                }}
              >
                {savingId === showDayModal.guildId ? <Loader2 size={18} className="spin" /> : 'Güncelle'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>

    </div>
  );
}
