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
    <div className="settings-page animate-fade-in">
      <ToastContainer toasts={toasts} onRemove={(id) => {}} />

      <div className="header-container">
        <Link href="/dashboard" className="back-link">
          <ArrowLeft size={18} />
          {lang === "en" ? "Back to Dashboard" : "Panele Dön"}
        </Link>
        <div className="title-area">
          <div className="title-icon-wrapper">
            <Settings size={32} color="var(--accent-color)" />
          </div>
          <div>
            <h1>{lang === "en" ? "Server Dashboard" : "Sunucu Paneli"}</h1>
            <p>Guild ID: <code>{guildId}</code></p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 size={24} className="spin" />
          {lang === "en" ? "Loading settings..." : "Ayarlar yükleniyor..."}
        </div>
      ) : (
        <div className="dashboard-layout">
          <aside className="main-sidebar glass-panel">
            <button 
              className={`nav-btn ${mainTab === "settings" ? "active" : ""}`}
              onClick={() => setMainTab("settings")}
            >
              <Settings size={18}/> {lang === "en" ? "Server Settings" : "Genel Ayarlar"}
            </button>
            <button 
              className={`nav-btn ${mainTab === "templates" ? "active" : ""}`}
              onClick={() => setMainTab("templates")}
            >
              <Copy size={18}/> {lang === "en" ? "Party Templates" : "Parti Şablonları"}
            </button>
          </aside>

          <div className="main-content">
            {mainTab === "settings" && (
              <div className="form-column">
                <div className="tabs">
                  <button 
                    className={`tab ${activeTab === "general" ? "active" : ""}`}
                    onClick={() => setActiveTab("general")}
                    type="button"
                  >
                    <Layout size={18}/> {lang === "en" ? "General" : "Genel Ayarlar"}
                  </button>
                  <button 
                    className={`tab ${activeTab === "embed" ? "active" : ""}`}
                    onClick={() => setActiveTab("embed")}
                    type="button"
                  >
                    <ImageIcon size={18}/> {lang === "en" ? "Discord Visuals" : "Embed Resmi"}
                  </button>
                  <button 
                    className={`tab ${activeTab === "whitelist" ? "active" : ""}`}
                    onClick={() => setActiveTab("whitelist")}
                    type="button"
                  >
                    <Users size={18}/> {lang === "en" ? "Whitelist" : "Erişim (Whitelist)"}
                  </button>
                </div>

                <form onSubmit={handleSave} className="settings-form glass-panel">
                  {activeTab === "general" && (
                    <div className="form-section animate-fade-in">
                      <h2><Shield size={20}/> {lang === "en" ? "Core Settings" : "Temel Ayarlar"}</h2>
                      
                      <div className="input-group">
                        <label>{lang === "en" ? "Bot Language" : "Bot Dili"}</label>
                        <select
                          value={settings.language}
                          onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                        >
                          <option value="tr">🇹🇷 Türkçe (TR)</option>
                          <option value="en">🇬🇧 English (EN)</option>
                        </select>
                        <p className="hint">
                          {lang === "en" ? "Sets the default language for all bot messages." : "Botun bu sunucuda vereceği yanıtların ana dilini belirler."}
                        </p>
                      </div>

                      <div className="toggle-group">
                        <label className="toggle-label">
                          <input
                            type="checkbox"
                            checked={settings.auto_role_sync}
                            onChange={(e) => setSettings({ ...settings, auto_role_sync: e.target.checked })}
                          />
                          <span className="toggle-text">{lang === "en" ? "Enable Auto Role Sync" : "Otomatik Rol Eşitlemeyi Aç"}</span>
                        </label>
                        <p className="hint">
                          {lang === "en" ? "Automatically syncs verified member roles on changes." : "Kayıtlı üyelerin rollerini Discord içerisinde otomatik olarak senkronize eder."}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "embed" && (
                    <div className="form-section animate-fade-in">
                      <h2><ImageIcon size={20}/> {lang === "en" ? "Discord Thumbnail" : "Discord Thumbnail (Küçük Resim)"}</h2>
                      <p className="hint" style={{marginBottom: "1rem"}}>
                        {lang === "en" ? "Customize your bot's thumbnail embedded into discord messages." : "Discord'da gönderilen bot mesajlarının yanında çıkacak logoyu/küçük resmi ayarlayın."}
                      </p>

                      <div className="embed-tab-layout">
                          <label>
                            {lang === "en" ? "Thumbnail Image" : "Küçük Resim (Thumbnail)"}
                          </label>
                          
                          {/* URL Input */}
                          <div className="url-input-group" style={{marginBottom: "1rem"}}>
                            <input
                              type="text"
                              className="role-selector"
                              placeholder={lang === "en" ? "Paste image URL (PNG, SVG, JPG)..." : "Resim linki yapıştırın (PNG, SVG, JPG)..."}
                              value={settings.embed_thumbnail_url}
                              onChange={(e) => {
                                setSettings({ ...settings, embed_thumbnail_url: e.target.value });
                                checkImage(e.target.value);
                              }}
                            />
                          </div>

                          <div className="file-upload-wrapper">
                            <input
                              type="file"
                              accept="image/*"
                              id="thumbUpload"
                              className="file-input-hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                
                                // SVG handling (no crop)
                                if (file.type === 'image/svg+xml') {
                                  const reader = new FileReader();
                                  reader.onload = async () => {
                                    setUploadingThumb(true);
                                    try {
                                      const fileName = `${guildId}-thumbnail-${Date.now()}.svg`;
                                      const { data, error } = await supabase.storage
                                        .from('guild-embeds')
                                        .upload(fileName, file, { upsert: true, contentType: 'image/svg+xml' });
                                      if (error) throw error;
                                      const { data: { publicUrl } } = supabase.storage.from('guild-embeds').getPublicUrl(fileName);
                                      setSettings(prev => ({ ...prev, embed_thumbnail_url: publicUrl }));
                                      checkImage(publicUrl);
                                      showToast(lang === 'en' ? 'SVG uploaded!' : 'SVG başarıyla yüklendi!', 'success');
                                    } catch (err) {
                                      showToast('SVG error: ' + err.message, 'error');
                                    } finally {
                                      setUploadingThumb(false);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                } else {
                                  handleFileSelect(e);
                                }
                              }}
                              disabled={uploadingThumb}
                            />
                            <label htmlFor="thumbUpload" className="file-upload-btn">
                              {uploadingThumb ? <Loader2 size={16} className="spin" /> : <ImageIcon size={16} />}
                              {uploadingThumb 
                                ? (lang === "en" ? "Uploading..." : "Yükleniyor...") 
                                : (lang === "en" ? "Upload PNG/SVG/JPG" : "PNG/SVG/JPG Yükle")}
                            </label>
                            {settings.embed_thumbnail_url && !uploadingThumb && (
                              <button type="button" className="btn-remove" onClick={() => { setSettings({...settings, embed_thumbnail_url: ""}); setThumbError(null); }}>
                                {lang === "en" ? "Remove" : "Kaldır"}
                              </button>
                            )}
                          </div>
                          {renderStatus(thumbError)}
                          <p className="hint">
                            {lang === "en" 
                              ? "Note: This logo will ONLY appear in /createparty messages. Other notifications will remain clean." 
                              : "Not: Bu logo SADECE /createparty mesajlarında görünür. Diğer bildirimler sade kalacaktır."}
                          </p>

                        {/* Inline Preview */}
                        <div className="preview-container">
                          <h3>{lang === "en" ? "Live Preview" : "Canlı Önizleme"}</h3>
                          <div className="discord-embed">
                            <div className="embed-border"></div>
                            <div className="embed-content">
                              <div className="embed-header">
                                <div className="embed-author">Albion Bot System</div>
                                <div className="embed-title">Example Command Title</div>
                                <div className="embed-description">
                                  {lang === "en" 
                                    ? "This is how your Discord embeds will look when the bot sends messages in the channel." 
                                    : "Bot Discord kanalına uyarı ve mesaj gönderdiğinde görsellerinizin nasıl duracağını buradan görebilirsiniz."}
                                </div>
                              </div>
                              
                              {settings.embed_thumbnail_url && !thumbError?.level?.includes('error') && (
                                <img 
                                  src={settings.embed_thumbnail_url} 
                                  alt="Thumbnail" 
                                  className="embed-thumbnail" 
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "whitelist" && (() => {
                    // --- filtered lists for the ADD panel ---
                    const sq = whitelistSearch.toLowerCase();
                    const filteredRoles = discordRoles.filter(r =>
                      !settings.whitelist.includes(r.id) &&
                      r.name.toLowerCase().includes(sq)
                    );
                    const filteredMembers = discordMembers.filter(m =>
                      !settings.whitelist.includes(m.id) &&
                      (m.username.toLowerCase().includes(sq) ||
                       (m.global_name || "").toLowerCase().includes(sq))
                    );

                    // --- split added items by type ---
                    const addedRoles = settings.whitelist
                      .map(id => discordRoles.find(r => r.id === id))
                      .filter(Boolean);
                    const addedUsers = settings.whitelist
                      .map(id => discordMembers.find(m => m.id === id))
                      .filter(Boolean);
                    const addedManual = settings.whitelist.filter(
                      id => !discordRoles.find(r => r.id === id) && !discordMembers.find(m => m.id === id)
                    );

                    return (
                      <div className="form-section animate-fade-in">
                        <h2><Users size={20}/> {lang === "en" ? "Access Control (Whitelist)" : "Erişim Kontrolü (Whitelist)"}</h2>
                        <p className="hint">
                          {lang === "en"
                            ? "Users on the whitelist can create up to 3 simultaneous parties. Regular users can only create 1 party at a time."
                            : "Whitelist'e eklenen rol veya kullanıcılar aynı anda 3 parti oluşturabilir. Normal kullanıcılar yalnızca 1 parti oluşturabilir."}
                        </p>

                        {/* ── ADD PANEL ── */}
                        <div className="wl-add-panel">
                          {/* Sekme seçici */}
                          <div className="wl-add-tabs">
                            <button
                              type="button"
                              className={`wl-add-tab ${whitelistAddTab === "roles" ? "active" : ""}`}
                              onClick={() => { setWhitelistAddTab("roles"); setWhitelistSearch(""); }}
                            >
                              <Shield size={14}/> {lang === "en" ? `Roles (${discordRoles.length})` : `Roller (${discordRoles.length})`}
                            </button>
                            <button
                              type="button"
                              className={`wl-add-tab ${whitelistAddTab === "users" ? "active" : ""}`}
                              onClick={() => { setWhitelistAddTab("users"); setWhitelistSearch(""); }}
                            >
                              <Users size={14}/> {lang === "en" ? `Users (${discordMembers.length})` : `Kullanıcılar (${discordMembers.length})`}
                            </button>
                            <button
                              type="button"
                              className={`wl-add-tab ${whitelistAddTab === "manual" ? "active" : ""}`}
                              onClick={() => { setWhitelistAddTab("manual"); setWhitelistSearch(""); }}
                            >
                              <Edit2 size={14}/> {lang === "en" ? "Manual ID" : "Manuel ID"}
                            </button>
                          </div>

                          {/* Arama kutusu */}
                          {whitelistAddTab !== "manual" && (
                            <div className="wl-search-box">
                              <input
                                type="text"
                                placeholder={lang === "en"
                                  ? (whitelistAddTab === "roles" ? "Search roles..." : "Search users...")
                                  : (whitelistAddTab === "roles" ? "Rollerde ara..." : "Kullanıcılarda ara...")}
                                value={whitelistSearch}
                                onChange={e => setWhitelistSearch(e.target.value)}
                                className="wl-search-input"
                              />
                            </div>
                          )}

                          {/* İçerik: roller listesi */}
                          {whitelistAddTab === "roles" && (
                            rolesLoading ? (
                              <div className="wl-empty">
                                <Loader2 size={18} className="spin"/> {lang === "en" ? "Loading..." : "Yükleniyor..."}
                              </div>
                            ) : rolesError ? (
                              <div className="wl-empty" style={{color:"#f87171"}}>
                                <AlertTriangle size={16}/> {rolesError}
                              </div>
                            ) : filteredRoles.length === 0 ? (
                              <div className="wl-empty">
                                {whitelistSearch
                                  ? (lang === "en" ? "No roles found." : "Rol bulunamadı.")
                                  : (lang === "en" ? "All roles already added." : "Tüm roller zaten eklendi.")}
                              </div>
                            ) : (
                              <div className="wl-pick-list">
                                {filteredRoles.map(role => {
                                  const hex = role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#99aab5';
                                  return (
                                    <button
                                      key={role.id}
                                      type="button"
                                      className="wl-pick-item"
                                      onClick={() => {
                                        setSettings(prev => ({...prev, whitelist: [...prev.whitelist, role.id]}));
                                      }}
                                    >
                                      <span className="wl-role-dot" style={{background: hex}}/>
                                      <span className="wl-pick-name">@{role.name}</span>
                                      <Plus size={14} className="wl-pick-plus"/>
                                    </button>
                                  );
                                })}
                              </div>
                            )
                          )}

                          {/* İçerik: kullanıcılar listesi */}
                          {whitelistAddTab === "users" && (
                            rolesLoading ? (
                              <div className="wl-empty">
                                <Loader2 size={18} className="spin"/> {lang === "en" ? "Loading..." : "Yükleniyor..."}
                              </div>
                            ) : rolesError ? (
                              <div className="wl-empty" style={{color:"#f87171"}}>
                                <AlertTriangle size={16}/> {rolesError}
                              </div>
                            ) : filteredMembers.length === 0 ? (
                              <div className="wl-empty">
                                {whitelistSearch
                                  ? (lang === "en" ? "No users found." : "Kullanıcı bulunamadı.")
                                  : (lang === "en" ? "All users already added." : "Tüm kullanıcılar zaten eklendi.")}
                              </div>
                            ) : (
                              <div className="wl-pick-list">
                                {filteredMembers.map(m => (
                                  <button
                                    key={m.id}
                                    type="button"
                                    className="wl-pick-item"
                                    onClick={() => {
                                      setSettings(prev => ({...prev, whitelist: [...prev.whitelist, m.id]}));
                                    }}
                                  >
                                    <Users size={13} style={{color: 'var(--accent-color)', flexShrink: 0}}/>
                                    <span className="wl-pick-name">
                                      @{m.username}
                                      {m.global_name && <span className="wl-pick-sub"> ({m.global_name})</span>}
                                    </span>
                                    <Plus size={14} className="wl-pick-plus"/>
                                  </button>
                                ))}
                              </div>
                            )
                          )}

                          {/* İçerik: manuel ID */}
                          {whitelistAddTab === "manual" && (
                            <div className="wl-manual-row">
                              <input
                                type="text"
                                className="wl-manual-input"
                                placeholder={lang === "en" ? "Enter Discord User/Role ID" : "Discord Kullanıcı veya Rol ID'si girin"}
                                value={newWhitelistId}
                                onChange={e => setNewWhitelistId(e.target.value)}
                                onKeyDown={e => { if(e.key === 'Enter'){ e.preventDefault(); addWhitelistId(); } }}
                              />
                              <button type="button" onClick={addWhitelistId} className="btn-primary" style={{padding: "0.8rem 1.2rem", borderRadius: "8px", flexShrink: 0}}>
                                <Plus size={18} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* ── ADDED LIST ── */}
                        <div className="wl-added-panel">
                          <div className="wl-added-header">
                            <span>{lang === "en" ? "Added" : "Eklenenler"}</span>
                            <span className="wl-count-badge">{settings.whitelist.length}</span>
                          </div>

                          {settings.whitelist.length === 0 ? (
                            <div className="whitelist-empty">
                              {lang === "en" ? "No entries added yet." : "Henüz hiçbir şey eklenmedi."}
                            </div>
                          ) : (
                            <div className="wl-added-body">
                              {/* Roller grubu */}
                              {addedRoles.length > 0 && (
                                <div className="wl-group">
                                  <div className="wl-group-label"><Shield size={12}/> {lang === "en" ? "Roles" : "Roller"}</div>
                                  {addedRoles.map(role => {
                                    const hex = role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#99aab5';
                                    return (
                                      <div key={role.id} className="whitelist-item">
                                        <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                                          <span className="wl-role-dot" style={{background: hex}}/>
                                          <code>@{role.name}</code>
                                        </div>
                                        <button type="button" className="btn-remove-icon" onClick={() => removeWhitelistId(role.id)}>
                                          <Trash2 size={16}/>
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Kullanıcılar grubu */}
                              {addedUsers.length > 0 && (
                                <div className="wl-group">
                                  <div className="wl-group-label"><Users size={12}/> {lang === "en" ? "Users" : "Kullanıcılar"}</div>
                                  {addedUsers.map(m => (
                                    <div key={m.id} className="whitelist-item">
                                      <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                                        <Users size={14} color="var(--accent-color)"/>
                                        <code>@{m.username}{m.global_name ? ` (${m.global_name})` : ''}</code>
                                      </div>
                                      <button type="button" className="btn-remove-icon" onClick={() => removeWhitelistId(m.id)}>
                                        <Trash2 size={16}/>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Manuel / bilinmeyen ID'ler */}
                              {addedManual.length > 0 && (
                                <div className="wl-group">
                                  <div className="wl-group-label"><Edit2 size={12}/> {lang === "en" ? "Manual IDs" : "Manuel ID'ler"}</div>
                                  {addedManual.map(id => (
                                    <div key={id} className="whitelist-item">
                                      <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                                        <Users size={14} color="var(--text-muted)"/>
                                        <code>{id}</code>
                                      </div>
                                      <button type="button" className="btn-remove-icon" onClick={() => removeWhitelistId(id)}>
                                        <Trash2 size={16}/>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={saving}>
                      {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                      {saving
                        ? (lang === "en" ? "Saving..." : "Kaydediliyor...")
                        : (lang === "en" ? "Save Settings" : "Ayarları Kaydet")}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {mainTab === "templates" && (
              <div className="settings-form glass-panel animate-fade-in">
                <h2><Copy size={20} /> {lang === "en" ? "Party Templates" : "Parti Şablonları"}</h2>
                <p className="hint" style={{marginBottom: "1.5rem"}}>
                  {lang === "en" ? "Create custom party embed templates for this server." : "Bu sunucuda oluşturacağınız 'Parti Kur' templatelerini buradan belirleyin."}
                </p>
                
                <button 
                  type="button" 
                  className="btn-primary"
                  style={{ marginBottom: "1.5rem" }}
                  onClick={() => {
                    const newTpl = { id: Date.now().toString(), name: "Yeni Şablon", title: "", description: "", roles: "Tank\nHeal\nDPS" };
                    setSettings({...settings, party_templates: [...settings.party_templates, newTpl]});
                  }}
                >
                  <Plus size={16}/> {lang === "en" ? "Add Template" : "Yeni Şablon Ekle"}
                </button>

                <div className="template-list" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {settings.party_templates.length === 0 ? (
                    <div className="whitelist-empty">
                      {lang === "en" ? "No templates created yet." : "Henüz bir şablon oluşturulmadı."}
                    </div>
                  ) : (
                    settings.party_templates.map((tpl, i) => (
                      <div key={tpl.id} className="whitelist-item template-accordion-wrapper" style={{ flexDirection: "column", alignItems: "stretch", padding: 0, gap: 0, overflow: "hidden" }}>
                        {/* Header for Accordion */}
                        <div 
                          className="template-accordion-header" 
                          onClick={() => setExpandedTemplate(expandedTemplate === tpl.id ? null : tpl.id)}
                          style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
                            padding: "1rem"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                            {expandedTemplate === tpl.id ? <ChevronDown size={18} color="var(--accent-color)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
                            <span style={{ 
                              width: "30px", height: "30px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", 
                              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: "bold" 
                            }}>
                              {i+1}
                            </span>
                            <div>
                               <h4 style={{ margin: 0, color: "var(--text-main)", fontSize: "1.05rem" }}>{tpl.name || (lang === "en" ? "Unnamed Template" : "İsimsiz Şablon")}</h4>
                               <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                 {tpl.title || (lang === "en" ? "No title yet" : "Henüz başlık yok")}
                                 {tpl.roles ? ` · ${tpl.roles.split('\n').filter(r => r.trim()).length} ${lang === "en" ? "roles" : "rol"}` : ""}
                               </span>
                            </div>
                          </div>
                          
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <button 
                              type="button" 
                              className="btn-remove-icon" 
                              onClick={(e) => {
                                e.stopPropagation(); // prevent accordion toggle
                                setSettings({...settings, party_templates: settings.party_templates.filter(t => t.id !== tpl.id)});
                              }}
                            >
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        </div>
                        
                        {/* Body for Accordion */}
                        {expandedTemplate === tpl.id && (
                          <div className="template-accordion-body" style={{ padding: "0 1rem 1.5rem 1rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.25rem" }}>
                            <div className="tpl-body-layout">
                              {/* ── SOL: Form alanları ── */}
                              <div className="tpl-form-col">

                                {/* Şablon Adı */}
                                <div className="input-group">
                                  <label className="tpl-field-label">
                                    <List size={14}/>
                                    {lang === "en" ? "Template Name" : "Şablon Adı"}
                                    <span className="tpl-badge">{lang === "en" ? "shown in bot menu" : "bot menüsünde görünür"}</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="role-selector"
                                    placeholder={lang === "en" ? "e.g., ZVZ Party, Avalon Farm..." : "Örn. ZVZ Ekibi, Statik Farm..."}
                                    value={tpl.name}
                                    onChange={(e) => {
                                      const nt = [...settings.party_templates];
                                      nt[i].name = e.target.value;
                                      setSettings({...settings, party_templates: nt});
                                    }}
                                  />
                                </div>

                                <div className="tpl-divider"><span>{lang === "en" ? "Party modal fields" : "Parti oluşturma alanları"}</span></div>

                                {/* Parti Başlığı */}
                                <div className="input-group">
                                  <label className="tpl-field-label">
                                    {lang === "en" ? "Parti Başlığı" : "Parti Başlığı"}
                                    <span className="tpl-required">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="role-selector"
                                    placeholder={lang === "en" ? "e.g., T8 Avalon Dungeon Party" : "Örn. T8 Avalon Zindanı!"}
                                    value={tpl.title}
                                    onChange={(e) => {
                                      const nt = [...settings.party_templates];
                                      nt[i].title = e.target.value;
                                      setSettings({...settings, party_templates: nt});
                                    }}
                                  />
                                </div>

                                {/* Parti Açıklaması */}
                                <div className="input-group">
                                  <label className="tpl-field-label">
                                    {lang === "en" ? "Parti Açıklaması / Notlar" : "Parti Açıklaması / Notlar"}
                                  </label>
                                  <textarea
                                    className="role-selector"
                                    value={tpl.description}
                                    placeholder={lang === "en" ? "e.g., T6-7 gears. Kalite 4+ maps." : "Örn. T6-7 gearlar. Kalite 4+ haritalara gidilecek."}
                                    rows={3}
                                    onChange={(e) => {
                                      const nt = [...settings.party_templates];
                                      nt[i].description = e.target.value;
                                      setSettings({...settings, party_templates: nt});
                                    }}
                                  />
                                </div>

                                {/* Roller */}
                                <div className="input-group">
                                  <label className="tpl-field-label">
                                    {lang === "en" ? "Roller" : "Roller"}
                                    <span className="tpl-required">*</span>
                                  </label>
                                  <textarea
                                    className="role-selector"
                                    value={tpl.roles ?? ""}
                                    placeholder={lang === "en" ? "Tank\nHeal\nDPS\n(one role per line)" : "Tank\nHeal\nDPS\n(Her satıra bir rol)"}
                                    rows={5}
                                    onChange={(e) => {
                                      const nt = [...settings.party_templates];
                                      nt[i].roles = e.target.value;
                                      setSettings({...settings, party_templates: nt});
                                    }}
                                  />
                                  <p className="hint">{lang === "en" ? "Each line = one role slot in Discord." : "Her satır Discord'da ayrı bir rol slotu olarak görünür."}</p>
                                </div>
                              </div>

                              {/* ── SAĞ: Discord modal önizleme ── */}
                              <div className="tpl-preview-col">
                                <div className="tpl-preview-label">{lang === "en" ? "Bot Preview" : "Bot Önizleme"}</div>
                                <div className="tpl-discord-modal">
                                  <div className="tpl-modal-header">
                                    <span className="tpl-modal-title">Parti Oluştur</span>
                                    <X size={16} style={{color: "#b5bac1", cursor: "pointer"}}/>
                                  </div>
                                  <div className="tpl-modal-body">
                                    <div className="tpl-modal-field">
                                      <label className="tpl-modal-label">
                                        Parti Başlığı <span style={{color:"#ed4245"}}>*</span>
                                      </label>
                                      <div className="tpl-modal-input">
                                        {tpl.title || <span style={{color:"#87898c"}}>Başlığı girin</span>}
                                      </div>
                                    </div>
                                    <div className="tpl-modal-field">
                                      <label className="tpl-modal-label">Parti Açıklaması / Notlar</label>
                                      <div className="tpl-modal-textarea">
                                        {tpl.description || <span style={{color:"#87898c"}}>Örn. T6-7 gearlar. Kalite 4+ haritalara gidilecek.</span>}
                                      </div>
                                    </div>
                                    <div className="tpl-modal-field">
                                      <label className="tpl-modal-label">
                                        Roller <span style={{color:"#ed4245"}}>*</span>
                                      </label>
                                      <div className="tpl-modal-textarea">
                                        {tpl.roles
                                          ? tpl.roles.split('\n').filter(r => r.trim()).map((r, ri) => (
                                              <div key={ri}>{r}</div>
                                            ))
                                          : <span style={{color:"#87898c"}}>Tank{"\n"}Heal{"\n"}DPS</span>
                                        }
                                      </div>
                                    </div>
                                  </div>
                                  <div className="tpl-modal-footer">
                                    <div className="tpl-modal-cancel">İptal</div>
                                    <div className="tpl-modal-send">Gönder</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-primary" disabled={saving} onClick={handleSave}>
                    {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                    {saving ? (lang === "en" ? "Saving..." : "Kaydediliyor...") : (lang === "en" ? "Save Templates" : "Şablonları Kaydet")}
                  </button>
                </div>
              </div>
            )}
          </div>


        </div>
      )}

      {/* Crop Modal */}
      {imageToCrop && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <div className="modal-header">
              <h3><Crop size={18} /> {lang === 'en' ? 'Crop Thumbnail (1:1)' : 'Küçük Resmi Kırp (1:1 Boyut)'}</h3>
              <button className="icon-btn" onClick={() => setImageToCrop(null)}><X size={20}/></button>
            </div>
            <div className="crop-container">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="slider-container">
              <label>{lang === 'en' ? 'Zoom' : 'Yakınlaştır'}</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(e.target.value)}
                className="zoom-slider"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setImageToCrop(null)}>
                {lang === 'en' ? 'Cancel' : 'İptal'}
              </button>
              <button className="btn-primary" onClick={uploadCroppedImage} disabled={uploadingThumb}>
                {uploadingThumb ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                {lang === 'en' ? 'Crop & Upload' : 'Kırp ve Yükle'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .settings-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        /* Premium Header */
        .header-container {
          margin-bottom: 2.5rem;
          position: relative;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          text-decoration: none;
          margin-bottom: 1.5rem;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .back-link:hover { 
          color: var(--accent-color);
          transform: translateX(-4px);
        }
        .title-area {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .title-icon-wrapper {
          background: linear-gradient(135deg, rgba(252, 163, 17, 0.2) 0%, rgba(255, 94, 0, 0.1) 100%);
          padding: 1rem;
          border-radius: 16px;
          border: 1px solid rgba(252, 163, 17, 0.3);
          box-shadow: 0 0 20px rgba(252, 163, 17, 0.1);
        }
        .title-area h1 {
          font-size: 2.2rem;
          margin: 0;
          letter-spacing: -0.5px;
          background: linear-gradient(to right, #fff, #c5c6c7);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .title-area p {
          margin: 0.3rem 0 0;
          color: var(--text-muted);
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .title-area code {
          background: rgba(255,255,255,0.08);
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          font-family: inherit;
          font-weight: 600;
          letter-spacing: 0.5px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          align-items: flex-start;
        }
        @media (min-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr 380px;
          }
        }
        
        .dashboard-layout {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        @media (min-width: 900px) {
          .dashboard-layout {
            flex-direction: row;
            align-items: flex-start;
          }
        }

        .main-sidebar {
          display: flex;
          flex-direction: row;
          gap: 0.5rem;
          padding: 1rem;
          border-radius: 16px;
          background: rgba(31, 40, 51, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        @media (min-width: 900px) {
          .main-sidebar {
            flex-direction: column;
            width: 250px;
            flex-shrink: 0;
            position: sticky;
            top: 2rem;
          }
          .main-content {
            flex: 1;
            min-width: 0;
          }
        }

        /* Embed tab: form alanı ile önizleme yan yana */
        .embed-tab-layout {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        @media (min-width: 700px) {
          .embed-tab-layout {
            flex-direction: row;
            align-items: flex-start;
            gap: 2rem;
          }
        }

        .form-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 1rem 1.2rem;
          background: transparent;
          color: var(--text-muted);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s;
          text-align: left;
        }
        .nav-btn:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text-main);
          transform: translateX(4px);
        }
        .nav-btn.active {
          background: rgba(252, 163, 17, 0.15);
          color: var(--accent-color);
          border-left: 3px solid var(--accent-color);
        }

        /* Segmented Control Tabs */
        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          background: rgba(0,0,0,0.25);
          padding: 0.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }
        .tab {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          flex: 1;
          padding: 0.8rem 1rem;
          background: transparent;
          color: var(--text-muted);
          border-radius: 8px;
          border: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
        }
        .tab:hover {
          color: var(--text-main);
          background: rgba(255,255,255,0.05);
        }
        .tab.active {
          background: var(--accent-color);
          color: var(--bg-color);
          box-shadow: 0 4px 15px rgba(252, 163, 17, 0.3);
          transform: scale(1.02);
        }

        /* Glass Panel Enhanced */
        .settings-form {
          padding: 2.5rem;
          border-radius: 20px;
          background: rgba(31, 40, 51, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        .form-section {
          display: flex;
          flex-direction: column;
          gap: 1.8rem;
        }
        .form-section h2 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.4rem;
          margin: 0;
          color: #fff;
          font-weight: 700;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .form-section h2 svg {
          color: var(--accent-color);
        }
        
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .input-group label {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-main);
          letter-spacing: 0.3px;
        }
        .input-group select, 
        .role-selector,
        .whitelist-adder input {
          width: 100%;
          padding: 1rem 1.2rem;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.3);
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
          font-family: inherit;
          font-size: 0.95rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .input-group select:hover, 
        .role-selector:hover,
        .whitelist-adder input:hover {
          background: rgba(0, 0, 0, 0.4);
          border-color: rgba(255,255,255,0.2);
        }
        .input-group select:focus, 
        .role-selector:focus,
        .whitelist-adder input:focus {
          outline: none;
          border-color: var(--accent-color);
          background: rgba(0, 0, 0, 0.5);
          box-shadow: 0 0 0 3px rgba(252, 163, 17, 0.15);
        }
        .input-group select option, .role-selector option {
          background: var(--panel-color);
          color: white;
        }

        .hint {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.5;
        }

        /* Toggle Checkbox Modern */
        .toggle-group {
          padding: 1.5rem;
          background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          transition: transform 0.2s, border-color 0.2s;
        }
        .toggle-group:hover {
          border-color: rgba(255,255,255,0.15);
        }
        .toggle-label {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 0.6rem;
          font-size: 1rem;
        }
        .toggle-label input {
          appearance: none;
          width: 44px;
          height: 24px;
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
          position: relative;
          cursor: pointer;
          transition: background 0.3s;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .toggle-label input::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          background: var(--text-muted);
          border-radius: 50%;
          transition: transform 0.3s, background 0.3s;
        }
        .toggle-label input:checked {
          background: var(--accent-color);
          border-color: var(--accent-color);
        }
        .toggle-label input:checked::after {
          transform: translateX(20px);
          background: var(--bg-color);
        }

        .form-actions {
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          justify-content: flex-end;
        }
        .form-actions button {
          font-size: 1.05rem;
          padding: 0.9rem 2.5rem;
          border-radius: 10px;
          font-weight: 700;
        }

        /* Status messages */
        .status-msg {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
          margin-top: 0.4rem;
          padding: 0.5rem 0.8rem;
          background: rgba(255,255,255,0.03);
          border-radius: 6px;
        }
        .status-msg.success { color: #34d399; border-left: 3px solid #34d399; }
        .status-msg.warning { color: #fbbf24; border-left: 3px solid #fbbf24; }
        .status-msg.error { color: #f87171; border-left: 3px solid #f87171; }

        /* File Upload Enhance */
        .file-upload-wrapper {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
        }
        .file-input-hidden {
          display: none;
        }
        .file-upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.8rem 1.4rem;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          color: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .file-upload-btn:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.3);
          transform: translateY(-1px);
        }
        .btn-remove {
          background: transparent;
          border: 1px solid rgba(248, 113, 113, 0.4);
          color: #f87171;
          padding: 0.8rem 1.2rem;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-remove:hover {
          background: rgba(248, 113, 113, 0.1);
          border-color: #f87171;
        }

        /* Whitelist UI Supercharged */
        /* ── Whitelist: Add Panel ── */
        .wl-add-panel {
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
        }
        .wl-add-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .wl-add-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.75rem 0.5rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
        }
        .wl-add-tab:hover { color: var(--text-main); background: rgba(255,255,255,0.03); }
        .wl-add-tab.active {
          color: var(--accent-color);
          border-bottom-color: var(--accent-color);
          background: rgba(252,163,17,0.05);
        }

        .wl-search-box {
          padding: 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .wl-search-input {
          width: 100%;
          padding: 0.65rem 1rem;
          border-radius: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          font-size: 0.9rem;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .wl-search-input:focus {
          outline: none;
          border-color: var(--accent-color);
          box-shadow: 0 0 0 3px rgba(252,163,17,0.12);
        }
        .wl-search-input::placeholder { color: var(--text-muted); }

        .wl-pick-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
          max-height: 220px;
          overflow-y: auto;
          padding: 0.5rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.15) transparent;
        }
        .wl-pick-list::-webkit-scrollbar { width: 5px; }
        .wl-pick-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }

        .wl-pick-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          width: 100%;
          padding: 0.6rem 0.8rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--text-main);
          font-size: 0.9rem;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s;
        }
        .wl-pick-item:hover { background: rgba(255,255,255,0.07); }
        .wl-pick-name { flex: 1; font-weight: 500; }
        .wl-pick-sub { color: var(--text-muted); font-size: 0.8rem; }
        .wl-pick-plus { color: var(--accent-color); opacity: 0.7; flex-shrink: 0; }
        .wl-pick-item:hover .wl-pick-plus { opacity: 1; }

        .wl-role-dot {
          width: 12px; height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
          display: inline-block;
        }

        .wl-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1.5rem;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .wl-manual-row {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem;
          align-items: center;
        }
        .wl-manual-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          font-size: 0.9rem;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .wl-manual-input:focus {
          outline: none;
          border-color: var(--accent-color);
          box-shadow: 0 0 0 3px rgba(252,163,17,0.12);
        }

        /* ── Whitelist: Added List Panel ── */
        .wl-added-panel {
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          background: rgba(0,0,0,0.15);
        }
        .wl-added-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: rgba(0,0,0,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .wl-count-badge {
          background: rgba(252,163,17,0.15);
          color: var(--accent-color);
          border-radius: 20px;
          padding: 0.15rem 0.6rem;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .wl-added-body {
          display: flex;
          flex-direction: column;
          gap: 0;
          max-height: 320px;
          overflow-y: auto;
          padding: 0.5rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.15) transparent;
        }
        .wl-added-body::-webkit-scrollbar { width: 5px; }
        .wl-added-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }

        .wl-group { margin-bottom: 0.5rem; }
        .wl-group-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .whitelist-container {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          max-height: 280px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }
        /* Custom Scrollbar for list */
        .whitelist-container::-webkit-scrollbar { width: 6px; }
        .whitelist-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        .whitelist-container::-webkit-scrollbar-track { background: transparent; }

        .whitelist-empty {
          text-align: center;
          padding: 2.5rem 1rem;
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
          color: var(--text-muted);
          border: 1px dashed rgba(255,255,255,0.15);
          font-weight: 500;
        }
        .whitelist-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.9rem 1.2rem;
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.2s;
        }
        .whitelist-item:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.1);
          transform: translateX(2px);
        }
        .whitelist-item code {
          color: #fff;
          font-size: 0.95rem;
          font-weight: 600;
        }
        .btn-remove-icon {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid transparent;
          color: #f87171;
          cursor: pointer;
          display: flex;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .btn-remove-icon:hover {
          background: rgba(248, 113, 113, 0.2);
          border-color: rgba(248, 113, 113, 0.4);
          transform: scale(1.1);
        }

        /* Modal / Cropper CSS */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .modal-content {
          width: 100%;
          max-width: 500px;
          background: var(--panel-color);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: rgba(0,0,0,0.3);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .modal-header h3 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 1.25rem;
          color: #fff;
        }
        .icon-btn {
          background: rgba(255,255,255,0.05);
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
