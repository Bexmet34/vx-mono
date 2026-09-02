"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Save, Bell, Loader2, AlertCircle, CheckCircle,
  LayoutDashboard, Server, MessageSquare, Settings, 
  Users, BarChart3, Search, Clock, Infinity, Power, 
  Calendar, Trash2, ChevronRight, ArrowLeft, Gift, Plus, Send, Edit3, Eye, EyeOff, DollarSign, Check, X, Gamepad2, CreditCard,
  Activity, TerminalSquare, Sparkles, FileText, RefreshCw, Menu
} from "lucide-react";
import AdminBlogAutomationTab from "@/components/AdminBlogAutomationTab";
import { useCallback } from "react";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import "./admin.css";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import AdminStatsTab from "./tabs/AdminStatsTab";
import AdminServersTab from "./tabs/AdminServersTab";
import AdminAnnouncementsTab from "./tabs/AdminAnnouncementsTab";
import AdminAutoPremiumTab from "./tabs/AdminAutoPremiumTab";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;
const ADMIN_ID_2 = process.env.NEXT_PUBLIC_ADMIN_ID_2 || "407234961582587916";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("servers");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data States
  const [templates, setTemplates] = useState([]);
  const [servers, setServers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [manualPayments, setManualPayments] = useState([]);
  const [paymentSearchTerm, setPaymentSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [bankAccounts, setBankAccounts] = useState([]);
  
  // Individual Bot User States
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [serverSubTab, setServerSubTab] = useState("guilds"); // guilds, users
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ discord_id: "", duration_days: 30, is_unlimited: false });
  // Auto Premium Rules States
  const [autoPremiumRules, setAutoPremiumRules] = useState([]);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [newRule, setNewRule] = useState({ id: "", rule_name: "", albion_guilds: "", discord_servers: "", premium_type: "limited", days_to_give: 30 });
  const [editingRuleId, setEditingRuleId] = useState(null);
  
  // Albion Guild Search States
  const [guildSearchQuery, setGuildSearchQuery] = useState("");
  const [guildSearchServer, setGuildSearchServer] = useState("all");
  const [guildSearchResults, setGuildSearchResults] = useState([]);
  const [isSearchingGuild, setIsSearchingGuild] = useState(false);

  // Modal States
  const [showDayModal, setShowDayModal] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [newBankAccount, setNewBankAccount] = useState({ bank_name: "", account_holder: "", iban: "", is_active: true });
  const [showEditBankModal, setShowEditBankModal] = useState(null); // null veya düzenlenen banka objesi
  const [editBankData, setEditBankData] = useState({ bank_name: "", account_holder: "", iban: "" });
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
    id: "", name_tr: "", name_en: "", amount: "", duration_days: 30, is_active: true, is_featured: false, sort_order: 0, features_tr: [], features_en: [], plan_type: "server", shopier_url: ""
  });

  // Settings States
  const [systemSettings, setSystemSettings] = useState({ vote_cooldown_hours: 168 });

  // Analytics States
  const [statsData, setStatsData] = useState(null);

  const isAdmin = session?.user?.id === ADMIN_ID || session?.user?.id === ADMIN_ID_2;

  const fetchTemplates = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (res.ok) setTemplates(data);
    } catch (err) { console.error(err); }
    finally { if (!silent) setLoading(false); }
  }, []);

  const fetchServers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/servers");
      const data = await res.json();
      if (res.ok) setServers(data);
    } catch (err) { console.error(err); }
    finally { if (!silent) setLoading(false); }
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

  const fetchManualPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/manual-payments");
      const data = await res.json();
      if (res.ok) setManualPayments(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  const fetchBankAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bank-accounts");
      const data = await res.json();
      if (res.ok) setBankAccounts(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      const data = await res.json();
      if (res.ok) setStatsData(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  const fetchUsers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) { console.error(err); }
    finally { if (!silent) setLoading(false); }
  }, []);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auto-premium-rules");
      const data = await res.json();
      if (res.ok) setAutoPremiumRules(data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    if (activeTab === "servers" && serverSubTab === "users") {
      fetchRules();
    }
  }, [activeTab, serverSubTab, fetchRules]);

  const [isSyncingGuilds, setIsSyncingGuilds] = useState(false);

  const handleSearchGuild = async () => {
    if (!guildSearchQuery || guildSearchQuery.length < 3) {
      setMessage({ type: "error", text: "Lütfen en az 3 karakter girin." });
      return;
    }
    setIsSearchingGuild(true);
    try {
      const res = await fetch(`/api/admin/albion-search?q=${encodeURIComponent(guildSearchQuery)}&server=${guildSearchServer}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setGuildSearchResults(data.guilds || []);
      } else {
        setMessage({ type: "error", text: data.error || "Arama hatası." });
      }
    } catch (e) {
      setMessage({ type: "error", text: "Bağlantı hatası." });
    } finally {
      setIsSearchingGuild(false);
    }
  };

  const handleSyncGuilds = async () => {
    setIsSyncingGuilds(true);
    setMessage({ type: "info", text: "Lonca üyeleri arka planda senkronize ediliyor, lütfen bekleyin..." });
    try {
      const res = await fetch(`/api/admin/sync-guilds`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: data.message || "Senkronizasyon tamamlandı!" });
      } else {
        setMessage({ type: "error", text: data.error || "Senkronizasyon hatası." });
      }
    } catch (e) {
      setMessage({ type: "error", text: "Bağlantı hatası." });
    } finally {
      setIsSyncingGuilds(false);
    }
  };

  const handleAddGuild = (guildName) => {
    const currentList = newRule.albion_guilds ? newRule.albion_guilds.split(",").map(s => s.trim()).filter(s => s) : [];
    if (!currentList.includes(guildName)) {
      currentList.push(guildName);
      setNewRule({ ...newRule, albion_guilds: currentList.join(", ") });
    }
    setGuildSearchResults([]);
    setGuildSearchQuery("");
  };

  const handleSaveRule = async () => {
    try {
      // Parse comma-separated strings to arrays
      const parsedGuilds = newRule.albion_guilds ? newRule.albion_guilds.split(",").map(s => s.trim()).filter(s => s) : [];
      const parsedServers = newRule.discord_servers ? newRule.discord_servers.split(",").map(s => s.trim()).filter(s => s) : [];
      
      const res = await fetch("/api/admin/auto-premium-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newRule, albion_guilds: parsedGuilds, discord_servers: parsedServers })
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Kural kaydedildi!" });
        setShowRulesModal(false);
        fetchRules();
      } else {
        setMessage({ type: "error", text: "Kural kaydedilemedi." });
      }
    } catch (e) {
      setMessage({ type: "error", text: "Bağlantı hatası." });
    }
  };

  const handleDeleteRule = async (id) => {
    if (!confirm("Bu kuralı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/auto-premium-rules?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "Kural silindi!" });
        fetchRules();
      }
    } catch (e) {
      setMessage({ type: "error", text: "Silinirken hata oluştu." });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSavingId('new_user');
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        showToast("Bireysel premium başarıyla tanımlandı!", "success");
        setNewUser({ discord_id: "", duration_days: 30, is_unlimited: false });
        setShowUserModal(false);
        fetchUsers();
      } else {
        const errorData = await res.json();
        showToast(errorData.error || "Kullanıcı eklenemedi.", "error");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleUserAction = async (discordId, action, value) => {
    const isDeleteAction = action === 'delete' || action === 'revoke';
    if (isDeleteAction) {
      if (!confirm("Bu kullanıcının premium yetkisini tamamen kaldırmak istediğinize emin misiniz?")) return;
    }
    setSavingId(discordId);
    try {
      if (isDeleteAction) {
        const res = await fetch(`/api/admin/users?id=${discordId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          showToast("Kullanıcı premium yetkisi silindi!", "success");
          fetchUsers(true);
        } else {
          const errData = await res.json();
          showToast(errData.error || "Silme işlemi başarısız.", "error");
        }
      } else {
        const res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ discord_id: discordId, action, value }),
        });
        if (res.ok) {
          showToast("Kullanıcı başarıyla güncellendi!", "success");
          fetchUsers(true);
        } else {
          const errData = await res.json();
          showToast(errData.error || "Güncelleme başarısız.", "error");
        }
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingId(null);
    }
  };

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
        if (activeTab === "servers") {
          fetchServers();
          fetchUsers();
        }
        if (activeTab === "campaigns") fetchCampaigns();
        if (activeTab === "broadcast") fetchScheduledMessages();
        if (activeTab === "plans") fetchPlans();
        if (activeTab === "settings") fetchSettings();
        if (activeTab === "manual-payments") fetchManualPayments();
        if (activeTab === "bank-accounts") fetchBankAccounts();
        if (activeTab === "stats" && !statsData) fetchStats();
      }, 0);
    }
  }, [activeTab, status, isAdmin, fetchTemplates, fetchServers, fetchUsers, fetchCampaigns, fetchScheduledMessages, fetchPlans, fetchSettings, fetchManualPayments, fetchBankAccounts, fetchStats, statsData]);


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
        
        // Update local state or silent fetch
        if (result.updatedData) {
          setServers(prev => prev.map(s => s.guild_id === guildId ? { ...s, ...result.updatedData } : s));
        } else {
          fetchServers(true);
        }
        
        setShowDayModal(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || "İşlem sırasında bir hata oluştu.", "error");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteServer = async (guildId) => {
    if (!confirm("Bu sunucunun tüm abonelik ve yetki kayıtlarını silmek istediğinize emin misiniz? (Freemium olarak görünecektir)")) return;
    
    setSavingId(guildId);
    try {
      const res = await fetch(`/api/admin/servers?id=${guildId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Sunucu kaydı başarıyla silindi!", "success");
        fetchServers(true);
      } else {
        const err = await res.json();
        showToast(err.error || "Silinirken hata oluştu.", "error");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleAddBankAccount = async (e) => {
    e.preventDefault();
    setSavingId('new_bank');
    try {
      const res = await fetch("/api/admin/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBankAccount),
      });
      if (res.ok) {
        showToast("Banka hesabı eklendi!", "success");
        setNewBankAccount({ bank_name: "", account_holder: "", iban: "", is_active: true });
        setShowBankModal(false);
        fetchBankAccounts();
      } else {
        const errorData = await res.json();
        showToast(errorData.error || "Banka hesabı eklenemedi.", "error");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleBankAccount = async (id, currentStatus) => {
    setSavingId(id);
    try {
      const res = await fetch("/api/admin/bank-accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });
      if (res.ok) {
        showToast("Banka durumu güncellendi!", "success");
        fetchBankAccounts();
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteBankAccount = async (id) => {
    if (!confirm("Bu banka hesabını silmek istediğinize emin misiniz?")) return;
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/bank-accounts?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Banka hesabı silindi!", "success");
        fetchBankAccounts();
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingId(null);
    }
  };

  // #16 — Banka hesabı düzenleme handler
  const handleEditBankAccount = async (e) => {
    e.preventDefault();
    if (!showEditBankModal) return;
    setSavingId(showEditBankModal.id);
    try {
      const res = await fetch("/api/admin/bank-accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: showEditBankModal.id, ...editBankData }),
      });
      if (res.ok) {
        showToast("Banka hesabı güncellendi!", "success");
        setShowEditBankModal(null);
        fetchBankAccounts();
      } else {
        const err = await res.json();
        showToast(err.error || "Güncelleme başarısız", "error");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleManualPaymentAction = (id, status) => {
    setShowConfirmModal({ id, status });
  };

  const executeManualPaymentAction = async () => {
    if (!showConfirmModal) return;
    const { id, status } = showConfirmModal;
    setSavingId(id);
    try {
      const res = await fetch("/api/admin/manual-payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        showToast(`Ödeme başarıyla ${status === 'paid' ? 'onaylandı' : 'reddedildi'}!`, "success");
        fetchManualPayments();
      } else {
        const data = await res.json();
        showToast(data.error || "Hata", "error");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingId(null);
      setShowConfirmModal(null);
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

  const filteredPayments = manualPayments.filter(p => {
    const term = paymentSearchTerm.toLowerCase();
    const matchesSearch = 
      (p.guild_id && p.guild_id.toLowerCase().includes(term)) ||
      (p.user_id && p.user_id.toLowerCase().includes(term)) ||
      (p.guild_name && p.guild_name.toLowerCase().includes(term)) ||
      (p.description_code && p.description_code.toLowerCase().includes(term));
      
    if (!matchesSearch) return false;
    
    if (paymentStatusFilter === 'pending') return p.status === 'pending';
    if (paymentStatusFilter === 'paid') return p.status === 'paid';
    if (paymentStatusFilter === 'rejected') return p.status === 'rejected' || p.status === 'cancel';
    
    return true;
  });

  const menuItems = [
    { id: "overview", label: "Genel Bakış", icon: <LayoutDashboard size={14} /> },
    { id: "servers", label: "Sunucu Yönetimi", icon: <Server size={14} /> },
    { id: "plans", label: "Paket Yönetimi", icon: <DollarSign size={14} /> }, 
    // { id: "manual-payments", label: "Havale/EFT Onayları", icon: <CheckCircle size={14} /> },
    // { id: "bank-accounts", label: "Banka Hesapları", icon: <CreditCard size={14} /> },
    { id: "campaigns", label: "Kampanya & Hediye", icon: <Gift size={14} /> },
    { id: "notifications", label: "Bildirim Şablonları", icon: <Bell size={14} /> },
    { id: "broadcast", label: "Duyuru Merkezi", icon: <MessageSquare size={14} /> },
    { id: "blog-automation", label: "Manuel Blog & SEO Editörü", icon: <FileText size={14} /> },
    { id: "stats", label: "Veri Analizi", icon: <BarChart3 size={14} /> },
    { id: "settings", label: "Sistem Ayarları", icon: <Settings size={14} /> },
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
    <div className="flex h-screen bg-[#0f1011] overflow-hidden font-sans">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <AdminHeader 
          activeTab={activeTab} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          loading={loading} 
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative">


        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "8rem" }}>
            <Loader2 className="spin" size={40} color="var(--admin-accent)" />
          </div>
        ) : (
          <div className="animate-slide-up">
            
            {/* BLOG AUTOMATION TAB */}
            {activeTab === "blog-automation" && (
              <AdminBlogAutomationTab showToast={showToast} />
            )}

            {activeTab === "announcements" && (
              <AdminAnnouncementsTab />
            )}

            {activeTab === "servers" && (
              <AdminServersTab 
                servers={servers} 
                loading={loading} 
                setLoading={setLoading} 
                fetchServers={fetchServers} 
                showToast={showToast} 
                users={users} 
                fetchUsers={fetchUsers} 
                savingId={savingId} 
                handleServerAction={handleServerAction} 
                handleDeleteServer={handleDeleteServer} 
                handleUserAction={handleUserAction} 
                setShowRulesModal={setShowRulesModal} 
                setShowUserModal={setShowUserModal} 
                userSearchTerm={userSearchTerm} 
                setUserSearchTerm={setUserSearchTerm} 
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === "auto-premium" && (
              <AdminAutoPremiumTab showToast={showToast} />
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
                         setNewPlan({id: "", name_tr: "", name_en: "", amount: "", duration_days: 30, is_active: true, is_featured: false, sort_order: 0, features_tr: [], features_en: [], plan_type: "server", shopier_url: ""});
                         setShowPlanModal(true);
                       }} style={{padding: '0.8rem 1.5rem', borderRadius: '12px'}}>
                          <Plus size={14} /> Yeni Paket Ekle
                       </button>
                    </div>

                    <div className="admin-card">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>PAKET ADI / ID</th>
                            <th>KATEGORİ</th>
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
                                {p.shopier_url && <div style={{fontSize: '0.7rem', color: '#6366f1', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem'}}><CreditCard size={10} /> Shopier Entegre</div>}
                              </td>
                              <td data-label="KATEGORİ">
                                <span className={`admin-badge ${p.plan_type === 'user' ? 'badge-active' : 'badge-unlimited'}`}>
                                  {p.plan_type === 'user' ? 'Bireysel' : 'Sunucu'}
                                </span>
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
                                      <Edit3 size={14} />
                                   </button>
                                   <button className="admin-action-btn danger" onClick={() => handleDeletePlan(p.id)}>
                                      <Trash2 size={14} />
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
                          <ArrowLeft size={14} />
                       </button>
                       <div>
                          <h2 style={{fontSize: '1.5rem', fontWeight: '800'}}>{editingPlanId ? 'Paketi Düzenle' : 'Yeni Paket Ekle'}</h2>
                          <p style={{color: 'var(--admin-text-muted)'}}>Paket detaylarını ve kullanıcıların göreceği özellikleri belirleyin.</p>
                       </div>
                    </div>

                    <div className="admin-card" style={{padding: '2.5rem'}}>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem'}}>
                         <div>
                            <label className="admin-label">Paket ID (Örn: 1_month)</label>
                            <input className="admin-input-field" value={newPlan.id} disabled={!!editingPlanId} onChange={e => setNewPlan({...newPlan, id: e.target.value})} />
                         </div>
                         <div>
                            <label className="admin-label">Kategori</label>
                            <select className="admin-input-field" value={newPlan.plan_type || 'server'} onChange={e => setNewPlan({...newPlan, plan_type: e.target.value})}>
                              <option value="server">Sunucu Bazlı (Server)</option>
                              <option value="user">Bireysel (User)</option>
                            </select>
                         </div>
                         <div>
                            <label className="admin-label">Süre (Gün)</label>
                            <input className="admin-input-field" type="number" value={newPlan.duration_days} onChange={e => setNewPlan({...newPlan, duration_days: parseInt(e.target.value)})} />
                         </div>
                      </div>

                      <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem'}}>
                         <div>
                            <label className="admin-label">Fiyat (TL/USDT)</label>
                            <input className="admin-input-field" type="number" step="0.01" value={newPlan.amount} onChange={e => setNewPlan({...newPlan, amount: e.target.value})} />
                         </div>
                         <div>
                            <label className="admin-label">Shopier URL (İsteğe bağlı, girilirse otomatik Shopier açılır)</label>
                            <input className="admin-input-field" value={newPlan.shopier_url || ''} placeholder="https://www.shopier.com/veyronixbot/12345" onChange={e => setNewPlan({...newPlan, shopier_url: e.target.value})} />
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
                          {loading ? <Loader2 size={14} className="spin" /> : <><Save size={14}/> {editingPlanId ? 'Değişiklikleri Kaydet' : 'Paketi Oluştur'}</>}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* MANUAL PAYMENTS TAB */}
            {activeTab === "manual-payments" && (
              <div className="animate-slide-up">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem'}}>
                  <div>
                    <h2 style={{fontSize: '1.5rem', fontWeight: '800'}}>Havale/EFT Onayları</h2>
                    <p style={{color: 'var(--admin-text-muted)'}}>Kullanıcıların yaptığı banka ödemelerini buradan onaylayabilirsiniz.</p>
                  </div>
                </div>

                <div className="admin-card" style={{marginBottom: '2rem'}}>
                   <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between'}}>
                      <div className="admin-search-container" style={{marginBottom: 0, flex: 1, minWidth: '300px'}}>
                        <Search style={{ position: "absolute", left: "1.2rem", top: "50%", transform: "translateY(-50%)", color: "var(--admin-text-muted)" }} size={14} />
                        <input 
                          className="admin-search-input" 
                          placeholder="Sunucu ismi, Guild ID, User ID veya Açıklama Kodu ile ara..." 
                          value={paymentSearchTerm}
                          onChange={(e) => setPaymentSearchTerm(e.target.value)}
                        />
                      </div>
                   </div>
                </div>

                <div style={{display: 'flex', gap: '0.5rem', marginBottom: '2rem', padding: '0.5rem', background: 'var(--admin-card)', borderRadius: '12px', border: '1px solid var(--admin-border)', flexWrap: 'wrap'}}>
                   {['all', 'pending', 'paid', 'rejected'].map(f => (
                     <button 
                       key={f}
                       onClick={() => setPaymentStatusFilter(f)}
                       style={{
                         flex: '1', minWidth: '120px', padding: '0.75rem 1rem', borderRadius: '8px',
                         background: paymentStatusFilter === f ? 'var(--admin-accent)' : 'transparent',
                         color: paymentStatusFilter === f ? '#000' : 'var(--admin-text-muted)',
                         fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease',
                         textAlign: 'center'
                       }}
                     >
                       {f === 'all' && 'Tüm Kayıtlar'}
                       {f === 'pending' && 'Bekleyenler'}
                       {f === 'paid' && 'Onaylananlar'}
                       {f === 'rejected' && 'Reddedilenler'}
                     </button>
                   ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {filteredPayments.length === 0 ? (
                    <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'var(--admin-card)', borderRadius: '12px', border: '1px solid var(--admin-border)', color: 'var(--admin-text-muted)'}}>
                      Arama kriterlerine uygun ödeme kaydı bulunamadı.
                    </div>
                  ) : filteredPayments.map(p => (
                    <div key={p.id} style={{
                      background: 'var(--admin-card)', 
                      borderRadius: '16px', 
                      border: `1px solid ${p.status === 'pending' ? 'rgba(252,163,17,0.3)' : 'var(--admin-border)'}`, 
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: p.status === 'pending' ? '0 0 20px rgba(252,163,17,0.05)' : 'none',
                      transition: 'transform 0.3s ease',
                    }}>
                      {/* HEADER */}
                      <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Server size={14} style={{ color: 'var(--admin-text-muted)' }} />
                          <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--admin-text)' }}>{p.guild_name}</div>
                        </div>
                        <div>
                          {p.status === 'pending' && <span className="admin-badge" style={{background: 'rgba(252,163,17,0.15)', color: '#fca311', padding: '0.4rem 0.8rem', borderRadius: '20px'}}>Bekliyor</span>}
                          {p.status === 'paid' && <span className="admin-badge badge-active" style={{padding: '0.4rem 0.8rem', borderRadius: '20px'}}>Onaylandı</span>}
                          {(p.status === 'rejected' || p.status === 'cancel') && <span className="admin-badge badge-passive" style={{padding: '0.4rem 0.8rem', borderRadius: '20px'}}>Reddedildi</span>}
                        </div>
                      </div>

                      {/* BODY */}
                      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                           <div>
                             <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Kullanıcı ID</div>
                             <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--admin-text)' }}>{p.user_id}</div>
                           </div>
                           <div>
                             <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Gönderen & Banka</div>
                             <div style={{ fontWeight: '700', color: 'var(--admin-text)' }}>{p.sender_name}</div>
                             <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>{p.target_bank}</div>
                           </div>
                        </div>

                        <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-accent)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tutar</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--admin-text)' }}>{p.amount} <span style={{fontSize: '0.9rem', color: 'var(--admin-text-muted)'}}>{p.currency}</span></div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-accent)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Süre</div>
                            <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--admin-text)' }}>{p.duration_days} Günlük</div>
                          </div>
                        </div>

                        <div>
                           <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Açıklama Kodu (Dekont İçin)</div>
                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--admin-border)', padding: '0.8rem 1rem', borderRadius: '8px' }}>
                             <code style={{ fontSize: '1.1rem', letterSpacing: '3px', fontWeight: 'bold', color: '#fff' }}>{p.description_code}</code>
                           </div>
                        </div>

                      </div>

                      {/* FOOTER ACTIONS */}
                      {p.status === 'pending' && (
                        <div style={{ padding: '1rem', borderTop: '1px solid var(--admin-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', background: 'rgba(0,0,0,0.2)' }}>
                           <button 
                             className="admin-btn" 
                             style={{ background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', border: '1px solid rgba(46, 204, 113, 0.3)', padding: '0.8rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                             onClick={() => handleManualPaymentAction(p.id, 'paid')}
                             disabled={savingId === p.id}
                           >
                             {savingId === p.id ? <Loader2 size={14} className="spin" /> : <><Check size={14} /> ONAYLA</>}
                           </button>
                           <button 
                             className="admin-action-btn danger" 
                             style={{ padding: '0.8rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%', borderRadius: '8px' }}
                             onClick={() => handleManualPaymentAction(p.id, 'rejected')}
                             disabled={savingId === p.id}
                           >
                             {savingId === p.id ? <Loader2 size={14} className="spin" /> : <><X size={14} /> REDDET</>}
                           </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BANK ACCOUNTS TAB */}
            {activeTab === "bank-accounts" && (
              <div className="animate-slide-up">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem'}}>
                  <div>
                    <h2 style={{fontSize: '1.5rem', fontWeight: '800'}}>Banka Hesapları</h2>
                    <p style={{color: 'var(--admin-text-muted)'}}>Müşterilerin havale yapabileceği banka/kart bilgilerinizi yönetin.</p>
                  </div>
                  <button 
                    className="admin-btn" 
                    onClick={() => setShowBankModal(true)}
                  >
                    <Plus size={14} /> Yeni Ekle
                  </button>
                </div>

                <div className="admin-card">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>BANKA ADI</th>
                        <th>HESAP SAHİBİ</th>
                        <th>IBAN / HESAP NO</th>
                        <th>DURUM</th>
                        <th style={{textAlign: "right"}}>İŞLEMLER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankAccounts.length === 0 ? (
                        <tr><td colSpan={5} style={{textAlign: 'center', padding: '4rem', opacity: 0.5}}>Henüz kayıtlı banka hesabı bulunmuyor.</td></tr>
                      ) : bankAccounts.map(b => (
                        <tr key={b.id} style={{opacity: b.is_active ? 1 : 0.5}}>
                          <td data-label="BANKA ADI">
                            <div style={{fontWeight: '700', fontSize: '0.95rem'}}>{b.bank_name}</div>
                          </td>
                          <td data-label="HESAP SAHİBİ">
                            <div style={{fontWeight: '600'}}>{b.account_holder}</div>
                          </td>
                          <td data-label="IBAN / HESAP NO">
                            <code style={{fontSize: '0.9rem', color: 'var(--admin-text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '4px', letterSpacing: '1px'}}>
                              {b.iban}
                            </code>
                          </td>
                          <td data-label="DURUM">
                            {b.is_active ? (
                              <span className="admin-badge badge-active">Aktif</span>
                            ) : (
                              <span className="admin-badge badge-passive">Pasif</span>
                            )}
                          </td>
                          <td data-label="İŞLEMLER">
                            <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
                              {/* #16 — Düzenleme Butonu */}
                              <button 
                                className="admin-action-btn" 
                                title="Düzenle"
                                onClick={() => { setShowEditBankModal(b); setEditBankData({ bank_name: b.bank_name, account_holder: b.account_holder, iban: b.iban }); }}
                                disabled={savingId === b.id}
                                style={{color: 'var(--admin-accent)', borderColor: 'rgba(252,163,17,0.3)'}}
                              >
                                <Edit3 size={14} />
                              </button>
                              <button 
                                className="admin-action-btn" 
                                title={b.is_active ? "Pasife Al" : "Aktife Al"}
                                onClick={() => handleToggleBankAccount(b.id, b.is_active)}
                                disabled={savingId === b.id}
                                style={{color: b.is_active ? 'var(--admin-warning)' : 'var(--admin-success)', borderColor: 'rgba(255, 255, 255, 0.1)'}}
                              >
                                {savingId === b.id ? <Loader2 size={14} className="spin" /> : (b.is_active ? <EyeOff size={14} /> : <Eye size={14} />)}
                              </button>
                              <button 
                                className="admin-action-btn danger" 
                                title="Sil"
                                onClick={() => handleDeleteBankAccount(b.id)}
                                disabled={savingId === b.id}
                              >
                                {savingId === b.id ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* #16 — Banka Hesabı Düzenleme Modalı */}
            {showEditBankModal && (
              <div style={{position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}} onClick={() => setShowEditBankModal(null)}>
                <div style={{background:'var(--admin-card)',border:'1px solid var(--admin-border)',borderRadius:'20px',padding:'2.5rem',width:'100%',maxWidth:'480px',position:'relative'}} onClick={e => e.stopPropagation()}>
                  <h2 style={{fontSize:'1.3rem',fontWeight:'800',marginBottom:'2rem'}}>Banka Hesabını Düzenle</h2>
                  <form onSubmit={handleEditBankAccount} style={{display:'flex',flexDirection:'column',gap:'1.2rem'}}>
                    <div>
                      <label className="admin-label">Banka Adı</label>
                      <input className="admin-input-field" value={editBankData.bank_name} onChange={e => setEditBankData({...editBankData, bank_name: e.target.value})} required />
                    </div>
                    <div>
                      <label className="admin-label">Hesap Sahibi</label>
                      <input className="admin-input-field" value={editBankData.account_holder} onChange={e => setEditBankData({...editBankData, account_holder: e.target.value})} required />
                    </div>
                    <div>
                      <label className="admin-label">IBAN / Hesap No</label>
                      <input className="admin-input-field" value={editBankData.iban} onChange={e => setEditBankData({...editBankData, iban: e.target.value})} required />
                    </div>
                    <div style={{display:'flex',gap:'1rem',marginTop:'1rem'}}>
                      <button type="button" className="admin-btn-secondary" style={{flex:1}} onClick={() => setShowEditBankModal(null)}>İptal</button>
                      <button type="submit" className="btn-primary" style={{flex:2,padding:'0.9rem'}} disabled={savingId === showEditBankModal?.id}>
                        {savingId === showEditBankModal?.id ? <Loader2 size={14} className="spin" /> : <><Save size={14}/> Kaydet</>}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* NOTIFICATION TEMPLATES TAB */}
            {activeTab === "notifications" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
                {templates.map(tpl => (
                  <div key={tpl.id} className="admin-tpl-card animate-slide-up">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ background: "var(--admin-accent-muted)", padding: "0.75rem", borderRadius: "14px" }}><Bell size={16} color="var(--admin-accent)" /></div>
                        <div>
                          <h2 style={{ fontSize: "1.2rem", fontWeight: "800", margin: 0 }}>{tpl.id.toUpperCase().replace('_', ' ')}</h2>
                          <p style={{fontSize: '0.8rem', color: 'var(--admin-text-muted)', margin: 0}}>Olay tetiklendiğinde sahiplere gidecek mesaj.</p>
                        </div>
                      </div>
                      <button className="btn-primary" disabled={savingId === tpl.id} onClick={() => handleUpdateTemplate(tpl)} style={{ padding: "0.6rem 1.5rem", borderRadius: '10px' }}>
                        {savingId === tpl.id ? <Loader2 className="spin" size={14} /> : <Save size={14} />}
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
                          <Plus size={14} /> Yeni Kampanya Başlat
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
                                  {c.show_on_home ? <Eye size={14} color="var(--admin-accent)" /> : <EyeOff size={14} />}
                               </button>
                               <button className="admin-action-btn" onClick={() => handleToggleCampaign(c.id, 'is_active', !c.is_active)}>
                                  <Power size={14} color={c.is_active ? 'var(--admin-success)' : ''} />
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
                      <ArrowLeft size={14} />
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
                      {loading ? <Loader2 size={14} className="spin" /> : <><Send size={14}/> Kampanyayı Başlat</>}
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
                          <Plus size={14} /> Yeni Mesaj Planla
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
                                      <Trash2 size={14} />
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
                          <ArrowLeft size={14} />
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
                                <Trash2 size={14} />
                              </button>
                           </div>
                         ))}
                      </div>

                      <div style={{display: 'flex', gap: '1rem'}}>
                        <button className="admin-btn-secondary" style={{width: '200px'}} onClick={() => setShowScheduledModal(false)}>İptal</button>
                        <button className="btn-primary" style={{width: '250px', padding: '1rem'}} onClick={handleCreateScheduled} disabled={loading || !newScheduled.send_time || !newScheduled.message_content}>
                          {loading ? <Loader2 size={14} className="spin" /> : <><Save size={14}/> Planı Kaydet</>}
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
                      {loading ? <Loader2 size={14} className="spin" /> : <><Save size={14} /> Ayarları Kaydet</>}
                   </button>
                </div>

                <div className="admin-card" style={{padding: '2.5rem'}}>
                  <h3 style={{marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '700'}}>Sistem Geneli Ayarlar</h3>
                  
                  <div style={{marginBottom: '2rem'}}>
                     <label className="admin-label">Destek Sunucusu Davet Linki</label>
                     <p style={{fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginBottom: '1rem'}}>
                        Sistem genelinde (Web, Bot, Bakım Modu vb.) kullanılacak ana Discord davet linki. (Değişikliklerin heryere yansıması için kaydettikten sonra sistemi yeniden başlatmanız gerekebilir.)
                     </p>
                     <input 
                       className="admin-input-field" 
                       type="text" 
                       value={systemSettings.discord_invite_url || ''} 
                       onChange={e => setSystemSettings({...systemSettings, discord_invite_url: e.target.value})} 
                       style={{width: '100%', maxWidth: '400px', textAlign: 'left'}}
                     />
                  </div>
                  
                  <div style={{width: '100%', height: '1px', background: 'var(--admin-border)', margin: '2rem 0'}}></div>

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
                       style={{width: '200px', textAlign: 'left'}}
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
                {savingId === showDayModal.guildId ? <Loader2 size={14} className="spin" /> : 'Güncelle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATS TAB */}
      {activeTab === "stats" && (
        <div className="animate-slide-up">
          <div className="server-tab-header">
             <div>
                <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.3rem'}}>Analitik & İstatistikler</h2>
                <p style={{color: 'var(--admin-text-muted)'}}>Bot kullanım verilerini grafiklerle inceleyin.</p>
             </div>
             <button className="admin-btn-secondary" onClick={fetchStats}><Loader2 size={14} className={loading ? "spin" : ""} /> Yenile</button>
          </div>

          {!statsData ? (
            <div style={{textAlign: 'center', padding: '3rem'}}>Veriler yükleniyor...</div>
          ) : statsData.warning ? (
            <div style={{textAlign: 'center', padding: '3rem', color: 'var(--admin-error)'}}>
              <AlertCircle size={48} style={{margin: '0 auto 1rem'}} />
              <h3>Geçici Olarak Devre Dışı</h3>
              <p style={{marginTop: '0.5rem', opacity: 0.8}}>{statsData.warning}</p>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                 <div className="admin-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ background: 'rgba(252, 163, 17, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                       <Gamepad2 size={28} color="#fca311" />
                    </div>
                    <div>
                       <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Toplam Parti</div>
                       <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white', marginTop: '0.2rem' }}>{statsData.stats?.totalParties?.toLocaleString() || 0}</div>
                    </div>
                 </div>
                 
                 <div className="admin-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ background: 'rgba(58, 134, 255, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                       <TerminalSquare size={28} color="#3a86ff" />
                    </div>
                    <div>
                       <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kullanılan Komut</div>
                       <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white', marginTop: '0.2rem' }}>{statsData.stats?.totalCommands?.toLocaleString() || 0}</div>
                    </div>
                 </div>

                 <div className="admin-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ background: 'rgba(46, 204, 113, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                       <Server size={28} color="#2ecc71" />
                    </div>
                    <div>
                       <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aktif Premium Sunucu</div>
                       <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white', marginTop: '0.2rem' }}>{servers.filter(s => s.is_active).length}</div>
                    </div>
                 </div>

                 <div className="admin-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ background: 'rgba(155, 89, 182, 0.1)', padding: '1rem', borderRadius: '16px' }}>
                       <Users size={28} color="#9b59b6" />
                    </div>
                    <div>
                       <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Toplam Sunucu</div>
                       <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white', marginTop: '0.2rem' }}>{servers.length}</div>
                    </div>
                 </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem'}}>
                {/* Hourly Activity */}
                <div className="admin-card" style={{ overflow: 'hidden' }}>
                  <div className="admin-card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                       <Activity size={14} color="#fca311" /> Son 24 Saat Parti Aktivitesi
                    </h3>
                  </div>
                  <div style={{height: 350, padding: '1.5rem 1.5rem 0 0'}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={statsData.hourlyParties || []}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fca311" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#fca311" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="hour" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                        <YAxis stroke="#64748b" allowDecimals={false} tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} dx={-10} />
                        <RechartsTooltip 
                          contentStyle={{backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', backdropFilter: 'blur(10px)'}} 
                          itemStyle={{color: '#fca311', fontWeight: 'bold'}}
                        />
                        <Area type="monotone" dataKey="count" name="Parti Sayısı" stroke="#fca311" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Commands */}
                <div className="admin-card" style={{ overflow: 'hidden' }}>
                  <div className="admin-card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                       <TerminalSquare size={14} color="#3a86ff" /> Popüler Komutlar
                    </h3>
                  </div>
                  <div style={{height: 350, padding: '1.5rem 1.5rem 0 0'}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statsData.topCommands || []} layout="vertical" barSize={24}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                        <XAxis type="number" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" stroke="#64748b" width={100} tick={{fill: '#e2e8f0', fontSize: 13, fontWeight: 500}} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          cursor={{fill: 'rgba(255,255,255,0.05)'}}
                          contentStyle={{backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', backdropFilter: 'blur(10px)'}} 
                          itemStyle={{color: '#3a86ff', fontWeight: 'bold'}}
                        />
                        <Bar dataKey="count" name="Kullanım" fill="#3a86ff" radius={[0, 6, 6, 0]}>
                           {
                             (statsData.topCommands || []).map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={index === 0 ? '#3a86ff' : index === 1 ? '#4cc9f0' : '#4895ef'} />
                             ))
                           }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

    
        </main>


      {/* Confirm Action Modal */}
      {showConfirmModal && (
        <div className="admin-modal-overlay" onClick={() => setShowConfirmModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
             <div className="admin-modal-header border-b border-[var(--admin-border)]">
               <h3 className="admin-modal-title">Ödeme İşlemi</h3>
               <button className="admin-modal-close" onClick={() => setShowConfirmModal(null)}>
                 <X size={14} />
               </button>
             </div>
             <div className="admin-modal-body text-center py-1.5">
               <div style={{background: showConfirmModal.status === 'paid' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'}}>
                  {showConfirmModal.status === 'paid' ? (
                    <CheckCircle size={32} color="var(--admin-success)" />
                  ) : (
                    <AlertCircle size={32} color="var(--admin-error)" />
                  )}
               </div>
               <h4 style={{fontSize: '1.25rem', color: 'white', fontWeight: '600', marginBottom: '0.5rem'}}>
                 Emin misiniz?
               </h4>
               <p style={{color: 'var(--admin-text-muted)', fontSize: '0.9rem'}}>
                 {showConfirmModal.status === 'paid' 
                   ? 'Bu ödemeyi onaylamak istediğinize emin misiniz? Sunucunun abonelik süresi seçilen pakete göre uzatılacaktır.' 
                   : 'Bu ödemeyi reddetmek istediğinize emin misiniz? Bu işlem geri alınamaz.'}
               </p>
             </div>
             <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setShowConfirmModal(null)}>İptal</button>
              <button 
                className={`admin-btn-primary ${showConfirmModal.status === 'paid' ? '' : 'danger'}`}
                style={showConfirmModal.status === 'failed' ? {background: 'var(--admin-error)'} : {}}
                onClick={executeManualPaymentAction}
                disabled={savingId === showConfirmModal.id}
              >
                {savingId === showConfirmModal.id ? <Loader2 size={14} className="spin" /> : 'Evet, Onayla'}
              </button>
             </div>
          </div>
        </div>
      )}

      {/* Bank Account Modal */}
      {showBankModal && (
        <div className="admin-modal-overlay" onClick={() => setShowBankModal(false)}>
          <div className="admin-modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header border-b border-[var(--admin-border)] mb-2 pb-4">
              <h3 className="admin-modal-title">Yeni Banka Hesabı Ekle</h3>
              <button className="admin-modal-close" onClick={() => setShowBankModal(false)}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleAddBankAccount}>
              <div className="admin-modal-body space-y-4">
                <div>
                  <label className="admin-input-label">Banka Adı</label>
                  <input 
                    type="text" 
                    className="admin-input-field" 
                    placeholder="Örn: Ziraat Bankası" 
                    value={newBankAccount.bank_name}
                    onChange={(e) => setNewBankAccount({...newBankAccount, bank_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="admin-input-label">Hesap Sahibi (Ad Soyad)</label>
                  <input 
                    type="text" 
                    className="admin-input-field" 
                    placeholder="Örn: Ahmet Yılmaz" 
                    value={newBankAccount.account_holder}
                    onChange={(e) => setNewBankAccount({...newBankAccount, account_holder: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="admin-input-label">IBAN veya Hesap No</label>
                  <input 
                    type="text" 
                    className="admin-input-field font-mono" 
                    placeholder="TR..." 
                    value={newBankAccount.iban}
                    onChange={(e) => setNewBankAccount({...newBankAccount, iban: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-footer mt-3 pt-4 border-t border-[var(--admin-border)]">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowBankModal(false)}>İptal</button>
                <button 
                  type="submit"
                  className="admin-btn-primary"
                  disabled={savingId === 'new_bank' || !newBankAccount.bank_name || !newBankAccount.account_holder || !newBankAccount.iban}
                >
                  {savingId === 'new_bank' ? <Loader2 size={14} className="spin" /> : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {showUserModal && (
        <div className="admin-modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="admin-modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header border-b border-[var(--admin-border)] mb-2 pb-4">
              <h3 className="admin-modal-title">Bireysel Premium Tanımla</h3>
              <button className="admin-modal-close" onClick={() => setShowUserModal(false)}>
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="admin-modal-body space-y-4">
                <div>
                  <label className="admin-input-label">Discord Kullanıcı ID (discord_id)</label>
                  <input 
                    type="text" 
                    className="admin-input-field font-mono" 
                    placeholder="Örn: 407234961582587916" 
                    value={newUser.discord_id} 
                    onChange={e => setNewUser({...newUser, discord_id: e.target.value})} 
                    required 
                  />
                </div>
                
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0'}}>
                  <input 
                    type="checkbox" 
                    id="userIsUnlimited" 
                    checked={newUser.is_unlimited} 
                    onChange={e => setNewUser({...newUser, is_unlimited: e.target.checked})} 
                    style={{width: '20px', height: '20px', accentColor: 'var(--admin-accent)'}} 
                  />
                  <label htmlFor="userIsUnlimited" style={{fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem'}}>Sınırsız Premium (Süre Muafiyeti)</label>
                </div>

                {!newUser.is_unlimited && (
                  <div>
                    <label className="admin-input-label">Süre (Gün)</label>
                    <input 
                      type="number" 
                      className="admin-input-field" 
                      value={newUser.duration_days} 
                      onChange={e => setNewUser({...newUser, duration_days: parseInt(e.target.value) || 0})} 
                      min="1"
                      required 
                    />
                  </div>
                )}
              </div>
              <div className="admin-modal-footer mt-3 pt-4 border-t border-[var(--admin-border)]">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowUserModal(false)}>İptal</button>
                <button 
                  type="submit"
                  className="admin-btn-primary"
                  disabled={savingId === 'new_user' || !newUser.discord_id}
                >
                  {savingId === 'new_user' ? <Loader2 size={14} className="spin" /> : 'Tanımla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
