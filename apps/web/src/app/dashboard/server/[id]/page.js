"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeft, Loader2, Image as ImageIcon, Layout, Shield, X, Crop, Users, Copy, Lock, Home, Save, AlertTriangle, Swords, Crown, Gift, FileText, Crosshair, UserPlus, Sparkles, Headphones, ChevronDown, Skull } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useToast, ToastContainer } from "@/components/Toast";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";
import { supabase } from '@veyronix/database';
import Logo from "@/components/Logo";

import DropTab from "./components/DropTab";

// Modular Components (These will be refactored to use new Bento grid classes)
import OverviewTab from "./components/OverviewTab";
import GeneralTab from "./components/GeneralTab";
import VisualTab from "./components/VisualTab";
import LogSettingsTab from "./components/LogSettingsTab";
import TemplateTab from "./components/TemplateTab";
import KillBoardTab from "./components/KillBoardTab";
import RegistrationTab from "./components/RegistrationTab";
import RoleMenuTab from "./components/RoleMenuTab";
import TicketTab from "./components/TicketTab";
import TicketHistoryTab from "./components/TicketHistoryTab";
import EventsHub from "./components/EventsHub";
import TempVoiceTab from "./components/TempVoiceTab";
import KillboardTab from "./components/KillBoardTab";

function PremiumLock({ lang, t }) {
  return (
    <div className="glass-panel p-3 text-center border border-primary-container/30 bg-primary-container/5 relative overflow-hidden animate-slide-up flex flex-col items-center justify-center min-h-[400px]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary-container/10 rounded-full blur-[80px] pointer-events-none"></div>
      <Crown size={64} className="text-primary-container mb-3 animate-pulse" />
      <h2 className="font-headline-xl text-[10px] text-on-surface mb-2 uppercase tracking-tight font-bold">
        {lang === 'tr' ? '👑 SUNUCU PREMİUM GEREKLİ' : '👑 GUILD PREMIUM REQUIRED'}
      </h2>
      <p className="font-body-lg text-on-surface-variant max-w-lg mb-2 leading-relaxed">
        {lang === 'tr' 
          ? 'Bu özellik sunucu bazlı Premium paket gerektirmektedir. Bireysel oylama muafiyeti (Individual) bu özelliği kapsamaz. Sunucu Premium satın alarak bu özelliği ve diğer gelişmiş özellikleri sunucunuzda aktifleştirebilirsiniz.'
          : 'This feature requires a server-level Guild Premium package. Individual vote bypass (Individual) does not cover this feature. Purchase Guild Premium to unlock this and other advanced features for your server.'}
      </p>
      <div className="flex gap-2">
        <a 
          href="https://veyronix.com.tr" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-2 py-1.5 bg-primary-container text-on-primary border border-primary-container rounded-sm font-label-bold uppercase tracking-widest text-[10px] transition-all hover:brightness-110 active:scale-95 tactical-glow"
        >
          {lang === 'tr' ? 'Satın Al / Web Sitesi' : 'Buy / Website'}
        </a>
      </div>
    </div>
  );
}

