"use client";

import { Activity, Plus, Trash2, Save, Info, AlertTriangle, Shield, MousePointerClick, RefreshCw, Hash, BarChart3, Users, Crown, Settings, FolderTree, FileText, Headphones } from "lucide-react";
import { useState } from "react";
import React from 'react';

const COUNTER_TYPES = [
  { id: 'all', labelTr: 'Toplam Üye (Botlar Dahil)', labelEn: 'All Members (incl. bots)', icon: Users, category: 'Member' },
  { id: 'members', labelTr: 'Sadece Üyeler', labelEn: 'Members Only', icon: Users, category: 'Member' },
  { id: 'bots', labelTr: 'Sadece Botlar', labelEn: 'Bots Only', icon: Shield, category: 'Member' },
  { id: 'online', labelTr: 'Aktif Üyeler', labelEn: 'Online Members', icon: Activity, category: 'Status' },
  { id: 'offline', labelTr: 'Çevrimdışı Üyeler', labelEn: 'Offline Members', icon: Activity, category: 'Status' },
  { id: 'connected', labelTr: 'Seslideki Üyeler', labelEn: 'Members in Voice', icon: Headphones, category: 'Status' },
  { id: 'boosts', labelTr: 'Boost Sayısı', labelEn: 'Boost Count', icon: Crown, category: 'Boost' },
  { id: 'tier', labelTr: 'Sunucu Seviyesi (Tier)', labelEn: 'Server Tier', icon: Crown, category: 'Boost' },
  { id: 'ticketopen', labelTr: 'Açık Biletler', labelEn: 'Open Tickets', icon: FileText, category: 'Ticket' },
  { id: 'ticketclosed', labelTr: 'Kapatılan Biletler', labelEn: 'Closed Tickets', icon: FileText, category: 'Ticket' },
  { id: 'channels', labelTr: 'Kanal Sayısı', labelEn: 'Channel Count', icon: Hash, category: 'Channel' },
  { id: 'roles', labelTr: 'Rol Sayısı', labelEn: 'Role Count', icon: Shield, category: 'Server' },
];

