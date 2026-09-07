"use client";

import { 
  Activity, Plus, Trash2, Save, Info, AlertTriangle, Shield, 
  MousePointerClick, RefreshCw, Hash, BarChart3, Users, Crown, 
  Settings, FolderTree, FileText, Headphones, UserCheck, UserX, 
  UserMinus, Radio, Gamepad2, Sparkles, Smile, MessageSquare, 
  Volume2, Ban, Clock, Layers, Megaphone 
} from "lucide-react";
import { useState } from "react";
import React from 'react';
import Link from 'next/link';

export const COUNTER_CATEGORIES = [
  { id: 'member', nameTr: '👥 Üye Sayaçları', nameEn: '👥 Member Counters' },
  { id: 'role', nameTr: '🛡️ Rol Sayaçları', nameEn: '🛡️ Role Counters' },
  { id: 'status', nameTr: '🟢 Durum Sayaçları (⭐ Premium)', nameEn: '🟢 Status Counters (⭐ Premium)' },
  { id: 'ticket', nameTr: '🎫 Destek Talebi Sayaçları', nameEn: '🎫 Ticket Counters' },
  { id: 'channel', nameTr: '📁 Kanal & Kategori Sayaçları', nameEn: '📁 Channel & Category Counters' },
  { id: 'boost', nameTr: '🚀 Takviye (Boost) Sayaçları', nameEn: '🚀 Boost Counters' },
  { id: 'emoji', nameTr: '😀 Emoji & Çıkartma Sayaçları', nameEn: '😀 Emoji & Sticker Counters' },
];

