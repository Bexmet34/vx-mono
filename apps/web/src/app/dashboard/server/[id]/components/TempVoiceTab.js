"use client";

import React, { useState } from "react";
import { Plus, Settings, Trash2, ArrowLeft, Headphones, Sliders, Shield, MoreHorizontal, HelpCircle, FileText } from "lucide-react";

export default function TempVoiceTab({ t, lang, settings, setSettings, discordChannels, isPremium, guildId }) {
  const [editingCreatorId, setEditingCreatorId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("overview");

  // Temporary local state for the creators if it's not yet in main settings
  const creators = settings.tempvoice_creators || [];

  const handleAddCreator = () => {
    const newCreator = {
      id: Date.now().toString(),
      name: "Open-Audio-Channel",
      channelNameFormat: "CONTENT - {NUMBER}",
      userLimit: 99,
      categoryId: "",
      bitrate: "64kbps",
      position: "Altta"
    };
    setSettings({
      ...settings,
      tempvoice_creators: [...creators, newCreator]
    });
    setEditingCreatorId(newCreator.id);
  };

  const handleUpdateCreator = (id, updates) => {
    setSettings({
      ...settings,
      tempvoice_creators: creators.map(c => c.id === id ? { ...c, ...updates } : c)
    });
  };

  const handleDeleteCreator = (id) => {
    setSettings({
      ...settings,
      tempvoice_creators: creators.filter(c => c.id !== id)
    });
  };

  if (editingCreatorId) {
    const creator = creators.find(c => c.id === editingCreatorId);
    if (!creator) return null;

    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-on-surface-variant font-label-bold text-[10px] uppercase tracking-widest bg-surface-container/50 p-2 rounded-lg border border-outline-variant/30 w-fit">
            <button onClick={() => setEditingCreatorId(null)} className="hover:text-primary-container transition-colors">
                ...
            </button>
            <span className="opacity-50">&gt;</span>
            <button onClick={() => setEditingCreatorId(null)} className="hover:text-primary-container transition-colors">
                {lang === 'tr' ? 'Sunucu Ayarları' : 'Server Settings'}
            </button>
            <span className="opacity-50">&gt;</span>
            <span className="text-on-surface bg-surface border border-outline-variant px-2 py-0.5 rounded">
                {lang === 'tr' ? 'Oluşturucu Ayarları' : 'Creator Settings'}
            </span>
            </div>

            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Plus size={36} className="text-on-surface-variant" />
                    <span className="text-on-surface-variant text-3xl font-light">•</span>
                    <h2 className="text-4xl font-headline-xl text-on-surface tracking-tight font-bold">
                        {creator.name}
                    </h2>
                </div>
            </div>
        </div>

        {/* Sub Tabs */}
        <div className="flex gap-2 mb-2">
          {[
            { id: 'overview', label: lang === 'tr' ? 'Genel Bakış' : 'Overview', icon: FileText },
            { id: 'permissions', label: lang === 'tr' ? 'İzinler' : 'Permissions', icon: FileText },
            { id: 'moderation', label: lang === 'tr' ? 'Moderasyon' : 'Moderation', icon: Shield },
            { id: 'others', label: lang === 'tr' ? 'Diğerleri' : 'Others', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-label-bold uppercase tracking-widest transition-all ${
                activeSubTab === tab.id
                  ? "bg-surface text-on-surface border border-outline-variant/60 shadow-sm"
                  : "text-on-surface-variant hover:bg-white/5 border border-transparent hover:text-on-surface"
              }`}
            >
              <tab.icon size={14} className={activeSubTab === tab.id ? "text-on-surface" : "text-on-surface-variant"} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeSubTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="flex flex-col gap-6">
              {/* Channel Name */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
                  <Headphones size={18} />
                  {lang === 'tr' ? 'Geçici Kanalın Adı' : 'Temp Channel Name'}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={creator.channelNameFormat}
                    onChange={(e) => handleUpdateCreator(creator.id, { channelNameFormat: e.target.value })}
                    className="flex-1 bg-surface-container/30 border border-outline-variant rounded-lg p-3 text-on-surface text-sm focus:border-primary-container outline-none transition-all shadow-inner"
                  />
                  <button className="p-3 bg-surface-container/30 border border-outline-variant rounded-lg hover:border-primary-container text-on-surface hover:text-primary-container transition-all flex items-center justify-center min-w-[44px]">
                    {"{}"}
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {lang === 'tr' ? 'Geçici kanallar oluşturulduğunda varsayılan olarak kullanılacak kanal adını belirleyin. ' : 'Set the default channel name format for temporary channels. '}
                  <a href="#" className="text-[#FF3366] hover:underline">{lang === 'tr' ? 'Daha fazlasını öğrenin.' : 'Learn more.'}</a>
                </p>
              </div>

              {/* User Limit */}
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
                  <Shield size={18} />
                  {lang === 'tr' ? 'Geçici Kanalın Kullanıcı Limiti' : 'Temp Channel User Limit'}
                  <span className="bg-[#FF3366] text-white px-2 py-0.5 rounded text-[10px] ml-1 font-bold">
                    {creator.userLimit}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mt-2">
                    <input
                        type="range"
                        min="0"
                        max="99"
                        value={creator.userLimit}
                        onChange={(e) => handleUpdateCreator(creator.id, { userLimit: parseInt(e.target.value) })}
                        className="w-full accent-[#FF3366] h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #FF3366 ${(creator.userLimit / 99) * 100}%, #2A2A2A ${(creator.userLimit / 99) * 100}%)`
                        }}
                    />
                    <div className="shrink-0 p-2 bg-surface-container/30 border border-outline-variant rounded-lg text-on-surface-variant rotate-45 transform">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    </div>
                </div>
                
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {lang === 'tr' ? 'Geçici kanalların varsayılan olarak belirleneceği kullanıcı limitini ayarlayın. ' : 'Set the default user limit for temporary channels. '}
                  <a href="#" className="text-[#FF3366] hover:underline bg-[#FF3366]/10 px-1 py-0.5 rounded">{lang === 'tr' ? 'Daha fazlasını öğrenin.' : 'Learn more.'}</a>
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-8">
              {/* Category */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="9" y1="14" x2="15" y2="14"></line></svg>
                  {lang === 'tr' ? 'Geçici Kanalın Kategorisi' : 'Temp Channel Category'}
                </div>
                <div className="flex gap-2">
                    <select
                    value={creator.categoryId}
                    onChange={(e) => handleUpdateCreator(creator.id, { categoryId: e.target.value })}
                    className="flex-1 bg-surface-container/30 border border-outline-variant rounded-lg p-3 text-on-surface text-sm focus:border-primary-container outline-none transition-all appearance-none"
                    >
                    <option value="">{lang === 'tr' ? 'Kategori Seçin' : 'Select Category'}</option>
                    {discordChannels?.filter(c => c.type === 4).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    </select>
                    <button className="p-3 bg-surface-container/30 border border-outline-variant rounded-lg text-[#FF3366] hover:bg-[#FF3366]/10 transition-all flex items-center justify-center min-w-[44px]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </button>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {lang === 'tr' ? 'Geçici kanalların oluşturulacağı kategoriyi seçin. ' : 'Select the category where temp channels will be created. '}
                  <a href="#" className="text-[#FF3366] hover:underline">{lang === 'tr' ? 'Daha fazlasını öğrenin.' : 'Learn more.'}</a>
                </p>
              </div>

              {/* Bitrate */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
                  <HelpCircle size={18} />
                  {lang === 'tr' ? 'Geçici Kanalın Bit Hızı' : 'Temp Channel Bitrate'}
                </div>
                <select
                  value={creator.bitrate}
                  onChange={(e) => handleUpdateCreator(creator.id, { bitrate: e.target.value })}
                  className="w-full bg-surface-container/30 border border-outline-variant rounded-lg p-3 text-on-surface text-sm focus:border-primary-container outline-none transition-all appearance-none"
                >
                  <option value="64kbps">64kbps</option>
                  <option value="96kbps">96kbps</option>
                  <option value="128kbps">128kbps</option>
                </select>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {lang === 'tr' ? 'Geçici ses kanallarının bit hızını belirleyin. Daha yüksek değerler kaliteyi artırır ancak sunucunuzun takviye seviyesi bunu karşılamıyor olabilir. ' : 'Set the bitrate for temp audio channels. Higher values increase quality but your server boost level may not support it. '}
                  <a href="#" className="text-[#FF3366] hover:underline">{lang === 'tr' ? 'Daha fazlasını öğrenin.' : 'Learn more.'}</a>
                </p>
              </div>

              {/* Position */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  {lang === 'tr' ? 'Geçici Kanalın Pozisyonu' : 'Temp Channel Position'}
                </div>
                <div className="relative">
                    <select
                    value={creator.position}
                    onChange={(e) => handleUpdateCreator(creator.id, { position: e.target.value })}
                    className="w-full bg-surface-container/30 border border-outline-variant rounded-lg p-3 text-on-surface text-sm focus:border-primary-container outline-none transition-all appearance-none"
                    >
                    <option value="Altta">{lang === 'tr' ? 'Altta' : 'Bottom'}</option>
                    <option value="Üstte">{lang === 'tr' ? 'Üstte' : 'Top'}</option>
                    <option value="Oluşturucunun hemen altında">{lang === 'tr' ? 'Oluşturucunun hemen altında' : 'Right below creator'}</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Initial View
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-headline-lg text-on-surface uppercase tracking-widest flex items-center gap-2">
          <Headphones className="text-primary-container" size={20} />
          {lang === 'tr' ? 'Geçici Ses Kanalları' : 'Temporary Voice Channels'}
        </h2>
        <span className="bg-primary-container text-on-primary text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest">
          BETA
        </span>
      </div>

      {creators.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-outline-variant rounded-xl bg-surface-container/20 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl"></div>
          <button 
            onClick={handleAddCreator}
            className="flex items-center gap-2 px-6 py-3 bg-surface border border-outline-variant hover:border-primary-container text-on-surface hover:text-primary-container rounded-lg font-label-bold tracking-wide transition-all shadow-lg hover:shadow-primary-container/20 z-10"
          >
            <Plus size={20} />
            Open Audio Channel
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
                <Headphones size={18} />
                {lang === 'tr' ? 'Kanal Oluşturucular' : 'Channel Creators'}
            </div>
          </div>
          
          {creators.map(creator => (
            <div key={creator.id} className="flex items-center justify-between p-3 bg-surface-container/30 border border-outline-variant rounded-xl group hover:border-primary-container/50 transition-all">
              <div className="flex items-center gap-3">
                <Headphones size={20} className="text-on-surface-variant group-hover:text-primary-container transition-colors" />
                <span className="font-headline-sm text-on-surface flex items-center gap-2 font-bold tracking-wide">
                  <Plus size={16} className="text-on-surface-variant" />
                  {creator.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setEditingCreatorId(creator.id)}
                  className="p-2 bg-surface-container/50 border border-outline-variant hover:border-primary-container text-on-surface-variant hover:text-primary-container rounded-lg transition-all"
                >
                  <Settings size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteCreator(creator.id)}
                  className="p-2 bg-surface-container/50 border border-outline-variant hover:border-[#FF3366] text-on-surface-variant hover:text-[#FF3366] rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

            {creators.length > 0 && (
                <button 
                    onClick={handleAddCreator}
                    className="flex items-center justify-center gap-2 p-3 mt-2 bg-surface border border-dashed border-outline-variant hover:border-primary-container text-on-surface-variant hover:text-primary-container rounded-xl font-label-bold tracking-wide transition-all"
                >
                    <Plus size={16} /> {lang === 'tr' ? 'Yeni Oluşturucu Ekle' : 'Add New Creator'}
                </button>
            )}
        </div>
      )}
    </div>
  );
}
