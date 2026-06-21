"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Loader2, Image as ImageIcon, Layout, Shield, X, Crop, Users, Copy, Lock, Home, Save, AlertTriangle, Swords, Crown } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useToast, ToastContainer } from "@/components/Toast";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";
import { supabase } from "@/utils/supabase";
import Logo from "@/components/Logo";

// Modular Components (These will be refactored to use new Bento grid classes)
import OverviewTab from "./components/OverviewTab";
import GeneralTab from "./components/GeneralTab";
import VisualTab from "./components/VisualTab";
import WhitelistTab from "./components/WhitelistTab";
import TemplateTab from "./components/TemplateTab";
import KillBoardTab from "./components/KillBoardTab";
import RegistrationTab from "./components/RegistrationTab";
import RoleMenuTab from "./components/RoleMenuTab";

function PremiumLock({ lang, t }) {
  return (
    <div className="glass-panel p-12 text-center border border-primary-container/30 bg-primary-container/5 relative overflow-hidden animate-slide-up flex flex-col items-center justify-center min-h-[400px]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary-container/10 rounded-full blur-[80px] pointer-events-none"></div>
      <Crown size={64} className="text-primary-container mb-6 animate-pulse" />
      <h2 className="font-headline-xl text-3xl text-on-surface mb-4 uppercase tracking-tight font-bold">
        {lang === 'tr' ? '👑 SUNUCU PREMİUM GEREKLİ' : '👑 GUILD PREMIUM REQUIRED'}
      </h2>
      <p className="font-body-lg text-on-surface-variant max-w-lg mb-8 leading-relaxed">
        {lang === 'tr' 
          ? 'Bu özellik sunucu bazlı Premium paket gerektirmektedir. Bireysel oylama muafiyeti (Individual) bu özelliği kapsamaz. Sunucu Premium satın alarak bu özelliği ve diğer gelişmiş özellikleri sunucunuzda aktifleştirebilirsiniz.'
          : 'This feature requires a server-level Guild Premium package. Individual vote bypass (Individual) does not cover this feature. Purchase Guild Premium to unlock this and other advanced features for your server.'}
      </p>
      <div className="flex gap-4">
        <a 
          href="https://veyronix.com.tr" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-8 py-3 bg-primary-container text-on-primary border border-primary-container rounded-sm font-label-bold uppercase tracking-widest text-sm transition-all hover:brightness-110 active:scale-95 tactical-glow"
        >
          {lang === 'tr' ? 'Satın Al / Web Sitesi' : 'Buy / Website'}
        </a>
      </div>
    </div>
  );
}