export const COUNTER_TYPES = [
  // 1. Üye Sayaçları
  { id: 'all', category: 'member', labelTr: 'Toplam Üye (Botlar Dahil)', labelEn: 'All Members (incl. bots)', icon: Users, isPremium: false },
  { id: 'members', category: 'member', labelTr: 'Sadece Üyeler (Kullanıcılar)', labelEn: 'Members Only', icon: UserCheck, isPremium: false },
  { id: 'bots', category: 'member', labelTr: 'Sadece Botlar', labelEn: 'Bots Only', icon: Shield, isPremium: false },
  { id: 'bans', category: 'member', labelTr: 'Yasaklı Üyeler', labelEn: 'Banned Members', icon: Ban, isPremium: true },
  { id: 'pending', category: 'member', labelTr: 'Bekleyen Üyeler (Onay Aşamasında)', labelEn: 'Pending Members', icon: Clock, isPremium: false },

  // 2. Rol Sayaçları
  { id: 'roles', category: 'role', labelTr: 'Toplam Roller', labelEn: 'Roles in the Server', icon: Shield, isPremium: false },
  { id: 'role', category: 'role', labelTr: 'Rollü Üyeler', labelEn: 'Members with Roles', icon: Users, isPremium: false },
  { id: 'norole', category: 'role', labelTr: 'Rolsüz Üyeler', labelEn: 'Members Without Any Roles', icon: UserMinus, isPremium: false },
  { id: 'onlinerole', category: 'role', labelTr: 'Aktif Rollü Üyeler', labelEn: 'Online with Roles', icon: Activity, isPremium: true },
  { id: 'offlinerole', category: 'role', labelTr: 'Çevrimdışı Rollü Üyeler', labelEn: 'Offline with Roles', icon: UserX, isPremium: true },

  // 3. Durum Sayaçları (Status - Hepsi Premium ⭐)
  { id: 'online', category: 'status', labelTr: 'Aktif Üyeler (Botlar Dahil)', labelEn: 'Online Members (incl. bots)', icon: Activity, isPremium: true },
  { id: 'offline', category: 'status', labelTr: 'Çevrimdışı Üyeler', labelEn: 'Offline Members', icon: UserX, isPremium: true },
  { id: 'dnd', category: 'status', labelTr: 'Rahatsız Etmeyin (DND)', labelEn: 'DND Members Only', icon: Ban, isPremium: true },
  { id: 'idle', category: 'status', labelTr: 'Boşta Olan Üyeler (Idle)', labelEn: 'Idle Members Only', icon: Clock, isPremium: true },
  { id: 'streaming', category: 'status', labelTr: 'Yayında Olanlar (Streaming)', labelEn: 'Members Streaming', icon: Radio, isPremium: true },
  { id: 'playing', category: 'status', labelTr: 'Oyunda Olanlar (Playing)', labelEn: 'Members Playing Game', icon: Gamepad2, isPremium: true },
  { id: 'onlinebot', category: 'status', labelTr: 'Aktif Botlar', labelEn: 'Online Bots Only', icon: Shield, isPremium: true },
  { id: 'status', category: 'status', labelTr: 'Özel Durumu Olanlar (Custom Status)', labelEn: 'Members with a Status', icon: MessageSquare, isPremium: true },

  // 4. Bilet / Destek Sayaçları
  { id: 'ticketopen', category: 'ticket', labelTr: 'Açık Biletler', labelEn: 'Open Tickets', icon: FileText, isPremium: false },
  { id: 'ticketcreated', category: 'ticket', labelTr: 'Oluşturulan Toplam Biletler', labelEn: 'Created Tickets', icon: Layers, isPremium: false },
  { id: 'ticketclosed', category: 'ticket', labelTr: 'Kapatılan Biletler', labelEn: 'Closed Tickets', icon: FileText, isPremium: false },
  { id: 'ticketrenamed', category: 'ticket', labelTr: 'Adı Değişen Biletler', labelEn: 'Renamed Tickets', icon: FileText, isPremium: false },

  // 5. Kanal ve Kategori Sayaçları
  { id: 'connected', category: 'channel', labelTr: 'Seslideki Üyeler', labelEn: 'Members in Voice Channels', icon: Headphones, isPremium: true },
  { id: 'channels', category: 'channel', labelTr: 'Kanallar (Kategori Hariç)', labelEn: 'Channels (excl. categories)', icon: Hash, isPremium: false },
  { id: 'parent', category: 'channel', labelTr: 'Kategori İçi Kanallar', labelEn: 'Channels Under a Category', icon: FolderTree, isPremium: false },
  { id: 'text', category: 'channel', labelTr: 'Metin Kanalları', labelEn: 'Text Channels Only', icon: MessageSquare, isPremium: false },
  { id: 'voice', category: 'channel', labelTr: 'Ses Kanalları', labelEn: 'Voice Channels Only', icon: Volume2, isPremium: false },
  { id: 'categories', category: 'channel', labelTr: 'Kategoriler', labelEn: 'Categories Only', icon: FolderTree, isPremium: false },
  { id: 'announcement', category: 'channel', labelTr: 'Duyuru Kanalları', labelEn: 'Announcement Channels Only', icon: Megaphone, isPremium: false },
  { id: 'staging', category: 'channel', labelTr: 'Sahne Kanalları', labelEn: 'Staging Channels Only', icon: Radio, isPremium: false },

  // 6. Boost Sayaçları
  { id: 'boosts', category: 'boost', labelTr: 'Sunucu Boost Sayısı', labelEn: 'Server Boost Count', icon: Crown, isPremium: false },
  { id: 'tier', category: 'boost', labelTr: 'Sunucu Seviyesi (Tier)', labelEn: 'Server Boost Tier', icon: Crown, isPremium: false },

  // 7. Emoji ve Çıkartma Sayaçları
  { id: 'emojis', category: 'emoji', labelTr: 'Toplam Emojiler', labelEn: 'Emojis in Server', icon: Smile, isPremium: false },
  { id: 'static', category: 'emoji', labelTr: 'Statik (Hareketsiz) Emojiler', labelEn: 'Static Emojis Only', icon: Smile, isPremium: false },
  { id: 'animated', category: 'emoji', labelTr: 'Hareketli (GIF) Emojiler', labelEn: 'Animated Emojis Only', icon: Sparkles, isPremium: false },
  { id: 'stickers', category: 'emoji', labelTr: 'Sunucu Çıkartmaları', labelEn: 'Stickers in Server', icon: Sparkles, isPremium: false },
];