export default function CountersTab({ t, lang, settings, setSettings, discordChannels, handleSave, saving, guildId, showToast, isPremium }) {
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

  const handleAddCounter = () => {
    if (activeCountersArr.includes(selectedCounterType)) {
      if (showToast) showToast(lang === 'tr' ? 'Bu sayaç zaten ekli!' : 'This counter is already added!', 'error');
      return;
    }
    
    // Limit to 10 counters to avoid huge categories
    if (activeCountersArr.length >= 10) {
      if (showToast) showToast(lang === 'tr' ? 'En fazla 10 sayaç ekleyebilirsiniz.' : 'You can add a maximum of 10 counters.', 'error');
      return;
    }

    const updatedCounters = [...activeCountersArr, selectedCounterType];
    if (setSettings) setSettings({ ...(settings || {}), server_counters: updatedCounters });
    setAddingCounter(false);
    if (showToast) {
      const typeInfo = COUNTER_TYPES.find(c => c.id === selectedCounterType);
      const name = typeInfo ? (lang === 'tr' ? typeInfo.labelTr : typeInfo.labelEn) : selectedCounterType;
      showToast(lang === 'tr' ? `"${name}" eklendi! "Kurulumu Gönder" ile Discord'a uygulayabilirsiniz.` : `"${name}" added! Click "Deploy Counters" to apply.`, 'success');
    }
  };

  const handleRemoveCounter = (counterId) => {
    const updatedCounters = activeCountersArr.filter(id => id !== counterId);
    if (setSettings) setSettings({ ...(settings || {}), server_counters: updatedCounters });
  };

  const handleSetupCounters = async () => {
    let currentCounters = [...activeCountersArr];

    // If user opened addingCounter and has a counter selected, auto-add it
    if (addingCounter && selectedCounterType && !currentCounters.includes(selectedCounterType)) {
      currentCounters.push(selectedCounterType);
      if (setSettings) setSettings({ ...(settings || {}), server_counters: currentCounters });
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
      <div className="flex items-center justify-between p-4 glass-panel rounded-2xl border border-primary-container/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div>
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <BarChart3 className="text-primary-container" size={24} />
            {lang === 'tr' ? 'Sunucu Sayaçları (İstatistik Kanalları)' : 'Server Counters (Stat Channels)'}
          </h2>
          <p className="text-sm text-on-surface-variant max-w-2xl mt-1">
            {lang === 'tr' 
              ? 'Sunucu istatistiklerinizi canlı olarak ses kanallarında gösterin. Rate limit (Raid limit) yememek adına sayaçlar her 10 dakikada bir otomatik güncellenir.' 
              : 'Display server statistics live in voice channels. To avoid rate limits, counters are automatically updated every 10 minutes.'}
          </p>
        </div>
        <div className="flex gap-2">
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
                  {lang === 'tr' ? 'Boş bırakırsanız bot kendisi yeni bir kategori açar.' : 'If left empty, the bot will create a new category.'}
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
                  <option value="">{lang === 'tr' ? '-- Seçilmedi --' : '-- Not Selected --'}</option>
                  {categories.map((c) => (
                    <option key={c.id || Math.random()} value={c.id}>
                      {c.name || 'Unknown'}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-on-surface-variant/70">
                  {lang === 'tr' ? 'Açık biletleri saymak için biletlerin bulunduğu kategoriyi seçin.' : 'Select the category where tickets are located to count open tickets.'}
                </p>
              </div>
            </div>
          </div>
          
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
                 <span>{lang === 'tr' ? 'Eklediğiniz sayaçlar, sunucunuzda ses kanalı olarak gözükür.' : 'Added counters appear as voice channels in your server.'}</span>
               </li>
               <li className="flex items-start gap-2">
                 <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-container shrink-0" />
                 <span>{lang === 'tr' ? 'Kanallar kilitlidir, kimse giriş yapamaz.' : 'Channels are locked, no one can join.'}</span>
               </li>
               <li className="flex items-start gap-2">
                 <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-container shrink-0" />
                 <span>{lang === 'tr' ? 'Her 10 dakikada bir veriler güncellenir.' : 'Data is updated every 10 minutes.'}</span>
               </li>
               <li className="flex items-start gap-2">
                 <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                 <span>{lang === 'tr' ? 'Eğer sayaç kategorisi silinirse, "Kanalları Kur" butonuna basarak kanalları otomatik olarak yeni kategoriye taşıyabilirsiniz.' : 'If the counter category is deleted, click "Setup Channels" to automatically move open channels to a new category.'}</span>
               </li>
             </ul>
          </div>
        </div>

        {/* Right Column: Counters List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bento-card h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="bento-title mb-1">
                  <BarChart3 size={18} />
                  {lang === 'tr' ? 'Aktif Sayaçlar' : 'Active Counters'}
                </h3>
                <p className="bento-desc text-xs">
                  {lang === 'tr' ? `Mevcut sayaçlar: ${activeCountersArr.length}/10` : `Current counters: ${activeCountersArr.length}/10`}
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

            {addingCounter && (
              <div className="p-4 mb-4 rounded-xl bg-surface-container-highest/50 border border-outline-variant/30 flex items-end gap-3 animate-slide-up">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    {lang === 'tr' ? 'Sayaç Türü' : 'Counter Type'}
                  </label>
                  <select
                    value={selectedCounterType}
                    onChange={(e) => setSelectedCounterType(e.target.value)}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg p-2.5 text-sm text-on-surface focus:outline-none focus:border-primary-container/50 transition-all appearance-none"
                  >
                    {COUNTER_TYPES.map(ct => (
                      <option key={ct.id} value={ct.id}>
                        [{ct.category}] {lang === 'tr' ? ct.labelTr : ct.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddCounter}
                  className="px-4 py-2.5 bg-primary-container text-on-primary rounded-lg font-bold text-sm shadow-md hover:brightness-110 transition-all shrink-0"
                >
                  {lang === 'tr' ? 'Ekle' : 'Add'}
                </button>
              </div>
            )}

            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar max-h-[500px] pr-2">
              {activeCountersArr.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant/50 border-2 border-dashed border-outline-variant/20 rounded-xl">
                  <Activity size={32} className="mb-2 opacity-20" />
                  <p className="text-sm">{lang === 'tr' ? 'Henüz sayaç eklenmemiş.' : 'No counters added yet.'}</p>
                </div>
              ) : (
                activeCountersArr.map((counterId, index) => {
                  const typeInfo = COUNTER_TYPES.find(c => c.id === counterId);
                  const displayLabel = typeInfo ? (lang === 'tr' ? typeInfo.labelTr : typeInfo.labelEn) : counterId;
                  const Icon = typeInfo?.icon || Hash;
                  
                  return (
                    <div key={`${counterId}-${index}`} className="flex items-center justify-between p-3 rounded-xl bg-surface-container/50 border border-outline-variant/20 hover:border-outline-variant/40 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary-container shrink-0">
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-on-surface">
                            {displayLabel}
                          </div>
                          <div className="text-xs text-on-surface-variant">
                            {typeInfo ? `ID: ${typeInfo.id}` : 'Custom'}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveCounter(counterId)}
                        className="p-2 rounded-lg text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100"
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