export default function ServerSettings() {
  const { data: session, status } = useSession();
  const { id: guildId } = useParams();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { toasts, showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [subscription, setSubscription] = useState(null);
  const isPremium = !!(subscription && (
    subscription.is_unlimited || 
    (subscription.trial_used === false && subscription.is_active && new Date(subscription.expires_at) > new Date())
  ));
  const [isOwner, setIsOwner] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [initialSettings, setInitialSettings] = useState(null);
  const [settings, setSettings] = useState({
    language: "tr",
    embed_thumbnail_url: "",
    whitelist: [],
    party_templates: [],
    albion_guild_id: "",
    albion_guild_name: "",
    albion_server: "Europe",
    killboard_channel_id: "",
    killboard_time: "06:00",
    registration_enabled: false,
    registration_channel_id: "",
    registration_staff_role_ids: "",
    registration_given_role_id: "",
    registration_given_role_id_2: "",
    registration_given_role_id_3: "",
    registration_unregistered_role_id: "",
    registration_log_channel_id: "",
    registration_welcome_channel_id: "",
    registration_welcome_message_text: "",
    auto_role_on_join_id: "",
    registration_category_id: "",
    registration_welcome_message: "",
  });
  
  const [guildSearchQuery, setGuildSearchQuery] = useState("");
  const [guildSearchResults, setGuildSearchResults] = useState([]);
  const [searchingGuild, setSearchingGuild] = useState(false);
  const [discordChannels, setDiscordChannels] = useState([]);
  const [triggeringKillBoard, setTriggeringKillBoard] = useState(false);
  const [killboardPreview, setKillboardPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [guildDetail, setGuildDetail] = useState(null);
  
  const [whitelistSearch, setWhitelistSearch] = useState("");
  const [whitelistAddTab, setWhitelistAddTab] = useState("roles");
  const [thumbError, setThumbError] = useState(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [discordRoles, setDiscordRoles] = useState([]);
  const [discordMembers, setDiscordMembers] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Cropper states
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`/api/guild-settings/${guildId}`);
      const data = await res.json();
      if (res.ok && data) {
        const { settings: s, subscription: sub, isOwner: ownerStatus } = data;
        setSubscription(sub);
        setIsOwner(ownerStatus);
        const loadedSettings = {
          language: s?.language || "tr",
          embed_thumbnail_url: s?.embed_thumbnail_url || "",
          whitelist: s?.whitelist || [],
          party_templates: s?.party_templates || [],
          albion_guild_id: s?.albion_guild_id || "",
          albion_guild_name: s?.albion_guild_name || "",
          albion_server: s?.albion_server || "Europe",
          killboard_channel_id: s?.killboard_channel_id || "",
          killboard_time: s?.killboard_time || "06:00",
          registration_enabled: s?.registration_enabled || false,
          registration_channel_id: s?.registration_channel_id || "",
          registration_staff_role_ids: s?.registration_staff_role_ids || "",
          registration_category_id: s?.registration_category_id || "",
          registration_welcome_message: s?.registration_welcome_message || "",
          registration_given_role_id: s?.registration_given_role_id || "",
          registration_given_role_id_2: s?.registration_given_role_id_2 || "",
          registration_given_role_id_3: s?.registration_given_role_id_3 || "",
          registration_unregistered_role_id: s?.registration_unregistered_role_id || "",
          registration_log_channel_id: s?.registration_log_channel_id || "",
          registration_welcome_channel_id: s?.registration_welcome_channel_id || "",
          registration_welcome_message_text: s?.registration_welcome_message_text || "",
          auto_role_on_join_id: s?.auto_role_on_join_id || "",
          auto_check_enabled: s?.auto_check_enabled || false,
          auto_check_interval: s?.auto_check_interval || 3,
          auto_check_custom_role_id: s?.auto_check_custom_role_id || "",
          auto_check_guild_tag: s?.auto_check_guild_tag || "",
          auto_check_log_channel_id: s?.auto_check_log_channel_id || "",
          registered_count: s?.registered_count || 0,
          is_syncing: s?.is_syncing || false,
          last_sync_result: s?.last_sync_result || null,
        };
        setSettings(loadedSettings);
        setInitialSettings(loadedSettings);
        if (s?.embed_thumbnail_url) {
           const img = new Image();
           img.onload = () => setThumbError(null);
           img.onerror = () => setThumbError("invalid");
           img.src = s.embed_thumbnail_url;
        }
      }
    } catch (err) { console.error(err); }
    finally { 
      setTimeout(() => setLoading(false), 800);
    }
  }, [guildId, session]);

  const fetchDiscordData = useCallback(async () => {
    try {
      const res = await fetch(`/api/discord/guilds/${guildId}/roles`);
      const data = await res.json();
      if (res.ok) {
        setDiscordRoles(data.roles || []);
        setDiscordMembers(data.members || []);
        setDiscordChannels(data.channels || []);
      }
    } catch (err) { console.error(err); }
  }, [guildId]);

  const searchGuilds = useCallback(async () => {
    if (guildSearchQuery.length < 3) return;
    setSearchingGuild(true);
    try {
      const res = await fetch(`/api/albion/search?q=${encodeURIComponent(guildSearchQuery)}&server=${encodeURIComponent(settings.albion_server || 'Europe')}`);
      const data = await res.json();
      setGuildSearchResults(data || []);
    } catch (err) { console.error(err); }
    finally { setSearchingGuild(false); }
  }, [guildSearchQuery, settings.albion_server]);

  useEffect(() => {
    setMounted(true);
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  const hasChanges = initialSettings && JSON.stringify(settings) !== JSON.stringify(initialSettings);

  useEffect(() => {
    if (!hasChanges) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  useEffect(() => {
    if (status === "authenticated" && guildId) {
      setTimeout(() => {
        setDiscordRoles([]);
        setDiscordMembers([]);
        fetchSettings();
        fetchDiscordData();
      }, 0);
    }
  }, [status, guildId, fetchSettings, fetchDiscordData]);

  useEffect(() => {
    if (!settings.albion_guild_id) { 
      setTimeout(() => setGuildDetail(null), 0);
      return; 
    }
    fetch(`/api/albion/guild/${settings.albion_guild_id}?server=${settings.albion_server || 'Europe'}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setGuildDetail(d); })
      .catch(() => setGuildDetail(null));
  }, [settings.albion_guild_id, settings.albion_server]);

  const handleSave = async () => {
    // Template validation
    if (settings.party_templates && settings.party_templates.length > 0) {
      for (const tpl of settings.party_templates) {
        if (!tpl.name || !tpl.name.trim()) {
          showToast(lang === "en" ? "Template name cannot be empty!" : "Şablon adı boş bırakılamaz!", "error");
          return;
        }
        const reqCount = (tpl.required_roles || []).filter(r => r && r.trim()).length;
        const optCount = (tpl.optional_roles || []).filter(r => r && r.trim()).length;
        if (reqCount + optCount === 0) {
          showToast(
            lang === "en" 
              ? `Template "${tpl.name}" must have at least one role!` 
              : `"${tpl.name}" şablonunda en az bir rol bulunmalıdır!`, 
            "error"
          );
          return;
        }
      }
    }

    if (!isPremium && settings.party_templates && settings.party_templates.length > 5) {
      showToast(
        lang === "en"
          ? "Freemium servers are limited to 5 templates. Please delete extra templates before saving."
          : "Freemium sunucular en fazla 5 şablon kaydedebilir. Lütfen fazla şablonları silin.",
        "error"
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/guild-settings/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setInitialSettings(settings);
        showToast(lang === "en" ? "Settings saved!" : "Ayarlar kaydedildi!", "success");
      }
      else throw new Error("Save failed");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerKillBoard = async () => {
    if (!settings.albion_guild_id || !settings.killboard_channel_id) {
      showToast(lang === "en" ? "Please set guild and channel first!" : "Önce lonca ve kanalı ayarlayın!", "error");
      return;
    }

    setTriggeringKillBoard(true);
    try {
      const res = await fetch(`/api/killboard/trigger/${guildId}`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Trigger failed");
      }
      
      showToast(lang === "en" ? "Triggering KillBoard... Please wait." : "KillBoard tetikleniyor... Lütfen bekleyin.", "success");

      let isDone = false;
      let attempts = 0;
      while (!isDone && attempts < 35) { // max ~70s wait
        await new Promise(r => setTimeout(r, 2000));
        const checkRes = await fetch(`/api/guild-settings/${guildId}`);
        if (checkRes.ok) {
           const checkData = await checkRes.json();
           if (checkData.settings && checkData.settings.trigger_killboard === false) {
              isDone = true;
           }
        }
        attempts++;
      }
      
      if (isDone) {
        showToast(lang === "en" ? "KillBoard posted successfully!" : "KillBoard başarıyla kanala gönderildi!", "success");
      } else {
        showToast(lang === "en" ? "Taking too long. Process continues in background." : "İşlem uzun sürdü, arka planda devam ediyor.", "warning");
      }

    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setTriggeringKillBoard(false);
    }
  };

  const handlePreviewKillBoard = async () => {
    if (!settings.albion_guild_id) {
      showToast("Önce bir lonca seçin!", "error");
      return;
    }
    setLoadingPreview(true);
    setKillboardPreview(null);
    try {
      const res = await fetch(`/api/killboard/preview/${settings.albion_guild_id}?server=${settings.albion_server || 'Europe'}`);
      const data = await res.json();
      if (res.ok) setKillboardPreview(data);
      else throw new Error(data.error || "Veri çekilemedi");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoadingPreview(false);
    }
  };

  const checkImage = (url) => {
    const img = new Image();
    img.onload = () => setThumbError(null);
    img.onerror = () => setThumbError("invalid");
    img.src = url;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageToCrop(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), []);

  const uploadCroppedImage = async () => {
    setUploadingThumb(true);
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const fileName = `${guildId}-thumbnail-${Date.now()}.png`;
      const { data, error } = await supabase.storage.from('guild-embeds').upload(fileName, croppedImage, { contentType: 'image/png', upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('guild-embeds').getPublicUrl(fileName);
      
      const newSettings = { ...settings, embed_thumbnail_url: publicUrl };
      setSettings(newSettings);
      setImageToCrop(null);
      
      const saveRes = await fetch(`/api/guild-settings/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });

      if (saveRes.ok) {
        showToast(lang === 'en' ? 'Logo updated & saved!' : 'Logo güncellendi ve kaydedildi!', 'success');
      } else {
        showToast(lang === 'en' ? 'Logo uploaded but save failed!' : 'Logo yüklendi ama kaydedilemedi!', 'warning');
      }
    } catch (err) {
      showToast("Upload failed: " + err.message, "error");
    } finally {
      setUploadingThumb(false);
    }
  };

  const removeWhitelistId = (id) => {
    setSettings(prev => ({ ...prev, whitelist: prev.whitelist.filter(item => item !== id) }));
  };

  const renderStatus = (err) => {
    if (!err) return null;
    return (
      <div className="statusMsg">
        <AlertTriangle size={18} />
        <span>{err === "invalid" ? (lang === "en" ? "Invalid image URL" : "Geçersiz görsel bağlantısı") : err}</span>
      </div>
    );
  };

  if (!mounted) return null;

  if (loading) return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary-container/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Simple Full Page Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Simple Pulsing Icon */}
        <div className="flex items-center justify-center text-primary-container animate-pulse drop-shadow-[0_0_20px_rgba(252,163,17,0.5)]">
          <Logo className="w-32 h-32" />
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h2 className="font-headline-md text-lg md:text-xl text-on-surface uppercase tracking-widest flex items-center justify-center gap-2">
            {lang === 'en' ? 'Summoning Server Data' : 'Sunucu Verileri Çağrılıyor'}
            <span className="flex gap-1 ml-1">
              <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
          </h2>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col pt-24 bg-background relative overflow-x-hidden" suppressHydrationWarning>
      <ToastContainer toasts={toasts} />
      
      {/* Floating Dock Navigation */}
      <div className="relative z-50 flex justify-center px-4 pt-12 pb-4 pointer-events-none">
        <nav className="flex items-center gap-2 bg-surface-container-high/80 backdrop-blur-xl border border-outline-variant p-2 rounded-full pointer-events-auto shadow-2xl overflow-x-auto max-w-full custom-scrollbar">
          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-full text-on-surface-variant font-label-bold text-sm transition-all hover:text-on-surface hover:bg-white/5 mr-4 border border-transparent">
             <ArrowLeft size={18} />
          </Link>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-full font-label-bold text-sm transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-primary-container text-on-primary tactical-glow border border-primary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border border-transparent'}`} onClick={() => setActiveTab('overview')}>
            <Home size={18} /> Overview
          </button>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-full font-label-bold text-sm transition-all whitespace-nowrap ${activeTab === 'general' ? 'bg-primary-container text-on-primary tactical-glow border border-primary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border border-transparent'}`} onClick={() => setActiveTab('general')}>
            <Layout size={18} /> General
          </button>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-full font-label-bold text-sm transition-all whitespace-nowrap ${activeTab === 'embed' ? 'bg-primary-container text-on-primary tactical-glow border border-primary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border border-transparent'}`} onClick={() => setActiveTab('embed')}>
            <ImageIcon size={18} /> Branding
          </button>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-full font-label-bold text-sm transition-all whitespace-nowrap ${activeTab === 'whitelist' ? 'bg-primary-container text-on-primary tactical-glow border border-primary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border border-transparent'}`} onClick={() => setActiveTab('whitelist')}>
            <Users size={18} /> Access
          </button>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-full font-label-bold text-sm transition-all whitespace-nowrap ${activeTab === 'templates' ? 'bg-primary-container text-on-primary tactical-glow border border-primary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border border-transparent'}`} onClick={() => setActiveTab('templates')}>
            <Copy size={18} /> Templates
          </button>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-full font-label-bold text-sm transition-all whitespace-nowrap ${activeTab === 'killboard' ? 'bg-primary-container text-on-primary tactical-glow border border-primary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border border-transparent'}`} onClick={() => setActiveTab('killboard')}>
            <Lock size={16} /> KillBoard <span className="bg-primary-container text-on-primary text-[10px] px-2 py-0.5 rounded font-black ml-1 uppercase tracking-widest">BETA</span>
          </button>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-full font-label-bold text-sm transition-all whitespace-nowrap ${activeTab === 'registration' ? 'bg-primary-container text-on-primary tactical-glow border border-primary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border border-transparent'}`} onClick={() => setActiveTab('registration')}>
            <Users size={16} /> Reg <span className="bg-primary-container text-on-primary text-[10px] px-2 py-0.5 rounded font-black ml-1 uppercase tracking-widest">BETA</span>
          </button>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-full font-label-bold text-sm transition-all whitespace-nowrap ${activeTab === 'rolemenu' ? 'bg-primary-container text-on-primary tactical-glow border border-primary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5 border border-transparent'}`} onClick={() => setActiveTab('rolemenu')}>
            <Users size={16} /> Roles
          </button>
        </nav>
      </div>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-10 pb-32 flex flex-col">
        <header className="flex flex-col md:flex-row items-center md:items-end justify-between mb-12 pb-8 border-b border-outline-variant/50">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-24 h-24 rounded-2xl bg-surface border border-outline-variant flex items-center justify-center text-3xl font-headline-xl text-primary-container shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              {guildDetail?.Name?.charAt(0) || guildId.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-headline-xl text-3xl md:text-5xl text-on-surface mb-2 uppercase tracking-tight">{guildDetail?.Name || 'Server Settings'}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-on-surface-variant font-label-bold uppercase tracking-widest text-sm">
                 <Shield size={16} className="text-primary-container" /> Administrator Access
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content Rendering with Bento Grids */}
        {activeTab === 'overview' && <OverviewTab t={t} lang={lang} subscription={subscription} setActiveTab={setActiveTab} showToast={showToast} settings={settings} />}
        
        {activeTab === 'general' && (
          <GeneralTab t={t} settings={settings} setSettings={setSettings} discordChannels={discordChannels} handleSave={handleSave} saving={saving} guildSearchQuery={guildSearchQuery} setGuildSearchQuery={setGuildSearchQuery} searchGuilds={searchGuilds} searchingGuild={searchingGuild} guildSearchResults={guildSearchResults} setGuildSearchResults={setGuildSearchResults} guildDetail={guildDetail} setGuildDetail={setGuildDetail} isOwner={isOwner} discordMembers={discordMembers} guildId={guildId} subscription={subscription} showToast={showToast} />
        )}

        {activeTab === 'embed' && (
          isPremium ? (
            <VisualTab t={t} settings={settings} setSettings={setSettings} uploadingThumb={uploadingThumb} checkImage={checkImage} handleFileSelect={handleFileSelect} thumbError={thumbError} renderStatus={renderStatus} handleSave={handleSave} saving={saving} />
          ) : (
            <PremiumLock lang={lang} t={t} />
          )
        )}

        {activeTab === 'whitelist' && (
          <WhitelistTab t={t} settings={settings} setSettings={setSettings} whitelistAddTab={whitelistAddTab} setWhitelistAddTab={setWhitelistAddTab} searchQuery={whitelistSearch} setSearchQuery={setWhitelistSearch} discordRoles={discordRoles} discordMembers={discordMembers} removeWhitelistId={removeWhitelistId} handleSave={handleSave} saving={saving} />
        )}

        {activeTab === 'templates' && (
          <TemplateTab t={t} lang={lang} settings={settings} setSettings={setSettings} selectedTemplateId={selectedTemplateId} setSelectedTemplateId={setSelectedTemplateId} handleSave={handleSave} saving={saving} isPremium={isPremium} showToast={showToast} />
        )}

        {activeTab === 'killboard' && (
          isPremium ? (
            <KillBoardTab t={t} lang={lang} settings={settings} setSettings={setSettings} discordChannels={discordChannels} guildSearchQuery={guildSearchQuery} setGuildSearchQuery={setGuildSearchQuery} searchGuilds={searchGuilds} searchingGuild={searchingGuild} guildSearchResults={guildSearchResults} setGuildSearchResults={setGuildSearchResults} guildDetail={guildDetail} setGuildDetail={setGuildDetail} killboardPreview={killboardPreview} loadingPreview={loadingPreview} handlePreviewKillBoard={handlePreviewKillBoard} handleTriggerKillBoard={handleTriggerKillBoard} triggeringKillBoard={triggeringKillBoard} handleSave={handleSave} saving={saving} setActiveTab={setActiveTab} />
          ) : (
            <PremiumLock lang={lang} t={t} />
          )
        )}

        {activeTab === 'registration' && (
          <RegistrationTab t={t} lang={lang} settings={settings} setSettings={setSettings} discordChannels={discordChannels} discordRoles={discordRoles} handleSave={handleSave} saving={saving} guildId={guildId} registeredCount={settings.registered_count || 0} setActiveTab={setActiveTab} isPremium={isPremium} />
        )}

        {activeTab === 'rolemenu' && (
          <RoleMenuTab t={t} lang={lang} guildId={guildId} discordChannels={discordChannels} discordRoles={discordRoles} showToast={showToast} />
        )}

      </main>



      {/* Unsaved Changes Banner */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface-container-highest/95 border-t border-primary-container p-4 md:p-6 z-[1000] flex flex-col md:flex-row justify-center items-center gap-4 md:gap-12 backdrop-blur-xl animate-slide-up shadow-[0_-10px_40px_rgba(255,215,0,0.1)]">
          <div className="text-on-surface font-label-bold text-sm md:text-lg flex items-center gap-2 md:gap-3 uppercase tracking-widest text-center">
             <AlertTriangle size={20} className="text-primary-container hidden md:block" />
             {lang === 'en' ? 'You have unsaved changes!' : 'Kaydedilmemiş değişiklikleriniz var!'}
          </div>
          <div className="flex gap-2 md:gap-4 w-full md:w-auto">
            <button onClick={() => setSettings(initialSettings)} className="flex-1 md:flex-none px-4 md:px-8 py-3 md:py-3 bg-transparent border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-outline rounded-sm font-label-bold text-xs md:text-sm uppercase tracking-widest transition-all text-center">
              {lang === 'en' ? 'Discard' : 'İptal Et'}
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 md:flex-none px-4 md:px-8 py-3 md:py-3 bg-primary-container text-on-primary border border-primary-container rounded-sm font-label-bold text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95 tactical-glow disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {lang === 'en' ? 'Save Changes' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}

      {imageToCrop && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-8">
           <div className="glass-panel max-w-[600px] w-full p-8 border border-primary-container relative">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-right from-transparent via-primary-container to-transparent opacity-50"></div>
              <h2 className="font-headline-lg text-2xl text-on-surface mb-6 flex items-center gap-3 uppercase tracking-tight"><Crop size={24} className="text-primary-container"/> Crop Logo</h2>
              <div className="h-[400px] relative bg-black rounded-sm overflow-hidden mb-8 border border-outline-variant">
                 <Cropper image={imageToCrop} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
              </div>
              <div className="flex justify-end gap-4">
                 <button className="px-6 py-3 bg-transparent border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-outline transition-colors font-label-bold uppercase tracking-widest rounded-sm" onClick={() => setImageToCrop(null)}>Cancel</button>
                 <button className="px-6 py-3 bg-primary-container text-on-primary font-label-bold uppercase tracking-widest tactical-glow rounded-sm transition-all hover:brightness-110 disabled:opacity-50" onClick={uploadCroppedImage} disabled={uploadingThumb}>Apply & Upload</button>
              </div>
           </div>
        </div>
      )}

      <style jsx global>{`
        body { background-color: #000 !important; background-image: none !important; }
      `}</style>
    </div>
  );
}