export default function CountersTab({ t, lang, settings, setSettings, discordChannels, discordRoles, handleSave, saving, guildId, showToast, isPremium }) {
  const [addingCounter, setAddingCounter] = useState(false);
  const [selectedCounterType, setSelectedCounterType] = useState(COUNTER_TYPES[0].id);
  const [settingUp, setSettingUp] = useState(false);

  let activeCounters = [];
  try {
    if (Array.isArray(settings?.server_counters)) {
      activeCounters = settings.server_counters;
    } else if (typeof settings?.server_counters === 'string') {
      activeCounters = JSON.parse(settings.server_counters);
    }
  } catch (e) {
    activeCounters = [];
  }
  if (!Array.isArray(activeCounters)) activeCounters = [];
  
  const activeCountersArr = Array.isArray(activeCounters) ? activeCounters : [];
  const channelsArr = Array.isArray(discordChannels) ? discordChannels : [];
  const categories = channelsArr.filter(c => c?.type === 4);

  const maxCounters = isPremium ? 25 : 5;
  const selectedInfo = COUNTER_TYPES.find(c => c.id === selectedCounterType);

  const handleAddCounter = () => {
    if (activeCountersArr.includes(selectedCounterType)) {
      if (showToast) showToast(lang === 'tr' ? 'Bu sayaç zaten ekli!' : 'This counter is already added!', 'error');
      return;
    }
    
    // Premium feature enforcement
    if (selectedInfo?.isPremium && !isPremium) {
      if (showToast) {
        showToast(
          lang === 'tr' 
            ? '⭐ Bu sayaç bir Premium özelliktir! Kullanabilmek için sunucunuzu Premium plana yükseltin.' 
            : '⭐ This counter is a Premium feature! Upgrade your server to Premium to use it.', 
          'error'
        );
      }
      return;
    }

    // Limit check
    if (activeCountersArr.length >= maxCounters) {
      if (showToast) {
        showToast(
          !isPremium 
            ? (lang === 'tr' ? 'Ücretsiz planda en fazla 5 sayaç ekleyebilirsiniz. 25 sayaç ve tüm özellikler için Premium\'a geçin!' : 'Free plan allows up to 5 counters. Upgrade to Premium for 25 counters!') 
            : (lang === 'tr' ? 'En fazla 25 sayaç ekleyebilirsiniz.' : 'You can add a maximum of 25 counters.'), 
          'error'
        );
      }
      return;
    }

    const updatedCounters = [...activeCountersArr, selectedCounterType];
    if (setSettings) setSettings({ ...(settings || {}), server_counters: updatedCounters });
    setAddingCounter(false);
    if (showToast) {
      const name = selectedInfo ? (lang === 'tr' ? selectedInfo.labelTr : selectedInfo.labelEn) : selectedCounterType;
      showToast(
        lang === 'tr' 
          ? `"${name}" eklendi! "Kurulumu Gönder" butonuna basarak Discord'a uygulayabilirsiniz.` 
          : `"${name}" added! Click "Deploy Counters" to apply.`, 
        'success'
      );
    }
  };

  const handleRemoveCounter = (counterId) => {
    const updatedCounters = activeCountersArr.filter(id => id !== counterId);
    if (setSettings) setSettings({ ...(settings || {}), server_counters: updatedCounters });
  };

  const handleSetupCounters = async () => {
    let currentCounters = [...activeCountersArr];

    // If user opened addingCounter and has a counter selected, auto-add it if eligible
    if (addingCounter && selectedCounterType && !currentCounters.includes(selectedCounterType)) {
      if (!selectedInfo?.isPremium || isPremium) {
        if (currentCounters.length < maxCounters) {
          currentCounters.push(selectedCounterType);
          if (setSettings) setSettings({ ...(settings || {}), server_counters: currentCounters });
        }
      }
      setAddingCounter(false);
    }

    if (currentCounters.length === 0) {
      if (showToast) showToast(lang === 'tr' ? 'Lütfen önce en az bir sayaç ekleyin!' : 'Please add at least one counter first!', 'error');
      return;
    }
    
    setSettingUp(true);
    try {
      const ok = await handleSave({ 
        server_counters: currentCounters,
        trigger_counters_setup: true 
      });
      if (ok && showToast) {
        showToast(
          lang === 'tr' 
            ? 'Kurulum talebi bot\'a iletildi! Kanallar birazdan Discord sunucunuzda oluşturulacak.' 
            : 'Setup request sent to bot! Channels will be created on your Discord server shortly.', 
          'success'
        );
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast(err.message || (lang === 'tr' ? 'Bir hata oluştu!' : 'An error occurred!'), 'error');
    } finally {
      setSettingUp(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 glass-panel rounded-2xl border border-primary-container/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary-container/10 rounded-full blur-[90px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div>
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <BarChart3 className="text-primary-container" size={24} />
            {lang === 'tr' ? 'Sunucu Sayaçları (İstatistik Kanalları)' : 'Server Counters (Stat Channels)'}
            {isPremium && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                ⭐ Premium
              </span>
            )}
          </h2>
          <p className="text-sm text-on-surface-variant max-w-2xl mt-1">
            {lang === 'tr' 
              ? 'Sunucu istatistiklerinizi canlı olarak ses kanallarında gösterin. Rate limit (Raid limit) yememek adına sayaçlar her 10 dakikada bir otomatik güncellenir.' 
              : 'Display server statistics live in voice channels. To avoid rate limits, counters are automatically updated every 10 minutes.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSetupCounters}
            disabled={settingUp || saving || (activeCountersArr.length === 0 && !addingCounter)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 ${
              settingUp || saving || (activeCountersArr.length === 0 && !addingCounter)
                ? "bg-surface-container-highest text-on-surface-variant opacity-50 cursor-not-allowed"
                : "bg-primary-container text-on-primary hover:brightness-110 shadow-primary-container/20 cursor-pointer"
            }`}
          >
            {settingUp ? <RefreshCw className="animate-spin" size={16} /> : <Activity size={16} />}
            {settingUp 
              ? (lang === 'tr' ? 'Kurulum Gönderiliyor...' : 'Deploying...') 
              : (lang === 'tr' ? 'Kurulumu Gönder' : 'Deploy Counters')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Settings */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bento-card">
            <h3 className="bento-title">
              <Settings size={18} />
              {lang === 'tr' ? 'Genel Ayarlar' : 'General Settings'}
            </h3>
            <p className="bento-desc mb-4">
              {lang === 'tr' ? 'Sayaçların barınacağı kategori ayarları.' : 'Settings for the category where counters will be hosted.'}
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                  <FolderTree size={14} className="text-primary-container" />
                  {lang === 'tr' ? 'Sayaç Kategorisi' : 'Counters Category'}
                </label>
                <select
                  value={settings?.counters_category_id || ""}
                  onChange={(e) => setSettings && setSettings({ ...settings, counters_category_id: e.target.value })}
                  className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary-container/50 transition-all appearance-none"
                >
                  <option value="">{lang === 'tr' ? '-- Bot Otomatik Oluştursun --' : '-- Let Bot Auto-Create --'}</option>
                  {categories.map((c) => (
                    <option key={c.id || Math.random()} value={c.id}>
                      {c.name || 'Unknown'}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-on-surface-variant/70">
                  {lang === 'tr' ? 'Boş bırakırsanız bot otomatik olarak "📊 SUNUCU İSTATİSTİKLERİ" kategorisi açar.' : 'If left empty, the bot will auto-create a category.'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                  <FolderTree size={14} className="text-emerald-400" />
                  {lang === 'tr' ? 'Hedef Bilet Kategorisi (Ticket Counters)' : 'Target Ticket Category'}
                </label>
                <select
                  value={settings?.counter_ticket_category_id || ""}
                  onChange={(e) => setSettings && setSettings({ ...settings, counter_ticket_category_id: e.target.value })}
                  className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-emerald-500/50 transition-all appearance-none"
                >
                  <option value="">{lang === 'tr' ? '-- Seçilmedi (Tüm Sunucu) --' : '-- Not Selected (All Server) --'}</option>
                  {categories.map((c) => (
                    <option key={c.id || Math.random()} value={c.id}>
                      {c.name || 'Unknown'}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-on-surface-variant/70">
                  {lang === 'tr' ? 'Bilet sayaçlarının doğru sayması için biletlerin açıldığı kategoriyi belirleyebilirsiniz.' : 'Select the category where tickets are created for precise counting.'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                  <Shield size={14} className="text-violet-400" />
                  {lang === 'tr' ? '🎯 Hedef Rol (Özel Rol Sayacı)' : '🎯 Target Role (Role Counter)'}
                </label>
                <select
                  value={settings?.counter_role_id || ""}
                  onChange={(e) => setSettings && setSettings({ ...settings, counter_role_id: e.target.value })}
                  className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-violet-500/50 transition-all appearance-none"
                >
                  <option value="">{lang === 'tr' ? '-- Seçilmedi (Herhangi Bir Rolü Olanlar) --' : '-- Not Selected (Any Role) --'}</option>
                  {(Array.isArray(discordRoles) ? discordRoles : []).map((r) => (
                    <option key={r.id || Math.random()} value={r.id}>
                      @{r.name || 'Unknown Role'}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-on-surface-variant/70">
                  {lang === 'tr' ? 'Buradan bir rol seçerseniz, "Rollü Üyeler" (veya Aktif/Çevrimdışı Rollü) sayaçları sadece bu role sahip üyeleri sayar.' : 'If selected, role counters will count members of this specific role.'}
                </p>
              </div>
            </div>
          </div>

          {/* Premium Callout if not premium */}
          {!isPremium && (
            <div className="bento-card border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-surface-container to-surface-container-high relative overflow-hidden">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1.5">
                <Crown size={18} />
                {lang === 'tr' ? '⭐ Premium ile 25 Sayaç & Tüm Özellikler' : '⭐ Premium: 25 Counters & All Features'}
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                {lang === 'tr'
                  ? 'Ücretsiz planda 5 sayaç sınırı vardır. Yıldızlı (⭐) durum sayaçları (Aktif/DND/Oyun/Yayın), Seslideki Üyeler ve Yasaklılar sayaçlarını kullanabilmek için Premium plana geçin.'
                  : 'Free plan has a 5 counter limit. Upgrade to Premium to unlock starred (⭐) status counters, voice members, and bans.'}
              </p>
              <Link
                href="/premium"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md"
              >
                <Crown size={14} />
                {lang === 'tr' ? 'Premium Paketleri İncele' : 'View Premium Plans'}
              </Link>
            </div>
          )}
          
          <div className="bento-card bg-primary-container/5 border-primary-container/20 relative overflow-hidden">
             <div className="absolute -top-10 -right-10 text-primary-container/10">
                <Info size={120} />
             </div>
             <h3 className="bento-title text-primary-container relative z-10">
               <Info size={18} />
               {lang === 'tr' ? 'Nasıl Çalışır?' : 'How it works?'}
             </h3>
             <ul className="text-sm text-on-surface-variant space-y-2 mt-3 relative z-10">
               <li className="flex items-start gap-2">
                 <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-container shrink-0" />
                 <span>{lang === 'tr' ? 'Eklediğiniz sayaçlar, sunucunuzda kilitli ses kanalları olarak listelenir.' : 'Added counters appear as locked voice channels in your server.'}</span>
               </li>
               <li className="flex items-start gap-2">
                 <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-container shrink-0" />
                 <span>{lang === 'tr' ? 'Kanallar kilitlidir, üyeler giriş yapamaz.' : 'Channels are locked, members cannot join.'}</span>
               </li>
               <li className="flex items-start gap-2">
                 <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-container shrink-0" />
                 <span>{lang === 'tr' ? 'Discord limitlerine takılmamak için veriler 10 dakikada bir otomatik güncellenir.' : 'Data updates automatically every 10 minutes to respect Discord rate limits.'}</span>
               </li>
               <li className="flex items-start gap-2">
                 <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                 <span>{lang === 'tr' ? 'Yıldızlı (⭐) sayaçlar sadece Premium sunucularda aktiftir.' : 'Starred (⭐) counters are active only for Premium servers.'}</span>
               </li>
             </ul>
          </div>
        </div>

        {/* Right Column: Counters List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bento-card h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="bento-title mb-1 flex items-center gap-2">
                  <BarChart3 size={18} />
                  {lang === 'tr' ? 'Aktif Sayaçlar' : 'Active Counters'}
                </h3>
                <p className="bento-desc text-xs flex items-center gap-2">
                  <span>
                    {lang === 'tr' ? `Mevcut Sayaçlar: ${activeCountersArr.length}/${maxCounters}` : `Current Counters: ${activeCountersArr.length}/${maxCounters}`}
                  </span>
                  {!isPremium && (
                    <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      {lang === 'tr' ? 'Ücretsiz Plan (Maks 5)' : 'Free Plan (Max 5)'}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setAddingCounter(!addingCounter)}
                className="px-3 py-1.5 bg-surface-container-highest hover:bg-primary-container/20 text-primary-container rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Plus size={14} />
                {lang === 'tr' ? 'Yeni Ekle' : 'Add New'}
              </button>
            </div>

            {/* Add Counter Panel */}
            {addingCounter && (
              <div className="p-4 mb-4 rounded-xl bg-surface-container-highest/60 border border-outline-variant/40 flex flex-col gap-3 animate-slide-up shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                      <span>{lang === 'tr' ? 'Sayaç Türü Seçin' : 'Select Counter Type'}</span>
                      <span className="text-[10px] font-normal text-on-surface-variant/70">
                        {lang === 'tr' ? 'Toplam 36 Farklı Sayaç' : '36 Total Counters'}
                      </span>
                    </label>
                    <select
                      value={selectedCounterType}
                      onChange={(e) => setSelectedCounterType(e.target.value)}
                      className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary-container/60 transition-all"
                    >
                      {COUNTER_CATEGORIES.map(category => {
                        const items = COUNTER_TYPES.filter(ct => ct.category === category.id);
                        if (items.length === 0) return null;
                        return (
                          <optgroup key={category.id} label={lang === 'tr' ? category.nameTr : category.nameEn}>
                            {items.map(ct => {
                              const isLocked = ct.isPremium && !isPremium;
                              return (
                                <option 
                                  key={ct.id} 
                                  value={ct.id}
                                  disabled={isLocked}
                                >
                                  {ct.isPremium ? '⭐ ' : '• '}
                                  {lang === 'tr' ? ct.labelTr : ct.labelEn}
                                  {ct.isPremium ? (isLocked ? ' (⭐ Premium Gerekli)' : ' (⭐ Premium)') : ''}
                                </option>
                              );
                            })}
                          </optgroup>
                        );
                      })}
                    </select>
                  </div>
                  <button
                    onClick={handleAddCounter}
                    className="px-5 py-3 bg-primary-container text-on-primary rounded-xl font-bold text-sm shadow-md hover:brightness-110 active:scale-95 transition-all shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <Plus size={16} />
                    {lang === 'tr' ? 'Listeye Ekle' : 'Add to List'}
                  </button>
                </div>

                {/* Star warning note if selected is premium and user is not premium */}
                {selectedInfo?.isPremium && !isPremium && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                    <AlertTriangle size={14} className="shrink-0 text-amber-400" />
                    <span>
                      {lang === 'tr'
                        ? 'Bu sayaç ⭐ Premium bir özelliktir. Sunucunuzda kullanabilmek için Premium aboneliği gereklidir.'
                        : 'This counter is a ⭐ Premium feature. Premium subscription is required to use it.'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Counter List */}
            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar max-h-[520px] pr-2">
              {activeCountersArr.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant/50 border-2 border-dashed border-outline-variant/20 rounded-xl">
                  <Activity size={32} className="mb-2 opacity-20" />
                  <p className="text-sm font-medium">{lang === 'tr' ? 'Henüz sayaç eklenmemiş.' : 'No counters added yet.'}</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">
                    {lang === 'tr' ? '"Yeni Ekle" butonuna tıklayarak ilk sayacınızı oluşturun.' : 'Click "Add New" to create your first counter.'}
                  </p>
                </div>
              ) : (
                activeCountersArr.map((counterId, index) => {
                  const typeInfo = COUNTER_TYPES.find(c => c.id === counterId);
                  const displayLabel = typeInfo ? (lang === 'tr' ? typeInfo.labelTr : typeInfo.labelEn) : counterId;
                  const Icon = typeInfo?.icon || Hash;
                  const isPremLocked = typeInfo?.isPremium && !isPremium;
                  
                  return (
                    <div 
                      key={`${counterId}-${index}`} 
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all group ${
                        isPremLocked 
                          ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                          : 'bg-surface-container/60 border-outline-variant/20 hover:border-outline-variant/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          typeInfo?.isPremium 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'bg-surface-container-highest text-primary-container'
                        }`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-on-surface flex items-center gap-2">
                            <span>{displayLabel}</span>
                            {typeInfo?.isPremium && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isPremium 
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                                  : 'bg-error/10 text-error border border-error/30'
                              }`}>
                                ⭐ {isPremium ? 'Premium' : (lang === 'tr' ? 'Premium Gerekli' : 'Premium Required')}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-on-surface-variant flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[11px] opacity-70">ID: {counterId}</span>
                            {typeInfo?.category && (
                              <span className="opacity-50">• {typeInfo.category.toUpperCase()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveCounter(counterId)}
                        className="p-2 rounded-lg text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        title={lang === 'tr' ? 'Kaldır' : 'Remove'}
                      >
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
    </div>
  );
}
