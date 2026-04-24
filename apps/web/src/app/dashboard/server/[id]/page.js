"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Settings, Save, ArrowLeft, Loader2, Image as ImageIcon, Layout, CheckCircle, AlertTriangle, Shield, X, Crop, Users, Plus, Trash2, Copy, ChevronDown, ChevronRight, Edit2, List } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useToast, ToastContainer } from "@/components/Toast";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";
import { createClient } from "@supabase/supabase-js";
import "./server-dashboard.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ServerSettings() {
  const { data: session, status } = useSession();
  const { id: guildId } = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const { toasts, showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState(null);
  const [mainTab, setMainTab] = useState("settings");
  const [activeTab, setActiveTab] = useState("general");
  
  const [settings, setSettings] = useState({
    language: "tr",
    auto_role_sync: false,
    embed_thumbnail_url: "",
    whitelist: [],
    party_templates: [],
  });
  
  const [newWhitelistId, setNewWhitelistId] = useState("");
  const [whitelistSearch, setWhitelistSearch] = useState("");
  const [whitelistAddTab, setWhitelistAddTab] = useState("roles"); // "roles" | "users"

  const [thumbError, setThumbError] = useState(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const [discordRoles, setDiscordRoles] = useState([]);
  const [discordMembers, setDiscordMembers] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState(null);

  // Crop State
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && guildId) {
      // 1. Fetch settings
      fetch(`/api/guild-settings/${guildId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setSettings({
              language: data.language ?? "tr",
              auto_role_sync: data.auto_role_sync ?? false,
              embed_thumbnail_url: data.embed_thumbnail_url ?? "",
              whitelist: Array.isArray(data.whitelist) ? data.whitelist : [],
              party_templates: Array.isArray(data.party_templates) ? data.party_templates : [],
            });
            if (data.embed_thumbnail_url) checkImage(data.embed_thumbnail_url);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });

      // 2. Fetch Discord Roles & Members
      setRolesLoading(true);
      fetch(`/api/discord/guilds/${guildId}/roles`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setRolesError(data.error);
          } else {
            if (data.roles) setDiscordRoles(data.roles);
            if (data.members) setDiscordMembers(data.members);
            setRolesError(null);
          }
          setRolesLoading(false);
        })
        .catch(err => {
          setRolesError(err.message);
          setRolesLoading(false);
        });
    }
  }, [status, guildId]);

  const checkImage = (url) => {
    if (!url) {
      setThumbError(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      setThumbError({ level: 'success', msg: lang === 'en' ? `Thumbnail verified (${width}x${height})` : `Küçük resim doğrulandı (${width}x${height})` });
    };
    img.onerror = () => {
      setThumbError({ level: 'error', msg: lang === 'en' ? 'Cannot load thumbnail' : 'Küçük resim yüklenemedi' });
    };
    img.src = url;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = null; // reset input
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const uploadCroppedImage = async () => {
    try {
      setUploadingThumb(true);
      setThumbError({ level: 'loading', msg: lang === 'en' ? 'Uploading...' : 'Yükleniyor...' });
      
      // Get cropped file
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      const fileName = `${guildId}-thumbnail-${Date.now()}.png`;

      const { data, error } = await supabase.storage
        .from('guild-embeds')
        .upload(fileName, croppedBlob, { upsert: true, contentType: 'image/png' });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('guild-embeds')
        .getPublicUrl(fileName);

      setSettings(prev => ({
        ...prev,
        embed_thumbnail_url: publicUrl
      }));
      
      checkImage(publicUrl);
      setImageToCrop(null); // Close modal
      showToast(lang === 'en' ? 'Thumbnail updated!' : 'Küçük resim güncellendi!', 'success');
    } catch (err) {
      showToast(lang === 'en' ? 'Upload error: ' + err.message : 'Yükleme hatası: ' + err.message, 'error');
      setThumbError({ level: 'error', msg: lang === 'en' ? 'Upload failed' : 'Yükleme başarısız' });
    } finally {
      setUploadingThumb(false);
    }
  };

  const addWhitelistId = () => {
    if (!newWhitelistId.trim()) return;
    if (settings.whitelist.includes(newWhitelistId.trim())) return;
    
    setSettings({
      ...settings,
      whitelist: [...settings.whitelist, newWhitelistId.trim()]
    });
    setNewWhitelistId("");
  };

  const removeWhitelistId = (id) => {
    setSettings({
      ...settings,
      whitelist: settings.whitelist.filter(wId => wId !== id)
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/guild-settings/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Bilinmeyen hata");
      }
      showToast(
        lang === "en" ? "✅ Settings saved successfully!" : "✅ Ayarlar başarıyla kaydedildi!",
        "success"
      );
    } catch (err) {
      showToast(
        lang === "en" ? `❌ Error: ${err.message}` : `❌ Hata: ${err.message}`,
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <div className="animate-fade-in">{lang === "en" ? "Loading..." : "Yükleniyor..."}</div>
      </div>
    );
  }

const renderStatus = (errorState) => {
    if (!errorState) return null;
    if (errorState.level === 'loading') return <div className="status-msg"><Loader2 size={14} className="spin"/> {errorState.msg}</div>;
    if (errorState.level === 'error') return <div className="status-msg error"><AlertTriangle size={14}/> {errorState.msg}</div>;
    if (errorState.level === 'warning') return <div className="status-msg warning"><AlertTriangle size={14}/> {errorState.msg}</div>;
    return <div className="status-msg success"><CheckCircle size={14}/> {errorState.msg}</div>;
  };

  return (
    <div className="server-dash-container">
      <ToastContainer toasts={toasts} onRemove={(id) => {}} />

      <aside className="dash-sidebar">
        <div className="sidebar-group">
          <button className={`sidebar-item ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
            <Layout size={20} /> <span>{lang === "en" ? "General Settings" : "Genel Ayarlar"}</span>
          </button>
          <button className={`sidebar-item ${activeTab === 'embed' ? 'active' : ''}`} onClick={() => setActiveTab('embed')}>
            <ImageIcon size={20} /> <span>{lang === "en" ? "Visual Identity" : "Görsel Kimlik"}</span>
          </button>
          <button className={`sidebar-item ${activeTab === 'whitelist' ? 'active' : ''}`} onClick={() => setActiveTab('whitelist')}>
            <Users size={20} /> <span>{lang === "en" ? "Access Control" : "Erişim Kontrolü"}</span>
          </button>
          <button className={`sidebar-item ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
            <Copy size={20} /> <span>{lang === "en" ? "Templates" : "Parti Şablonları"}</span>
          </button>
        </div>
        
        <div style={{marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--dash-border)'}}>
           <Link href="/dashboard" className="sidebar-item" style={{justifyContent: 'center', background: 'rgba(255,255,255,0.03)'}}>
              <ArrowLeft size={18} /> <span>{lang === "en" ? "Dashboard" : "Geri Dön"}</span>
           </Link>
        </div>
      </aside>

      <main className="dash-main">
        <header className="dash-header">
          <div className="header-server-info">
            <div className="server-icon-lg">
               {session.user?.name?.charAt(0) || 'V'}
            </div>
            <div className="header-text">
               <h1>{lang === "en" ? "Server Dashboard" : "Sunucu Paneli"}</h1>
               <p>ID: <code>{guildId}</code></p>
            </div>
          </div>
          
          <button onClick={handleSave} className="btn-primary" disabled={saving} style={{padding: '0.85rem 2rem', borderRadius: '12px'}}>
            {saving ? <Loader2 size={20} className="spin" /> : <Save size={20} />}
            <span>{saving ? (lang === "en" ? "Saving..." : "Kaydediliyor...") : (lang === "en" ? "Save Settings" : "Ayarları Kaydet")}</span>
          </button>
        </header>

        {loading ? (
          <div className="loading-state" style={{height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--dash-text-muted)'}}>
            <Loader2 size={32} className="spin" />
            {lang === "en" ? "Fetching settings..." : "Ayarlar getiriliyor..."}
          </div>
        ) : (
          <div className="dash-content animate-fade-in">
            
            {activeTab === 'general' && (
              <div className="dash-section-card">
                <h2 className="section-title"><Shield size={22}/> {lang === "en" ? "Core Configuration" : "Temel Ayarlar"}</h2>
                <div className="dash-input-group">
                  <label className="dash-label">{lang === "en" ? "Bot Language" : "Bot Dili"}</label>
                  <select className="dash-select" value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })}>
                    <option value="tr">🇹🇷 Türkçe (TR)</option>
                    <option value="en">🇬🇧 English (EN)</option>
                  </select>
                  <p className="dash-hint">{lang === "en" ? "Sets the primary language for all bot messages in this server." : "Botun bu sunucuda vereceği tüm yanıtların ana dilini belirler."}</p>
                </div>

                <div className="dash-input-group" style={{marginTop: '2rem'}}>
                   <label className="dash-label" style={{display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--dash-border)', transition: 'all 0.2s'}}>
                      <input type="checkbox" style={{width: '22px', height: '22px', accentColor: 'var(--dash-accent)'}} checked={settings.auto_role_sync} onChange={(e) => setSettings({ ...settings, auto_role_sync: e.target.checked })} />
                      <div>
                        <div style={{fontWeight: '700', fontSize: '1.1rem'}}>{lang === "en" ? "Auto-Role Sync" : "Otomatik Rol Senkronizasyonu"}</div>
                        <p className="dash-hint" style={{margin: 0}}>{lang === "en" ? "Keep verified roles updated automatically in Discord." : "Kayıtlı üyelerin rollerini Discord içerisinde otomatik olarak senkronize eder."}</p>
                      </div>
                   </label>
                </div>
              </div>
            )}

            {activeTab === 'embed' && (
              <div className="dash-section-card">
                <h2 className="section-title"><ImageIcon size={22}/> {lang === "en" ? "Discord Visual Identity" : "Discord Görsel Kimlik"}</h2>
                <p className="dash-hint" style={{marginBottom: '2rem'}}>
                   {lang === "en" ? "Upload or link a logo to show on your party embeds. Only shown on /createparty." : "Parti mesajlarında görünecek sunucu logonuzu yükleyin veya linkini girin. Sadece /createparty embed'lerinde görünür."}
                </p>

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3rem'}}>
                  <div className="visuals-form">
                    <div className="dash-input-group">
                      <label className="dash-label">{lang === "en" ? "Logo Link (Direct URL)" : "Logo Linki (Doğrudan URL)"}</label>
                      <input type="text" className="dash-input" placeholder="https://i.imgur.com/..." value={settings.embed_thumbnail_url} onChange={(e) => { setSettings({ ...settings, embed_thumbnail_url: e.target.value }); checkImage(e.target.value); }} />
                    </div>

                    <div style={{margin: '2rem 0', height: '1px', background: 'var(--dash-border)', position: 'relative', textAlign: 'center'}}>
                       <span style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#0f111a', padding: '0 1rem', color: 'var(--dash-text-muted)', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px'}}>{lang === "en" ? "OR UPLOAD FILE" : "VEYA DOSYA YÜKLE"}</span>
                    </div>

                    <div className="upload-zone">
                      <input type="file" accept="image/*" id="thumbUpload" style={{display: 'none'}} onChange={(e) => { 
                         const file = e.target.files[0];
                         if (!file) return;
                         if (file.type === 'image/svg+xml') {
                           const reader = new FileReader();
                           reader.onload = async () => {
                             setUploadingThumb(true);
                             try {
                               const fileName = `${guildId}-thumbnail-${Date.now()}.svg`;
                               const { data, error } = await supabase.storage.from('guild-embeds').upload(fileName, file, { upsert: true, contentType: 'image/svg+xml' });
                               if (error) throw error;
                               const { data: { publicUrl } } = supabase.storage.from('guild-embeds').getPublicUrl(fileName);
                               setSettings(prev => ({ ...prev, embed_thumbnail_url: publicUrl }));
                               checkImage(publicUrl);
                               showToast(lang === 'en' ? 'SVG updated!' : 'SVG başarıyla yüklendi!', 'success');
                             } catch (err) { showToast('Upload error: ' + err.message, 'error'); } finally { setUploadingThumb(false); }
                           };
                           reader.readAsDataURL(file);
                         } else { handleFileSelect(e); }
                      }} />
                      <label htmlFor="thumbUpload" className="dash-select" style={{cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', border: '2px dashed var(--dash-border)', padding: '2.5rem', borderRadius: '16px', transition: 'all 0.3s'}}>
                        {uploadingThumb ? <Loader2 size={24} className="spin" color="var(--dash-accent)" /> : <ImageIcon size={28} color="var(--dash-accent)" />}
                        <div style={{textAlign: 'left'}}>
                           <div style={{fontWeight: '700', fontSize: '1.1rem'}}>{uploadingThumb ? (lang === "en" ? "Uploading..." : "Yükleniyor...") : (lang === "en" ? "Select Image" : "Görsel Seç")}</div>
                           <p className="dash-hint" style={{margin: 0}}>PNG, JPG or SVG</p>
                        </div>
                      </label>
                    </div>
                    {renderStatus(thumbError)}
                  </div>

                  <div className="preview-side">
                    <label className="dash-label" style={{textAlign: 'center', display: 'block', marginBottom: '1rem', color: 'var(--dash-accent)'}}>{lang === "en" ? "Live Discord Preview" : "Canlı Discord Önizlemesi"}</label>
                    <div className="discord-mockup" style={{background: '#2b2d31', borderRadius: '14px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'}}>
                       <div style={{borderLeft: '4px solid var(--dash-accent)', paddingLeft: '1.25rem', display: 'flex', justifyContent: 'space-between', gap: '1rem'}}>
                          <div style={{flex: 1}}>
                             <div style={{fontWeight: '700', fontSize: '1rem', marginBottom: '0.4rem', color: 'white'}}>🛡️ Veyronix | PARTİ KURULDU</div>
                             <div style={{fontSize: '0.85rem', color: '#dbdee1', lineHeight: '1.5'}}>Bu alan sunucunuza özel logo ile şık bir görünüme kavuşur. Kullanıcılarınız bu logoyu gördüğünde sunucunuzun kurumsallığını fark edecektir.</div>
                          </div>
                          {settings.embed_thumbnail_url && (
                             <img src={settings.embed_thumbnail_url} alt="Logo" style={{width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)'}} />
                          )}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'whitelist' && (
              <div className="dash-section-card">
                <h2 className="section-title"><Users size={22}/> {lang === "en" ? "Access Permissions" : "Erişim Yetkileri (Whitelist)"}</h2>
                <p className="dash-hint">
                  {lang === "en" ? "Assign specific roles or users that are allowed to bypass party limits." : "Parti limitlerini aşmasına izin verilen özel rolleri veya kullanıcıları belirleyin."}
                </p>

                <div style={{marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem'}}>
                   <div className="wl-picker-container">
                      <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem', borderRadius: '12px'}}>
                         <button className={`tab-mini ${whitelistAddTab === 'roles' ? 'active' : ''}`} onClick={() => setWhitelistAddTab('roles')} style={{flex: 1, padding: '0.85rem', borderRadius: '10px', background: whitelistAddTab === 'roles' ? 'var(--dash-accent-muted)' : 'transparent', color: whitelistAddTab === 'roles' ? 'var(--dash-accent)' : 'var(--dash-text-muted)', border: 'none', fontWeight: '700'}}>
                           <Shield size={18}/> {lang === "en" ? "Roles" : "Roller"}
                         </button>
                         <button className={`tab-mini ${whitelistAddTab === 'users' ? 'active' : ''}`} onClick={() => setWhitelistAddTab('users')} style={{flex: 1, padding: '0.85rem', borderRadius: '10px', background: whitelistAddTab === 'users' ? 'var(--dash-accent-muted)' : 'transparent', color: whitelistAddTab === 'users' ? 'var(--dash-accent)' : 'var(--dash-text-muted)', border: 'none', fontWeight: '700'}}>
                           <Users size={18}/> {lang === "en" ? "Users" : "Üyeler"}
                         </button>
                      </div>

                      <input type="text" className="dash-input" placeholder={lang === "en" ? "Type to search..." : "Aramak için yazın..."} value={whitelistSearch} onChange={(e) => setWhitelistSearch(e.target.value)} style={{marginBottom: '1rem', borderRadius: '12px'}} />

                      <div className="wl-picker-list" style={{maxHeight: '340px', overflowY: 'auto', background: 'rgba(0,0,0,0.15)', borderRadius: '14px', border: '1px solid var(--dash-border)'}}>
                         {whitelistAddTab === 'roles' ? (
                           discordRoles.filter(r => !settings.whitelist.includes(r.id) && r.name.toLowerCase().includes(whitelistSearch.toLowerCase())).map(role => (
                             <button key={role.id} onClick={() => setSettings(prev => ({...prev, whitelist: [...prev.whitelist, role.id]}))} className="sidebar-item" style={{justifyContent: 'space-between', borderBottom: '1px solid var(--dash-border)', borderRadius: 0}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                                  <div style={{width: '12px', height: '12px', borderRadius: '50%', background: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#94a3b8'}} />
                                  <span style={{fontWeight: '600'}}>{role.name}</span>
                                </div>
                                <Plus size={18} color="var(--dash-accent)" />
                             </button>
                           ))
                         ) : (
                           discordMembers.filter(m => !settings.whitelist.includes(m.id) && (m.username.toLowerCase().includes(whitelistSearch.toLowerCase()) || m.global_name?.toLowerCase().includes(whitelistSearch.toLowerCase()))).map(m => (
                             <button key={m.id} onClick={() => setSettings(prev => ({...prev, whitelist: [...prev.whitelist, m.id]}))} className="sidebar-item" style={{justifyContent: 'space-between', borderBottom: '1px solid var(--dash-border)', borderRadius: 0}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                                  <Users size={18} color="var(--dash-accent)" />
                                  <span style={{fontWeight: '600'}}>{m.global_name || m.username}</span>
                                </div>
                                <Plus size={18} color="var(--dash-accent)" />
                             </button>
                           ))
                         )}
                      </div>
                   </div>

                   <div className="wl-active-container">
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                         <h3 style={{fontSize: '1.1rem', fontWeight: '700'}}>{lang === "en" ? "Currently Whitelisted" : "Yetkili Listesi"}</h3>
                         <span style={{background: 'var(--dash-accent-muted)', color: 'var(--dash-accent)', padding: '0.2rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800'}}>{settings.whitelist.length}</span>
                      </div>

                      <div className="whitelist-grid" style={{maxHeight: '430px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                         {settings.whitelist.length === 0 ? (
                           <div style={{padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--dash-border)', borderRadius: '16px', color: 'var(--dash-text-muted)'}}>
                              {lang === "en" ? "No entries yet." : "Henüz kimse eklenmedi."}
                           </div>
                         ) : settings.whitelist.map(id => {
                           const role = discordRoles.find(r => r.id === id);
                           const member = discordMembers.find(m => m.id === id);
                           if (!role && !member) return null;
                           return (
                             <div key={id} className="wl-card" style={{padding: '1rem'}}>
                                <div className="wl-info">
                                   <div className="wl-icon-circle" style={{background: role ? 'rgba(252,163,17,0.1)' : 'rgba(52, 152, 219, 0.1)', color: role ? 'var(--dash-accent)' : '#3498db'}}>{role ? <Shield size={16} /> : <Users size={16} />}</div>
                                   <div style={{overflow: 'hidden'}}>
                                      <div style={{fontWeight: '700', fontSize: '0.95rem'}}>{role ? role.name : (member.global_name || member.username)}</div>
                                      <div style={{fontSize: '0.75rem', color: 'var(--dash-text-muted)'}}>{role ? 'Role' : 'Member'}</div>
                                   </div>
                                </div>
                                <button type="button" onClick={() => removeWhitelistId(id)} className="btn-remove-icon" style={{padding: '0.5rem'}}><X size={20} /></button>
                             </div>
                           )
                         })}
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="templates-container animate-fade-in">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem'}}>
                  <div>
                    <h2 className="section-title" style={{margin: 0}}><Copy size={22}/> {lang === "en" ? "Party Presets" : "Parti Şablonları"}</h2>
                    <p className="dash-hint">Sunucunuzda hızlıca parti kurmak için hazır şablonlar oluşturun.</p>
                  </div>
                  <button type="button" className="btn-primary" onClick={() => { const newTpl = { id: Date.now().toString(), name: "Yeni Şablon", title: "", description: "", roles: "Tank\nHeal\nDPS" }; setSettings({...settings, party_templates: [...settings.party_templates, newTpl]}); }} style={{borderRadius: '14px', padding: '1rem 2rem'}}>
                    <Plus size={22} /> {lang === "en" ? "Create Template" : "Şablon Oluştur"}
                  </button>
                </div>

                <div className="tpl-grid">
                  {settings.party_templates.map((tpl, i) => (
                    <div key={tpl.id} className="tpl-card">
                      <div className="tpl-card-header">
                         <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                            <div className="tpl-stat">{tpl.roles?.split('\n').filter(r => r.trim()).length || 0} {lang === "en" ? "Roles" : "Rol"}</div>
                            <h4 style={{margin: 0, fontWeight: '700', fontSize: '1.1rem'}}>{tpl.name}</h4>
                         </div>
                         <button type="button" onClick={() => setSettings({...settings, party_templates: settings.party_templates.filter(t => t.id !== tpl.id)})} className="btn-remove-icon" style={{color: 'var(--dash-error)', padding: '0.6rem'}}><Trash2 size={20} /></button>
                      </div>
                      <div className="tpl-card-body" style={{padding: '2rem'}}>
                         <div className="dash-input-group">
                           <label className="dash-label">{lang === "en" ? "Template Name" : "Şablon İsmi"}</label>
                           <input type="text" className="dash-input" value={tpl.name} onChange={(e) => { const nt = [...settings.party_templates]; nt[i].name = e.target.value; setSettings({...settings, party_templates: nt}); }} />
                         </div>
                         <div className="dash-input-group">
                           <label className="dash-label">{lang === "en" ? "Default Header" : "Varsayılan Başlık"}</label>
                           <input type="text" className="dash-input" value={tpl.title} onChange={(e) => { const nt = [...settings.party_templates]; nt[i].title = e.target.value; setSettings({...settings, party_templates: nt}); }} />
                         </div>
                         <div className="dash-input-group" style={{marginBottom: 0}}>
                           <label className="dash-label">{lang === "en" ? "Role List" : "Rol Listesi"}</label>
                           <textarea className="dash-textarea" rows={6} value={tpl.roles} onChange={(e) => { const nt = [...settings.party_templates]; nt[i].roles = e.target.value; setSettings({...settings, party_templates: nt}); }} style={{fontSize: '0.9rem', background: 'rgba(0,0,0,0.3)'}} />
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {imageToCrop && (
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          padding: 0.5rem;
          border-radius: 50%;
          transition: 0.2s;
        }
        .icon-btn:hover { background: rgba(255,255,255,0.1); color: white; transform: rotate(90deg); }
        
        .crop-container {
          position: relative;
          width: 100%;
          height: 350px;
          background: #000;
        }
        .slider-container {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(0,0,0,0.2);
        }
        .zoom-slider {
          flex: 1;
          accent-color: var(--accent-color);
          height: 6px;
        }
        
        .modal-actions {
          padding: 1.5rem;
          background: rgba(0,0,0,0.3);
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
        .btn-secondary {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          padding: 0.8rem 1.4rem;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.08); }

        /* Discord Embed Preview Premium */
        .preview-container {
          background: #313338;
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid #1e1f22;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          flex-shrink: 0;
          width: 100%;
        }
        @media (min-width: 700px) {
          .preview-container {
            width: 280px;
          }
        }
        .preview-container h3 {
          margin: 0 0 1.2rem 0;
          font-size: 1rem;
          color: #dbdee1;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .discord-embed {
          display: flex;
          background: #2b2d31;
          border-radius: 6px;
          overflow: hidden;
          max-width: 100%;
          flex-direction: column;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .embed-border {
          width: 4px;
          flex-shrink: 0;
          background: var(--accent-color);
          border-radius: 6px 0 0 6px;
        }
        .embed-content {
          padding: 1rem 1.2rem;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          width: 100%;
          gap: 1rem;
        }
        .embed-header {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1;
        }
        .embed-author { font-size: 0.85rem; color: #dbdee1; font-weight: 700; }
        .embed-title { font-size: 1.1rem; color: #5865f2; font-weight: 700; cursor: pointer; }
        .embed-title:hover { text-decoration: underline; }
        .embed-description { font-size: 0.875rem; color: #dbdee1; line-height: 1.5; margin-top: 0.2rem; }
        .embed-thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 6px;
          object-fit: cover;
          flex-shrink: 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        /* ── Template Body Layout ── */
        .tpl-body-layout {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        @media (min-width: 750px) {
          .tpl-body-layout {
            flex-direction: row;
            align-items: flex-start;
            gap: 2rem;
          }
        }

        .tpl-form-col {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          flex: 1;
          min-width: 0;
        }

        .tpl-field-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-main);
        }
        .tpl-badge {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 0.1rem 0.5rem;
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 500;
          margin-left: 0.3rem;
        }
        .tpl-required {
          color: #ed4245;
          font-weight: 700;
          margin-left: 2px;
        }

        .tpl-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0.25rem 0;
        }
        .tpl-divider::before, .tpl-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }
        .tpl-divider span {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          white-space: nowrap;
        }

        /* ── Discord Modal Preview ── */
        .tpl-preview-col {
          flex-shrink: 0;
          width: 100%;
        }
        @media (min-width: 750px) {
          .tpl-preview-col { width: 260px; }
        }

        .tpl-preview-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--text-muted);
          margin-bottom: 0.6rem;
        }

        .tpl-discord-modal {
          background: #313338;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.4);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          font-family: 'gg sans', 'Noto Sans', sans-serif;
        }
        .tpl-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.9rem 1rem 0.7rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .tpl-modal-title {
          font-size: 1rem;
          font-weight: 700;
          color: #f2f3f5;
        }
        .tpl-modal-body {
          padding: 0.75rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .tpl-modal-field { display: flex; flex-direction: column; gap: 0.3rem; }
        .tpl-modal-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #b5bac1;
        }
        .tpl-modal-input {
          background: #1e1f22;
          border: 1px solid rgba(0,0,0,0.3);
          border-radius: 4px;
          padding: 0.5rem 0.6rem;
          font-size: 0.85rem;
          color: #dbdee1;
          min-height: 36px;
          word-break: break-word;
        }
        .tpl-modal-textarea {
          background: #1e1f22;
          border: 1px solid rgba(0,0,0,0.3);
          border-radius: 4px;
          padding: 0.5rem 0.6rem;
          font-size: 0.82rem;
          color: #dbdee1;
          min-height: 60px;
          white-space: pre-wrap;
          word-break: break-word;
          line-height: 1.5;
        }
        .tpl-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          padding: 0.7rem 1rem;
          background: #2b2d31;
          border-top: 1px solid rgba(0,0,0,0.2);
        }
        .tpl-modal-cancel {
          padding: 0.4rem 0.9rem;
          background: transparent;
          color: #b5bac1;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
        }
        .tpl-modal-send {
          padding: 0.4rem 0.9rem;
          background: #5865f2;
          color: white;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
