"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Loader2, Image as ImageIcon, Layout, Shield, X, Crop, Users, Copy, Lock, Home, Save } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useToast, ToastContainer } from "@/components/Toast";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";
import { supabase } from "@/utils/supabase";
import "./server-dashboard.css";

// Modular Components (These will be refactored to use new Bento grid classes)
import OverviewTab from "./components/OverviewTab";
import GeneralTab from "./components/GeneralTab";
import VisualTab from "./components/VisualTab";
import WhitelistTab from "./components/WhitelistTab";
import TemplateTab from "./components/TemplateTab";
import KillBoardTab from "./components/KillBoardTab";
import RegistrationTab from "./components/RegistrationTab";

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
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [settings, setSettings] = useState({
    language: "tr",
    embed_thumbnail_url: "",
    whitelist: [],
    party_templates: [],
    albion_guild_id: "",
    albion_guild_name: "",
    killboard_channel_id: "",
    killboard_time: "06:00",
    registration_enabled: false,
    registration_channel_id: "",
    registration_staff_role_ids: "",
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
        const { settings: s, subscription: sub } = data;
        setSubscription(sub);
        if (s) {
          setSettings({
            language: s.language || "tr",
            embed_thumbnail_url: s.embed_thumbnail_url || "",
            whitelist: s.whitelist || [],
            party_templates: s.party_templates || [],
            albion_guild_id: s.albion_guild_id || "",
            albion_guild_name: s.albion_guild_name || "",
            killboard_channel_id: s.killboard_channel_id || "",
            killboard_time: s.killboard_time || "06:00",
            registration_enabled: s.registration_enabled || false,
            registration_channel_id: s.registration_channel_id || "",
            registration_staff_role_ids: s.registration_staff_role_ids || "",
            registration_category_id: s.registration_category_id || "",
            registration_welcome_message: s.registration_welcome_message || "",
          });
          if (s.embed_thumbnail_url) {
             const img = new Image();
             img.onload = () => setThumbError(null);
             img.onerror = () => setThumbError("invalid");
             img.src = s.embed_thumbnail_url;
          }
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [guildId]);

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
      const res = await fetch(`/api/albion/search?q=${encodeURIComponent(guildSearchQuery)}`);
      const data = await res.json();
      setGuildSearchResults(data || []);
    } catch (err) { console.error(err); }
    finally { setSearchingGuild(false); }
  }, [guildSearchQuery]);

  useEffect(() => {
    setMounted(true);
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

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
    fetch(`/api/albion/guild/${settings.albion_guild_id}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setGuildDetail(d); })
      .catch(() => setGuildDetail(null));
  }, [settings.albion_guild_id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/guild-settings/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) showToast(lang === "en" ? "Settings saved!" : "Ayarlar kaydedildi!", "success");
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
      if (res.ok) {
        showToast(lang === "en" ? "KillBoard triggered successfully!" : "KillBoard başarıyla tetiklendi!", "success");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Trigger failed");
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
      const res = await fetch(`/api/killboard/preview/${settings.albion_guild_id}`);
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
    <div className="appWrapper" style={{justifyContent: 'center', alignItems: 'center'}}>
       <Loader2 size={40} className="spin" color="#fff" />
    </div>
  );

  return (
    <div className="appWrapper" suppressHydrationWarning>
      <ToastContainer toasts={toasts} />
      
      {/* Floating Dock Navigation */}
      <div className="topDockWrapper">
        <nav className="topDock">
          <Link href="/dashboard" className="dockItem" style={{marginRight: '1rem'}}>
             <ArrowLeft size={18} />
          </Link>
          <button className={`dockItem ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <Home size={18} /> Overview
          </button>
          <button className={`dockItem ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
            <Layout size={18} /> General
          </button>
          <button className={`dockItem ${activeTab === 'embed' ? 'active' : ''}`} onClick={() => setActiveTab('embed')}>
            <ImageIcon size={18} /> Branding
          </button>
          <button className={`dockItem ${activeTab === 'whitelist' ? 'active' : ''}`} onClick={() => setActiveTab('whitelist')}>
            <Users size={18} /> Access
          </button>
          <button className={`dockItem ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
            <Copy size={18} /> Templates
          </button>
          <button className={`dockItem ${activeTab === 'killboard' ? 'active' : ''}`} onClick={() => setActiveTab('killboard')}>
            <Lock size={16} /> KillBoard <span className="proBadge" style={{ background: 'var(--accent-color)', color: '#000' }}>BETA</span>
          </button>
          <button className={`dockItem ${activeTab === 'registration' ? 'active' : ''}`} onClick={() => setActiveTab('registration')}>
            <Users size={16} /> Reg <span className="proBadge" style={{ background: 'var(--accent-color)', color: '#000' }}>BETA</span>
          </button>
        </nav>
      </div>

      <main className="appMain">
        <header className="heroHeader">
          <div className="heroInfo">
            <div className="heroAvatar">
              {guildDetail?.Name?.charAt(0) || guildId.charAt(0).toUpperCase()}
            </div>
            <div className="heroText">
              <h1>{guildDetail?.Name || 'Server Settings'}</h1>
              <div className="heroBadge">
                 <Shield size={16} /> Administrator Access
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content Rendering with Bento Grids */}
        {activeTab === 'overview' && <OverviewTab t={t} subscription={subscription} setActiveTab={setActiveTab} showToast={showToast} />}
        
        {activeTab === 'general' && (
          <GeneralTab t={t} settings={settings} setSettings={setSettings} discordChannels={discordChannels} handleSave={handleSave} saving={saving} />
        )}

        {activeTab === 'embed' && (
          <VisualTab t={t} settings={settings} setSettings={setSettings} uploadingThumb={uploadingThumb} checkImage={checkImage} handleFileSelect={handleFileSelect} thumbError={thumbError} renderStatus={renderStatus} handleSave={handleSave} saving={saving} />
        )}

        {activeTab === 'whitelist' && (
          <WhitelistTab t={t} settings={settings} setSettings={setSettings} whitelistAddTab={whitelistAddTab} setWhitelistAddTab={setWhitelistAddTab} searchQuery={whitelistSearch} setSearchQuery={setWhitelistSearch} discordRoles={discordRoles} discordMembers={discordMembers} removeWhitelistId={removeWhitelistId} handleSave={handleSave} saving={saving} />
        )}

        {activeTab === 'templates' && (
          <TemplateTab t={t} lang={lang} settings={settings} setSettings={setSettings} selectedTemplateId={selectedTemplateId} setSelectedTemplateId={setSelectedTemplateId} handleSave={handleSave} saving={saving} />
        )}

        {activeTab === 'killboard' && (
          <KillBoardTab t={t} lang={lang} settings={settings} setSettings={setSettings} discordChannels={discordChannels} guildSearchQuery={guildSearchQuery} setGuildSearchQuery={setGuildSearchQuery} searchGuilds={searchGuilds} searchingGuild={searchingGuild} guildSearchResults={guildSearchResults} setGuildSearchResults={setGuildSearchResults} guildDetail={guildDetail} setGuildDetail={setGuildDetail} killboardPreview={killboardPreview} loadingPreview={loadingPreview} handlePreviewKillBoard={handlePreviewKillBoard} handleTriggerKillBoard={handleTriggerKillBoard} triggeringKillBoard={triggeringKillBoard} handleSave={handleSave} saving={saving} />
        )}

        {activeTab === 'registration' && (
          <RegistrationTab t={t} lang={lang} settings={settings} setSettings={setSettings} discordChannels={discordChannels} discordRoles={discordRoles} handleSave={handleSave} saving={saving} />
        )}

      </main>

      {/* Floating Action Button for Saving (Replaces the SaveButton component) */}
      <button className="floatingSave" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="spin" size={20} /> : <Save size={20} />}
        {saving ? "Saving..." : "Save Changes"}
      </button>

      {imageToCrop && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'}}>
           <div className="bentoBox span6" style={{maxWidth: '600px', width: '100%', padding: '2rem'}}>
              <h2 className="bentoTitle"><Crop size={22}/> Crop Logo</h2>
              <div style={{height: '400px', position: 'relative', background: '#000', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem'}}>
                 <Cropper image={imageToCrop} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
                 <button className="dockItem" onClick={() => setImageToCrop(null)} style={{width: 'auto', background: 'rgba(255,255,255,0.05)'}}>Cancel</button>
                 <button className="floatingSave" style={{position: 'relative', bottom: 'auto', right: 'auto'}} onClick={uploadCroppedImage} disabled={uploadingThumb}>Apply & Upload</button>
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
