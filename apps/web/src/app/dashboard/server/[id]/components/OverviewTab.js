"use client";

import { AlertCircle, Infinity, Star, Crown, Users, Search, Plus, Trash2, ShieldAlert } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useMemo } from "react";

export default function OverviewTab({ subscription, setActiveTab, settings, showToast, isOwner, discordMembers, guildId }) {
  const { lang, t } = useLanguage();
  const locale = lang === 'tr' ? tr : enUS;

  const [adminSearch, setAdminSearch] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Parse authorized users
  const authorizedUsers = useMemo(() => {
    if (!subscription?.authorized_users) return [];
    if (Array.isArray(subscription.authorized_users)) return subscription.authorized_users;
    if (typeof subscription.authorized_users === 'string') {
      try {
        return JSON.parse(subscription.authorized_users);
      } catch(e) {
        const stripped = subscription.authorized_users.replace(/^{|}$/g, '');
        return stripped ? stripped.split(',') : [];
      }
    }
    return [];
  }, [subscription]);

  // Determine subscription tier
  let tier = "freemium"; 
  let timeStatus = lang === 'tr' ? "Freemium" : "Freemium";
  let statusColor = "#888";
  let statusDesc = lang === 'tr' ? "Top.gg üzerinden oy vererek kullanılabilir" : "Available by voting on Top.gg";
  let StatusIcon = AlertCircle;

  if (subscription) {
    if (subscription.is_unlimited) {
      tier = "unlimited";
      timeStatus = lang === 'tr' ? "Ömür Boyu Premium" : "Lifetime Premium";
      statusColor = "var(--accent-color)";
      statusDesc = lang === 'tr' ? "Sınırsız erişim aktif" : "Unlimited access active";
      StatusIcon = Infinity;
    } else if (subscription.trial_used === false) {
      const expired = isPast(new Date(subscription.expires_at));
      if (!expired && subscription.is_active) {
        tier = "premium";
        const remaining = formatDistanceToNow(new Date(subscription.expires_at), { locale });
        timeStatus = lang === 'tr' ? "Premium" : "Premium";
        statusColor = "#22c55e";
        statusDesc = `${remaining} ${t.dashLeft || "left"}`;
        StatusIcon = Crown;
      } else {
        tier = "freemium";
        timeStatus = lang === 'tr' ? "Freemium" : "Freemium";
        statusColor = "#888";
        statusDesc = lang === 'tr' ? "Paket süresi doldu — Top.gg oyu gerekli" : "Plan expired — Top.gg vote required";
        StatusIcon = AlertCircle;
      }
    }
  }

  const handleAddAdmin = async () => {
    if (!selectedMember) return;
    setAddingAdmin(true);
    try {
      const res = await fetch(`/api/admins/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", targetUserId: selectedMember.id })
      });
      if (!res.ok) throw new Error(await res.text());
      showToast(lang === 'tr' ? "Yönetici eklendi." : "Admin added.", "success");
      setShowWarningModal(false);
      setSelectedMember(null);
      // Wait a bit and refresh page to show new admin
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      showToast(lang === 'tr' ? "Hata oluştu" : "An error occurred", "error");
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (userId) => {
    try {
      const res = await fetch(`/api/admins/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", targetUserId: userId })
      });
      if (!res.ok) throw new Error(await res.text());
      showToast(lang === 'tr' ? "Yönetici kaldırıldı." : "Admin removed.", "success");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      showToast(lang === 'tr' ? "Hata oluştu" : "An error occurred", "error");
    }
  };

  const filteredMembers = (discordMembers || []).filter(m => 
    !authorizedUsers.includes(m.id) && 
    (m.username?.toLowerCase().includes(adminSearch.toLowerCase()) || m.global_name?.toLowerCase().includes(adminSearch.toLowerCase()))
  ).slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up pb-10">
      {/* Main Welcome Box */}
      <div className="md:col-span-2 glass-panel p-8 relative overflow-visible border border-primary-container/30 bg-primary-container/5 hover:border-primary-container transition-colors group">
        <div className="scanline"></div>
        <div className="absolute top-8 right-8 text-primary-container/10 group-hover:text-primary-container/30 transition-colors">
          <Star size={120} />
        </div>
        <div className="relative z-10">
          <h2 className="font-headline-lg text-2xl text-primary-container mb-4 flex items-center gap-3 uppercase tracking-tight">
            <Star size={24} className="fill-current" /> {lang === 'en' ? 'Overview' : 'Genel Bakış'}
          </h2>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mb-8 leading-relaxed">
            {lang === 'tr'
              ? 'Sunucu komuta merkezine hoş geldiniz. Entegrasyonları yapılandırın, şablonları yönetin ve performansı izleyin.'
              : 'Welcome to your server command center. Configure integrations, manage templates, and monitor performance.'}
          </p>

          <button className="px-8 py-3 bg-primary-container text-on-primary font-label-bold uppercase tracking-widest flex items-center gap-2 transition-all hover:brightness-110 active:scale-95 tactical-glow rounded-sm" onClick={() => setActiveTab('general')}>
            {lang === 'tr' ? 'Hızlı Kurulum' : 'Quick Setup'}
          </button>
        </div>
      </div>

      {/* Subscription Status Box */}
      <div className="glass-panel p-8 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors">
        <h3 className="font-headline-md text-xl text-on-surface mb-6 uppercase tracking-tight">
          {lang === 'tr' ? 'Abonelik Durumu' : 'Subscription Status'}
        </h3>
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded bg-surface border border-outline flex items-center justify-center shadow-lg" style={{ color: statusColor, borderColor: statusColor }}>
            <StatusIcon size={32} />
          </div>
          <div>
            <div className="font-headline-lg text-2xl uppercase tracking-tight" style={{ color: statusColor }}>{timeStatus}</div>
            <div className="font-label-sm text-sm text-on-surface-variant mt-1 uppercase tracking-widest">{statusDesc}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats Box */}
      <div className="glass-panel p-8 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors">
        <h3 className="font-headline-md text-xl text-on-surface mb-6 uppercase tracking-tight">
          {lang === 'tr' ? 'Sistem Durumu' : 'System Status'}
        </h3>
        <ul className="space-y-3">
           <li className={`flex items-center justify-between p-3 border rounded-sm font-label-bold text-sm uppercase tracking-widest ${settings?.albion_guild_id ? 'border-success/30 bg-success/5 text-success' : 'border-outline text-on-surface-variant'}`}>
             <span className="flex items-center gap-2">{settings?.albion_guild_id ? '✓' : '✗'} {lang === 'tr' ? 'Albion Lonca Bağlantısı' : 'Albion Guild Link'}</span>
             <span>{settings?.albion_guild_id ? (lang === 'tr' ? 'Bağlı' : 'Linked') : (lang === 'tr' ? 'Kurulum Bekliyor' : 'Setup Required')}</span>
           </li>
           <li className={`flex items-center justify-between p-3 border rounded-sm font-label-bold text-sm uppercase tracking-widest ${settings?.registration_enabled ? 'border-success/30 bg-success/5 text-success' : 'border-outline text-on-surface-variant'}`}>
             <span className="flex items-center gap-2">{settings?.registration_enabled ? '✓' : '✗'} {lang === 'tr' ? 'Kayıt (Registration) Sistemi' : 'Registration System'}</span>
             <span>{settings?.registration_enabled ? (lang === 'tr' ? 'Aktif' : 'Active') : (lang === 'tr' ? 'Kapalı' : 'Disabled')}</span>
           </li>
           <li className={`flex items-center justify-between p-3 border rounded-sm font-label-bold text-sm uppercase tracking-widest ${settings?.auto_check_enabled ? 'border-success/30 bg-success/5 text-success' : 'border-outline text-on-surface-variant'}`}>
             <span className="flex items-center gap-2">{settings?.auto_check_enabled ? '✓' : '✗'} {lang === 'tr' ? 'Otomatik Ayrılık Kontrolü' : 'Guild Leave Auto-Check'}</span>
             <span>{settings?.auto_check_enabled ? (lang === 'tr' ? 'Aktif' : 'Active') : (lang === 'tr' ? 'Kapalı' : 'Disabled')}</span>
           </li>
           <li className={`flex items-center justify-between p-3 border rounded-sm font-label-bold text-sm uppercase tracking-widest ${settings?.killboard_channel_id ? 'border-success/30 bg-success/5 text-success' : 'border-outline text-on-surface-variant'}`}>
             <span className="flex items-center gap-2">{settings?.killboard_channel_id ? '✓' : '✗'} {lang === 'tr' ? 'KillBoard Raporları' : 'KillBoard Reports'}</span>
             <span>{settings?.killboard_channel_id ? (lang === 'tr' ? 'Aktif' : 'Active') : (lang === 'tr' ? 'Kapalı' : 'Disabled')}</span>
           </li>
        </ul>
      </div>

      {/* Admin Management Box (Only visible to OWNER) */}
      {isOwner && (
        <div className="md:col-span-2 glass-panel p-8 relative overflow-visible border-t-4 border-t-error mt-4">
           <h3 className="font-headline-md text-xl text-error mb-2 uppercase tracking-tight flex items-center gap-2">
            <ShieldAlert size={24} /> {lang === 'tr' ? 'Yöneticiler (Sadece Size Görünür)' : 'Administrators (Only Visible to You)'}
           </h3>
           <p className="text-on-surface-variant text-sm mb-6">
             {lang === 'tr' 
               ? 'Buradan eklediğiniz kişiler web paneline sizin gibi giriş yapabilir ve tüm bot ayarlarını değiştirebilir. Eklediğiniz kişiler bu sekmeyi göremez.' 
               : 'People added here can log into the web dashboard just like you and change all bot settings. They cannot see this tab.'}
           </p>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Add Admin */}
             <div>
                <h4 className="font-label-bold text-on-surface mb-3 uppercase text-sm tracking-widest">
                  {lang === 'tr' ? 'Yönetici Ekle' : 'Add Admin'}
                </h4>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input 
                    type="text" 
                    placeholder={lang === 'tr' ? 'Discord İsmi Ara...' : 'Search Discord Name...'}
                    className="w-full bg-surface border border-outline text-on-surface pl-10 pr-4 py-3 rounded-sm focus:border-primary-container outline-none transition-colors"
                    value={adminSearch}
                    onChange={e => setAdminSearch(e.target.value)}
                  />
                </div>
                
                {adminSearch.length > 1 && (
                  <div className="mt-2 bg-surface border border-outline rounded-sm overflow-hidden shadow-lg max-h-[200px] overflow-y-auto">
                    {filteredMembers.map(m => (
                      <div key={m.id} className="flex items-center justify-between p-3 hover:bg-white/5 cursor-pointer border-b border-outline/50 last:border-0"
                        onClick={() => {
                          setSelectedMember(m);
                          setShowWarningModal(true);
                        }}
                      >
                        <div className="flex items-center gap-3">
                           {m.avatar ? (
                             <img src={`https://cdn.discordapp.com/avatars/${m.id}/${m.avatar}.png`} className="w-8 h-8 rounded-full" />
                           ) : (
                             <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container">
                               {m.username.charAt(0).toUpperCase()}
                             </div>
                           )}
                           <span className="font-label-bold text-sm">{m.global_name || m.username}</span>
                        </div>
                        <Plus size={16} className="text-success" />
                      </div>
                    ))}
                    {filteredMembers.length === 0 && (
                      <div className="p-4 text-center text-sm text-on-surface-variant">
                        {lang === 'tr' ? 'Kullanıcı bulunamadı veya zaten ekli.' : 'User not found or already added.'}
                      </div>
                    )}
                  </div>
                )}
             </div>

             {/* List Admins */}
             <div>
                <h4 className="font-label-bold text-on-surface mb-3 uppercase text-sm tracking-widest">
                  {lang === 'tr' ? 'Mevcut Yöneticiler' : 'Current Admins'}
                </h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {authorizedUsers.length === 0 ? (
                    <div className="p-4 border border-dashed border-outline-variant text-center text-sm text-on-surface-variant rounded-sm">
                      {lang === 'tr' ? 'Ekli yönetici yok.' : 'No admins added.'}
                    </div>
                  ) : (
                    authorizedUsers.map(adminId => {
                      // Try to find them in discordMembers to display their name
                      const member = (discordMembers || []).find(m => m.id === adminId);
                      return (
                        <div key={adminId} className="flex items-center justify-between p-3 bg-surface border border-outline rounded-sm">
                          <div className="flex items-center gap-3">
                             {member?.avatar ? (
                               <img src={`https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png`} className="w-8 h-8 rounded-full" />
                             ) : (
                               <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container text-xs">
                                 {member ? member.username.charAt(0).toUpperCase() : '?'}
                               </div>
                             )}
                             <div>
                               <div className="font-label-bold text-sm">{member?.global_name || member?.username || 'Unknown User'}</div>
                               <div className="text-[10px] text-on-surface-variant">{adminId}</div>
                             </div>
                          </div>
                          <button onClick={() => handleRemoveAdmin(adminId)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-sm transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
             </div>
           </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && selectedMember && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
           <div className="glass-panel w-full max-w-md p-6 border-2 border-error animate-slide-up relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-error"></div>
              <ShieldAlert size={48} className="text-error mx-auto mb-4" />
              <h2 className="text-2xl font-headline-md text-center text-on-surface mb-2">
                {lang === 'tr' ? 'DİKKAT!' : 'WARNING!'}
              </h2>
              <p className="text-center text-on-surface-variant mb-6 text-sm">
                {lang === 'tr' 
                  ? `Şu anda ${selectedMember.global_name || selectedMember.username} adlı kişiye sunucunuzun web paneli üzerinde TAM YETKİ veriyorsunuz. Bu kişi sizin adınıza kayıt kanallarını, rollerini değiştirebilir veya bot özelliklerini kapatabilir.`
                  : `You are giving FULL ACCESS to ${selectedMember.global_name || selectedMember.username} on your server's web dashboard. They will be able to change all settings and roles on your behalf.`}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowWarningModal(false)}
                  className="flex-1 py-3 border border-outline hover:bg-white/5 rounded-sm font-label-bold uppercase tracking-widest text-sm transition-colors"
                >
                  {lang === 'tr' ? 'İptal' : 'Cancel'}
                </button>
                <button 
                  onClick={handleAddAdmin}
                  disabled={addingAdmin}
                  className="flex-1 py-3 bg-error text-on-error hover:brightness-110 rounded-sm font-label-bold uppercase tracking-widest text-sm transition-colors disabled:opacity-50"
                >
                  {addingAdmin ? '...' : (lang === 'tr' ? 'Onaylıyorum' : 'I Confirm')}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