export default function ServerSettings() {
  const { data: session, status } = useSession();
  const params = useParams();
  const guildId = params.id ? (params.id.includes('-') ? params.id.split('-').pop() : params.id) : null;
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { toasts, showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const toggleCategory = (key) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const [subscription, setSubscription] = useState(null);
  const isPremium = !!(subscription && (
    subscription.is_unlimited || 
    (subscription.trial_used === false && subscription.is_active && new Date(subscription.expires_at) > new Date())
  ));
  const [isOwner, setIsOwner] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  
  // Drop Settings State
  const [dropSettings, setDropSettings] = useState({
    is_enabled: false,
    channel_ids: [],
    schedule_type: 'exact_minutes',
    exact_minutes: [],
    hourly_chance_pct: 25,
    random_interval_min: 30,
    random_interval_max: 120,
    drop_chance: 'medium',
    custom_chance_pct: 15,
    cooldown_minutes: 15,
    reward_type: 'coin',
    reward_amount: 100,
    reward_role_id: null,
    silence_threshold_min: 15,
    burst_threshold_msg: 30,
    burst_window_sec: 180,
  });
  const [initialDropSettings, setInitialDropSettings] = useState(null);

  const [initialSettings, setInitialSettings] = useState(null);
  const [settings, setSettings] = useState({
    language: "tr",
    embed_thumbnail_url: "",
    log_system_enabled: false,
    log_channel_id: "",
    log_exempts: "",
    log_events: {
      message_delete: true,
      message_edit: true,
      channel_create: true,
      channel_delete: true,
      bot_add: true,
      member_ban: true
    },
    party_templates: [],
    albion_guild_id: "",
    albion_guild_name: "",
    albion_server: "Europe",
    registration_enabled: false,
    registration_channel_id: "",
    registration_staff_role_ids: "",
    registration_given_role_id: "",
    registration_given_role_id_2: "",
    registration_given_role_id_3: "",
    registration_given_role_id_4: "",
    registration_given_role_id_5: "",
    registration_guest_role_duration: 7,
    registration_unregistered_role_id: "",
    registration_log_channel_id: "",
    registration_welcome_channel_id: "",
    registration_welcome_message_text: "",
    auto_role_on_join_id: "",
    registration_category_id: "",
    registration_welcome_message: "",
    system_mode: "command",
    fixed_message_channel_id: "",
    target_category_id: "",
    channel_name_format: "name_title",
    fixed_message_content: "",
    ticket_system_enabled: false,
    ticket_category_id: "",
    ticket_channel_id: "",
    ticket_staff_roles: "",
    ticket_message_title: "Destek Talebi",
    ticket_message_desc: "Lütfen aşağıdaki menüden bir konu seçerek destek talebinizi oluşturun.",
    ticket_options: [{"label": "Genel Destek", "value": "genel", "description": "Genel konular hakkında destek alın", "emoji": "📩"}],
    application_enabled: false,
    registration_rules_text: "",
    application_questions: [],
    tempvoice_creators: [],
    content_close_roles: "",
    killboard_kill_channel_id: "",
    killboard_death_channel_id: "",
  });
  
  const [guildSearchQuery, setGuildSearchQuery] = useState("");
  const [guildSearchResults, setGuildSearchResults] = useState([]);
  const [searchingGuild, setSearchingGuild] = useState(false);
  const [discordChannels, setDiscordChannels] = useState([]);

  const [guildDetail, setGuildDetail] = useState(null);
  const [albionGuildDetail, setAlbionGuildDetail] = useState(null);
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
        if (sub?.guild_name) {
          setGuildDetail(prev => ({
            ...(prev || {}),
            name: prev?.name || sub.guild_name,
            id: guildId
          }));
        }

        if (s?.albion_guild_id) {
          setAlbionGuildDetail({
            Id: s.albion_guild_id,
            Name: s.albion_guild_name || 'Unknown Guild',
            Server: s.albion_server || 'Europe'
          });
        }

        const loadedSettings = {
          language: s?.language || "tr",
          embed_thumbnail_url: s?.embed_thumbnail_url || "",
          log_system_enabled: s?.log_system_enabled === true || s?.log_system_enabled === 'true',
          log_channel_id: s?.log_channel_id || "",
          log_events: {
            message_delete: true, message_edit: true, channel_create: true, channel_delete: true, bot_add: true, member_ban: true,
            ...(typeof s?.log_events === 'string' && s.log_events !== '[object Object]' ? JSON.parse(s.log_events) : (s?.log_events || {}))
          },
          log_exempts: (() => {
            let ev = s?.log_events;
            if (typeof ev === 'string' && ev !== '[object Object]') {
                try { ev = JSON.parse(ev); } catch(e) { ev = {}; }
            }
            return (ev && ev.exempts) ? ev.exempts : "";
          })(),
          party_templates: s?.party_templates || [],
          albion_guild_id: s?.albion_guild_id || "",
          albion_guild_name: s?.albion_guild_name || "",
          albion_server: s?.albion_server || "Europe",
          registration_enabled: s?.registration_enabled || false,
          registration_channel_id: s?.registration_channel_id || "",
          registration_staff_role_ids: s?.registration_staff_role_ids || "",
          registration_category_id: s?.registration_category_id || "",
          registration_welcome_message: s?.registration_welcome_message || "",
          registration_given_role_id: s?.registration_given_role_id || "",
          registration_given_role_id_2: s?.registration_given_role_id_2 || "",
          registration_given_role_id_3: s?.registration_given_role_id_3 || "",
          registration_given_role_id_4: s?.registration_given_role_id_4 || "",
          registration_given_role_id_5: s?.registration_given_role_id_5 || "",
          registration_guest_role_duration: s?.registration_guest_role_duration || 7,
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
          system_mode: s?.system_mode || "command",
          fixed_message_channel_id: s?.fixed_message_channel_id || "",
          target_category_id: s?.target_category_id || "",
          channel_name_format: s?.channel_name_format || "name_title",
          fixed_message_content: s?.fixed_message_content || "",
          ticket_system_enabled: s?.ticket_system_enabled === true || s?.ticket_system_enabled === 'true',
          ticket_category_id: s?.ticket_category_id || "",
          ticket_channel_id: s?.ticket_channel_id || "",
          ticket_staff_roles: s?.ticket_staff_roles || "",
          ticket_message_title: s?.ticket_message_title || "Destek Talebi",
          ticket_message_desc: s?.ticket_message_desc || "Lütfen aşağıdaki menüden bir konu seçerek destek talebinizi oluşturun.",
          ticket_options: Array.isArray(s?.ticket_options) ? s?.ticket_options : [{"label": "Genel Destek", "value": "genel", "description": "Genel konular hakkında destek alın", "emoji": "📩"}],
          content_close_roles: typeof s?.content_close_roles === 'string' ? s.content_close_roles : (s?.content_close_roles ? JSON.stringify(s.content_close_roles) : ""),
          auto_delete_party_hours: (() => {
            let ev = s?.log_events;
            if (typeof ev === 'string' && ev !== '[object Object]') {
                try { ev = JSON.parse(ev); } catch(e) { ev = {}; }
            }
            return (ev && ev.auto_delete_party_hours) ? ev.auto_delete_party_hours : 0;
          })(),
          application_enabled: s?.application_enabled === true || s?.application_enabled === 'true',
          registration_rules_text: s?.registration_rules_text || "",
          application_questions: Array.isArray(s?.application_questions) ? s.application_questions : [],
          registration_rules_text_en: (() => {
            let ev = s?.log_events;
            if (typeof ev === 'string' && ev !== '[object Object]') {
                try { ev = JSON.parse(ev); } catch(e) { ev = {}; }
            }
            return (ev && ev.registration_rules_text_en) ? ev.registration_rules_text_en : "";
          })(),
          registration_button_type: (() => {
            let ev = s?.log_events;
            if (typeof ev === 'string' && ev !== '[object Object]') {
                try { ev = JSON.parse(ev); } catch(e) { ev = {}; }
            }
            return (ev && ev.registration_button_type) ? ev.registration_button_type : 'both';
          })(),
          killboard_kill_channel_id: s?.killboard_kill_channel_id || "",
          killboard_death_channel_id: s?.killboard_death_channel_id || "",
          tempvoice_creators: Array.isArray(s?.tempvoice_creators) ? s.tempvoice_creators : [],
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

      // Fetch Drop Settings
      const dropRes = await fetch(`/api/drop-settings/${guildId}`);
      if (dropRes.ok) {
        const dropData = await dropRes.json();
        if (dropData.settings) {
          setDropSettings(dropData.settings);
          setInitialDropSettings(dropData.settings);
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
        if (data.guild) {
          setGuildDetail(data.guild);
        }
      }
    } catch (err) { console.error(err); }
  }, [guildId]);

  const searchGuilds = useCallback(async () => {
    if (guildSearchQuery.length < 3) return;
    setSearchingGuild(true);
    try {
      const res = await fetch(`/api/albion/search?q=${encodeURIComponent(guildSearchQuery)}&server=${encodeURIComponent(settings.albion_server || 'Europe')}`);
      const data = await res.json();
      setGuildSearchResults(data?.guilds || []);
    } catch (err) { console.error(err); }
    finally { setSearchingGuild(false); }
  }, [guildSearchQuery, settings.albion_server]);

  useEffect(() => {
    setMounted(true);
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  const hasChanges = (initialSettings && JSON.stringify(settings) !== JSON.stringify(initialSettings)) ||
                     (initialDropSettings && JSON.stringify(dropSettings) !== JSON.stringify(initialDropSettings));

  useEffect(() => {
    if (!hasChanges) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  const loadedGuildIdRef = useRef(null);

  useEffect(() => {
    if (status === "authenticated" && guildId && loadedGuildIdRef.current !== guildId) {
      loadedGuildIdRef.current = guildId;
      setDiscordRoles([]);
      setDiscordMembers([]);
      fetchSettings();
      fetchDiscordData();
    }
  }, [status, guildId, fetchSettings, fetchDiscordData]);

  useEffect(() => {
    if (!settings.albion_guild_id) { 
      setTimeout(() => setAlbionGuildDetail(null), 0);
      return; 
    }
    fetch(`/api/albion/guild/${settings.albion_guild_id}?server=${settings.albion_server || 'Europe'}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setAlbionGuildDetail(d); })
      .catch(err => console.error("Albion API fetch error:", err));
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
      
      const dropRes = await fetch(`/api/drop-settings/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dropSettings),
      });

      if (res.ok && dropRes.ok) {
        setInitialSettings(settings);
        setInitialDropSettings(dropSettings);
        showToast(lang === "en" ? "Settings saved!" : "Ayarlar kaydedildi!", "success");
      }
      else throw new Error("Save failed");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
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

      if (saveRes.ok) showToast(lang === 'tr' ? "Görsel güncellendi!" : "Thumbnail updated!", "success");
      else throw new Error("Upload failed");
    } catch (err) {
      showToast(lang === 'tr' ? "Görsel yüklenirken hata oluştu" : "Upload failed", "error");
    } finally {
      setUploadingThumb(false);
    }
  };

  const renderStatus = (err) => {
    if (!err) return null;
    return (
      <div className="statusMsg">
        <AlertTriangle size={14} />
        <span>{err === "invalid" ? (lang === "en" ? "Invalid image URL" : "Geçersiz görsel bağlantısı") : err}</span>
      </div>
    );
  };

  if (!mounted || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-container/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="flex flex-col items-center gap-6 z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-container/20 blur-xl rounded-full"></div>
            <Logo width={64} height={64} className="text-primary-container animate-pulse-slow relative z-10" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-5 h-5 text-on-surface-variant animate-spin" />
            <span className="text-on-surface-variant text-sm font-label-bold uppercase tracking-widest animate-pulse">Loading Workspace</span>
          </div>
        </div>
      </div>
    );
  }

  const navGroups = [
    {
      id: 'general_group',
      category: lang === 'tr' ? 'GENEL YÖNETİM' : 'GENERAL',
      items: [
        { id: 'overview', label: lang === 'tr' ? 'Genel Bakış' : 'Overview', icon: Home },
        { id: 'general', label: lang === 'tr' ? 'Temel Ayarlar' : 'Settings', icon: Layout },
        { id: 'embed', label: lang === 'tr' ? 'Görsel & Marka' : 'Branding', icon: ImageIcon },
      ]
    },
    {
      id: 'albion_group',
      category: lang === 'tr' ? 'ALBION & SES' : 'ALBION & VOICE',
      items: [
        { id: 'tempvoice', label: 'VoiceForge', icon: Headphones, isBeta: true },
        { id: 'killboard', label: 'Killboard', icon: Skull, isBeta: false },
        { id: 'templates', label: lang === 'tr' ? 'Parti Şablonları' : 'Party Templates', icon: Copy },
        { id: 'events', label: lang === 'tr' ? 'Etkinlikler' : 'Events', icon: Sparkles },
      ]
    },
    {
      id: 'community_group',
      category: lang === 'tr' ? 'TOPLULUK & GÜVENLİK' : 'COMMUNITY',
      items: [
        { id: 'registration', label: lang === 'tr' ? 'Kayıt & Rol' : 'Registration', icon: UserPlus },
        { id: 'rolemenu', label: lang === 'tr' ? 'Rol Menüleri' : 'Role Menus', icon: Users },
        { id: 'ticket', label: lang === 'tr' ? 'Ticket & Destek' : 'Ticket System', icon: Shield },
        { id: 'log', label: lang === 'tr' ? 'Denetim Logları' : 'Audit Logs', icon: FileText },
      ]
    }
  ];

  const allNavItems = navGroups.flatMap((g) => g.items);

  return (
    <div className="flex bg-background relative w-full h-[calc(100vh-56px)] overflow-hidden" suppressHydrationWarning>
      <ToastContainer toasts={toasts} />
      
      {/* Desktop / Tablet Vertical Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-[56px] h-[calc(100vh-56px)] z-30 md:w-60 bg-[#081425]/95 backdrop-blur-2xl border-r border-outline-variant/30 flex-col justify-between overflow-y-auto custom-scrollbar shadow-2xl transition-all duration-300">
        <div className="flex flex-col p-3 gap-4">
          
          {/* Back Button & Server Identity */}
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 border border-outline-variant/30 transition-all text-xs font-label-bold"
              title={lang === 'tr' ? 'Panellere Dön' : 'Back to Dashboard'}
            >
              <ArrowLeft size={16} className="shrink-0 text-primary-container" />
              <span className="truncate">{lang === 'tr' ? 'Panellere Dön' : 'Dashboard'}</span>
            </Link>

            {/* Current Server Mini Card */}
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-container/60 border border-outline-variant/20">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-surface-container-high border border-outline-variant/40 flex items-center justify-center font-bold text-xs text-primary-container shrink-0 uppercase">
                {guildDetail?.icon ? (
                  <img src={guildDetail.icon} alt={guildDetail?.name || "Icon"} className="w-full h-full object-cover" />
                ) : (
                  (guildDetail?.name || guildDetail?.Name || guildId).charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-headline-md text-xs font-bold text-on-surface truncate" title={guildDetail?.name || guildDetail?.Name || guildId}>
                  {guildDetail?.name || guildDetail?.Name || guildId}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-primary-container font-label-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {isPremium ? (lang === 'tr' ? 'Premium Aktif' : 'Premium Active') : 'Freemium'}
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-outline-variant/20 w-full"></div>

          {/* Categorized Navigation Groups */}
          {navGroups.map((group) => {
            const isCollapsed = !!collapsedCategories[group.id];
            return (
              <div key={group.id} className="flex flex-col gap-1">
                {/* Collapsible Accordion Header */}
                <button
                  onClick={() => toggleCategory(group.id)}
                  className="flex items-center justify-between w-full text-[10px] font-label-bold text-on-surface-variant/70 hover:text-primary-container uppercase tracking-widest px-2.5 py-1.5 rounded-lg hover:bg-surface-container-high/50 transition-colors group cursor-pointer"
                >
                  <span className="truncate">{group.category}</span>
                  <ChevronDown 
                    size={13} 
                    className={`shrink-0 transition-transform duration-200 ${isCollapsed ? '-rotate-90 text-on-surface-variant/40' : 'rotate-0 text-primary-container'}`} 
                  />
                </button>
                
                {/* Category Items List */}
                <div className={`flex flex-col gap-1 transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-96 opacity-100'}`}>
                  {group.items.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        title={tab.label}
                        className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200 w-full text-left touch-manipulation active:scale-[0.98] ${
                          isActive
                            ? 'bg-primary-container text-on-primary font-bold shadow-[0_0_15px_rgba(255,215,0,0.25)]'
                            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 border border-transparent'
                        }`}
                      >
                        <Icon size={16} className={`shrink-0 ${isActive ? 'text-on-primary' : 'text-on-surface-variant group-hover:text-primary-container'}`} />
                        <span className="flex items-center justify-between flex-1 text-xs font-semibold truncate">
                          <span className="truncate">{tab.label}</span>
                          {tab.isBeta && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-black tracking-wider uppercase ${isActive ? 'bg-black/25 text-on-primary' : 'bg-primary-container/20 text-primary-container border border-primary-container/30'}`}>
                              BETA
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

        </div>

        {/* Bottom System Status Indicator */}
        <div className="p-3 border-t border-outline-variant/20">
          <div className="flex items-center gap-2 text-[11px] text-on-surface-variant/70">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Bot Çevrimiçi</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area - Full width on Mobile, padded on Desktop */}
      <div className="flex-1 ml-0 md:ml-60 w-full h-[calc(100vh-56px)] overflow-y-auto custom-scrollbar p-3 sm:p-4 md:p-6 pb-28 md:pb-24">
        <main className="w-full max-w-[1200px] mx-auto flex flex-col">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 pb-3 md:mb-4 md:pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-3 text-left w-full sm:w-auto">
            {/* Mobile Back Button */}
            <Link
              href="/dashboard"
              className="md:hidden p-2 rounded-xl bg-surface-container-high/80 border border-outline-variant/40 text-primary-container hover:bg-primary-container/10 transition-all shrink-0"
              title={lang === 'tr' ? 'Panellere Dön' : 'Dashboard'}
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden bg-surface-container-high border border-outline-variant/50 flex items-center justify-center font-headline-xl text-base sm:text-lg md:text-xl text-primary-container font-bold shadow-[0_4px_20px_rgba(0,0,0,0.3)] shrink-0">
              {guildDetail?.icon ? (
                <img 
                  src={guildDetail.icon} 
                  alt={guildDetail?.name || "Server Icon"} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(guildDetail?.name || guildDetail?.Name || guildId).charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <h1 className="font-headline-xl text-base sm:text-lg md:text-2xl text-on-surface font-bold truncate tracking-tight" title={guildDetail?.name || guildDetail?.Name}>
                {guildDetail?.name || guildDetail?.Name || subscription?.guild_name || 'Server Settings'}
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-on-surface-variant font-label-bold uppercase tracking-wider text-[9px] sm:text-[10px] mt-0.5">
                 <span className="flex items-center gap-1 text-primary-container">
                   <Shield size={12} /> {lang === 'tr' ? 'Yönetici' : 'Admin'}
                 </span>
                 <span className="text-outline-variant/50">•</span>
                 <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                   isPremium 
                     ? 'bg-primary-container/20 text-primary-container border border-primary-container/30' 
                     : 'bg-surface-container-high text-on-surface-variant'
                 }`}>
                   {isPremium ? (lang === 'tr' ? '⭐ Premium' : '⭐ Premium') : 'Freemium'}
                 </span>
                 {guildDetail?.approximate_member_count && (
                   <>
                     <span className="text-outline-variant/50 hidden xs:inline">•</span>
                     <span className="text-on-surface-variant/80 hidden xs:inline">
                       {guildDetail.approximate_member_count} {lang === 'tr' ? 'Üye' : 'Members'}
                     </span>
                   </>
                 )}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Horizontal Swipeable Tab Navigation */}
        <div className="md:hidden w-full overflow-x-auto custom-scrollbar flex items-center gap-2 pb-2.5 mb-3.5 border-b border-outline-variant/20 -mx-1 px-1 touch-pan-x scroll-smooth">
          {allNavItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all touch-manipulation active:scale-95 ${
                  isActive
                    ? 'bg-primary-container text-on-primary font-bold shadow-[0_0_15px_rgba(255,215,0,0.25)]'
                    : 'bg-surface-container-high/80 text-on-surface-variant hover:text-on-surface border border-outline-variant/30'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-on-primary' : 'text-primary-container'} />
                <span className="whitespace-nowrap">{tab.label}</span>
                {tab.isBeta && (
                  <span className={`text-[8px] px-1 py-0.2 rounded font-black uppercase ${
                    isActive ? 'bg-black/30 text-on-primary' : 'bg-primary-container/20 text-primary-container'
                  }`}>
                    BETA
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Rendering with Bento Grids */}
        {activeTab === 'overview' && <OverviewTab t={t} lang={lang} subscription={subscription} setActiveTab={setActiveTab} showToast={showToast} settings={settings} />}
        
        {activeTab === 'general' && (
          <GeneralTab t={t} settings={settings} setSettings={setSettings} discordChannels={discordChannels} discordRoles={discordRoles} handleSave={handleSave} saving={saving} guildSearchQuery={guildSearchQuery} setGuildSearchQuery={setGuildSearchQuery} searchGuilds={searchGuilds} searchingGuild={searchingGuild} guildSearchResults={guildSearchResults} setGuildSearchResults={setGuildSearchResults} albionGuildDetail={albionGuildDetail} setAlbionGuildDetail={setAlbionGuildDetail} isOwner={isOwner} discordMembers={discordMembers} guildId={guildId} subscription={subscription} showToast={showToast} />
        )}

        {activeTab === 'embed' && (
          isPremium ? (
            <VisualTab t={t} settings={settings} setSettings={setSettings} uploadingThumb={uploadingThumb} checkImage={checkImage} handleFileSelect={handleFileSelect} thumbError={thumbError} renderStatus={renderStatus} handleSave={handleSave} saving={saving} />
          ) : (
            <PremiumLock lang={lang} t={t} />
          )
        )}

        {activeTab === 'log' && (
          <LogSettingsTab t={t} lang={lang} settings={settings} setSettings={setSettings} discordChannels={discordChannels} discordRoles={discordRoles} discordMembers={discordMembers} handleSave={handleSave} saving={saving} />
        )}

        {activeTab === 'templates' && (
          <TemplateTab t={t} lang={lang} settings={settings} setSettings={setSettings} selectedTemplateId={selectedTemplateId} setSelectedTemplateId={setSelectedTemplateId} discordRoles={discordRoles} isPremium={isPremium} handleSave={handleSave} saving={saving} />
        )}

        {activeTab === 'killboard' && (
          <KillBoardTab t={t} lang={lang} settings={settings} setSettings={setSettings} discordChannels={discordChannels} handleSave={handleSave} saving={saving} />
        )}

        {activeTab === 'registration' && (
          <RegistrationTab t={t} lang={lang} settings={settings} setSettings={setSettings} discordChannels={discordChannels} discordRoles={discordRoles} handleSave={handleSave} saving={saving} isPremium={isPremium} guildId={guildId} />
        )}

        {activeTab === 'rolemenu' && (
          <RoleMenuTab t={t} lang={lang} discordRoles={discordRoles} discordChannels={discordChannels} guildId={guildId} isPremium={isPremium} />
        )}

        {activeTab === 'ticket' && (
          <TicketTab t={t} lang={lang} settings={settings} setSettings={setSettings} discordChannels={discordChannels} discordRoles={discordRoles} handleSave={handleSave} saving={saving} isPremium={isPremium} guildId={guildId} />
        )}

        {activeTab === 'ticket_history' && (
          <TicketHistoryTab t={t} lang={lang} guildId={guildId} isPremium={isPremium} />
        )}

        {activeTab === 'events' && (
          <EventsHub t={t} lang={lang} guildId={guildId} discordChannels={discordChannels} discordRoles={discordRoles} isPremium={isPremium} />
        )}

        {activeTab === 'tempvoice' && (
          <TempVoiceTab t={t} lang={lang} settings={settings} setSettings={setSettings} setInitialSettings={setInitialSettings} discordChannels={discordChannels} discordRoles={discordRoles} isPremium={isPremium} guildId={guildId} />
        )}

      </main>



      {/* Unsaved Changes Banner */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface-container-highest/95 border-t border-primary-container p-2 md:p-2 z-[1000] flex flex-col md:flex-row justify-center items-center gap-2 md:gap-1 backdrop-blur-xl animate-slide-up shadow-[0_-10px_40px_rgba(255,215,0,0.1)]">
          <div className="text-on-surface font-label-bold text-[10px] md:text-[10px] flex items-center gap-2 md:gap-2 uppercase tracking-widest text-center">
             <AlertTriangle size={14} className="text-primary-container hidden md:block" />
             {lang === 'en' ? 'You have unsaved changes!' : 'Kaydedilmemiş değişiklikleriniz var!'}
          </div>
          <div className="flex gap-2 md:gap-2 w-full md:w-auto">
            <button onClick={() => setSettings(initialSettings)} className="flex-1 md:flex-none px-2 md:px-2 py-1.5 md:py-1.5 bg-transparent border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-outline rounded-sm font-label-bold text-[10px] md:text-[10px] uppercase tracking-widest transition-all text-center">
              {lang === 'en' ? 'Discard' : 'İptal Et'}
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 md:flex-none px-2 md:px-2 py-1.5 md:py-1.5 bg-primary-container text-on-primary border border-primary-container rounded-sm font-label-bold text-[10px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95 tactical-glow disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {lang === 'en' ? 'Save Changes' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}

      {imageToCrop && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-3">
           <div className="glass-panel max-w-[600px] w-full p-3 border border-primary-container relative">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-right from-transparent via-primary-container to-transparent opacity-50"></div>
              <h2 className="font-headline-lg text-[10px] text-on-surface mb-3 flex items-center gap-2 uppercase tracking-tight"><Crop size={16} className="text-primary-container"/> Crop Logo</h2>
              <div className="h-[400px] relative bg-black rounded-sm overflow-hidden mb-2 border border-outline-variant">
                 <Cropper image={imageToCrop} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
              </div>
              <div className="flex justify-end gap-2">
                 <button className="px-3 py-1.5 bg-transparent border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-outline transition-colors font-label-bold uppercase tracking-widest rounded-sm" onClick={() => setImageToCrop(null)}>Cancel</button>
                 <button className="px-3 py-1.5 bg-primary-container text-on-primary font-label-bold uppercase tracking-widest tactical-glow rounded-sm transition-all hover:brightness-110 disabled:opacity-50" onClick={uploadCroppedImage} disabled={uploadingThumb}>Apply & Upload</button>
              </div>
           </div>
        </div>
      )}

      </div>
    </div>
  );
}
