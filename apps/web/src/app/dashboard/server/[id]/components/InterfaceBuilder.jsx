"use client";

import React, { useState } from "react";
import { Globe, Send, UserCheck, RotateCcw, Crown } from "lucide-react";
import { BUTTON_DATA } from "@/lib/buttonConfigs";

const BUTTON_IDS = [
  'name', 'limit', 'privacy', 'waiting_room', 'chat',
  'trusted', 'untrusted', 'invite', 'kick', 'region',
  'block', 'unblock', 'claim', 'transfer', 'delete'
];

const DEFAULT_ACTIVE_BUTTONS = [...BUTTON_IDS];

export default function InterfaceBuilder({ lang = 'tr', discordChannels, guildId }) {
  const [activeButtons, setActiveButtons] = useState(DEFAULT_ACTIVE_BUTTONS);
  const [draggedItemIdx, setDraggedItemIdx] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const defaultTitle = lang === 'tr' ? 'VoiceForge Arayüzü' : 'VoiceForge Interface';
  const defaultDesc = lang === 'tr'
    ? 'Bu arayüzü kullanarak geçici ses kanalınızı istediğiniz şekilde yönetebilirsiniz.\n\nDaha fazla seçeneğe ulaşmak için /voice komutunu kullanabilirsiniz.'
    : 'You can customize and manage your temporary voice channel through this panel.\n\nUse /voice commands for more options.';
  const defaultFooter = lang === 'tr'
    ? 'Bu arayüzü kullanmak için aşağıdaki uygun butonlara tıklayın.'
    : 'Click the appropriate buttons below to use this interface.';

  // Editable Embed Content States
  const [embedTitle, setEmbedTitle] = useState(defaultTitle);
  const [embedDesc, setEmbedDesc] = useState(defaultDesc);
  const [embedFooter, setEmbedFooter] = useState(defaultFooter);

  // Inactive buttons are all BUTTON_IDS not currently in activeButtons
  const inactiveButtons = BUTTON_IDS.filter(id => !activeButtons.includes(id));

  const toggleButton = (id) => {
    if (activeButtons.includes(id)) {
      setActiveButtons(activeButtons.filter(btnId => btnId !== id));
    } else {
      setActiveButtons([...activeButtons, id]);
    }
  };

  const handleReset = () => {
    setActiveButtons(DEFAULT_ACTIVE_BUTTONS);
    setEmbedTitle(defaultTitle);
    setEmbedDesc(defaultDesc);
    setEmbedFooter(defaultFooter);
  };

  const handleDragStart = (e, index) => {
    setDraggedItemIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItemIdx === null || draggedItemIdx === index) return;
    
    const items = [...activeButtons];
    const draggedItem = items[draggedItemIdx];
    items.splice(draggedItemIdx, 1);
    items.splice(index, 0, draggedItem);
    
    setDraggedItemIdx(index);
    setActiveButtons(items);
  };

  const handleDragEnd = () => {
    setDraggedItemIdx(null);
  };

  const handleSend = async () => {
    if (!selectedChannel) return;
    setIsSending(true);
    setSendSuccess(false);

    try {
      const res = await fetch(`/api/send-tempvoice-interface/${guildId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: selectedChannel,
          buttons: activeButtons,
          lang: lang,
          embedTitle: embedTitle,
          embedDesc: embedDesc,
          embedFooter: embedFooter
        })
      });

      if (res.ok) {
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 3000);
      } else {
        console.error("Failed to send interface");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.92) translateY(6px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-pop-in {
          animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-headline-bold text-on-surface">
          {lang === 'tr' ? 'VoiceForge Arayüz Tasarımı' : 'VoiceForge Interface Builder'}
        </h2>
        <p className="text-sm text-on-surface-variant">
          {lang === 'tr' 
            ? 'Metinlerin üzerine tıklayarak düzenleyin, butonları sürükleyip sıralayın ve kanala gönderin.' 
            : 'Click on texts to edit directly, drag buttons to reorder, then send to channel.'}
        </p>
      </div>

      {/* ===== DISCORD EMBED SIMULATION BOX ===== */}
      <div className="bg-[#2b2d31] rounded-xl border border-[#1e1f22] p-4 flex flex-col gap-3 shadow-2xl">

        {/* Bot Author Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FF3366] flex items-center justify-center shadow-md">
              <Globe size={18} className="text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold text-sm tracking-wide">VoiceForge</span>
              <span className="bg-[#5865F2] text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">BOT</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[#FF9900]/20 text-[#FF9900] text-[10px] px-2 py-1 rounded font-bold flex items-center gap-1 border border-[#FF9900]/30 shadow-inner">
              <Crown size={11} /> PREMIUM
            </div>
            <button
              onClick={handleReset}
              className="text-[#B5BAC1] hover:text-white hover:bg-[#383A40] p-1.5 rounded transition-colors flex items-center gap-1 text-xs"
              title={lang === 'tr' ? 'Varsayılana Sıfırla' : 'Reset to Default'}
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">{lang === 'tr' ? 'Sıfırla' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* ===== EMBED CONTAINER (Left Red Stripe + Content) ===== */}
        <div className="flex rounded-lg overflow-hidden bg-[#232428] border border-[#1e1f22]">
          {/* Left Stripe */}
          <div className="w-1.5 bg-[#FF3366] shrink-0" />

          {/* Embed Body with Inline Editable Fields */}
          <div className="flex flex-col gap-2.5 p-3.5 w-full">
            {/* Inline Editable Title */}
            <input
              type="text"
              value={embedTitle}
              onChange={(e) => setEmbedTitle(e.target.value)}
              className="bg-transparent border border-transparent hover:border-white/10 focus:border-[#FF3366]/60 rounded px-1.5 py-0.5 -ml-1.5 text-white text-base font-bold tracking-wide outline-none transition-colors placeholder:text-[#4E5058] w-full"
              placeholder={lang === 'tr' ? 'Başlık girin...' : 'Enter title...'}
            />

            {/* Inline Editable Description */}
            <textarea
              value={embedDesc}
              onChange={(e) => setEmbedDesc(e.target.value)}
              rows={3}
              className="bg-transparent border border-transparent hover:border-white/10 focus:border-[#FF3366]/60 rounded px-1.5 py-1 -ml-1.5 text-[#DBDEE1] text-[13px] leading-relaxed outline-none transition-colors resize-none placeholder:text-[#4E5058] w-full"
              placeholder={lang === 'tr' ? 'Açıklama girin...' : 'Enter description...'}
            />

            {/* ===== CANVAS IMAGE PREVIEW (Exact Discord generated image preview) ===== */}
            {activeButtons.length > 0 && (
              <div className="w-full bg-[#18191c] rounded-lg p-2.5 flex flex-col gap-2 border border-black/40 shadow-inner mt-1 select-none">
                {Array.from({ length: Math.ceil(activeButtons.length / 5) }).map((_, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-5 gap-2">
                    {activeButtons.slice(rowIdx * 5, (rowIdx + 1) * 5).map((btnId) => {
                      const config = BUTTON_DATA[btnId];
                      if (!config) return null;
                      const label = config.label[lang] || config.label.en;
                      return (
                        <div
                          key={btnId}
                          className="h-[38px] bg-[#111214] border border-white/5 rounded-[8px] flex items-center px-3 gap-2.5 shadow-sm transition-all"
                        >
                          <div className="shrink-0 flex items-center justify-center">
                            {config.icon(config.color)}
                          </div>
                          <span className="text-white text-xs font-bold uppercase tracking-wider truncate">
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Inline Editable Footer */}
            <input
              type="text"
              value={embedFooter}
              onChange={(e) => setEmbedFooter(e.target.value)}
              className="bg-transparent border border-transparent hover:border-white/10 focus:border-[#FF3366]/60 rounded px-1.5 py-0.5 -ml-1.5 text-[#949BA4] text-[11px] outline-none transition-colors placeholder:text-[#4E5058] w-full mt-1"
              placeholder={lang === 'tr' ? 'Alt başlık girin...' : 'Enter footer...'}
            />
          </div>
        </div>

        {/* ===== ACTIVE BUTTONS POOL (Draggable + Click to Remove) ===== */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#1E1F22]">
          <div className="flex justify-between items-center">
            <label className="text-[#949BA4] text-[11px] uppercase tracking-wider font-bold">
              {lang === 'tr' ? 'Aktif Butonlar' : 'Active Buttons'}
              <span className="ml-1 text-[#5865F2]">({activeButtons.length}/15)</span>
            </label>
            <span className="text-[#4E5058] text-[10px]">
              {lang === 'tr' ? 'Sürükleyip sıralayın veya tıklayıp kaldırın' : 'Drag to reorder or click to remove'}
            </span>
          </div>

          {activeButtons.length === 0 ? (
            <p className="text-[#4E5058] text-xs italic text-center py-4 bg-[#1E1F22] rounded-lg">
              {lang === 'tr' ? 'Tüm butonlar devre dışı. Aşağıdan ekleyin.' : 'All buttons disabled. Add below.'}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {Array.from({ length: Math.ceil(activeButtons.length / 5) }).map((_, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-5 gap-2">
                  {activeButtons.slice(rowIdx * 5, (rowIdx + 1) * 5).map((btnId, idxInRow) => {
                    const index = rowIdx * 5 + idxInRow;
                    const config = BUTTON_DATA[btnId];
                    if (!config) return null;
                    const label = config.label[lang] || config.label.en;
                    return (
                      <button
                        key={btnId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onDrop={handleDragEnd}
                        onClick={() => toggleButton(btnId)}
                        title={`${label} — ${lang === 'tr' ? 'Kaldırmak için tıkla' : 'Click to remove'}`}
                        className={`animate-pop-in h-9 rounded-[7px] flex items-center px-2 gap-2 cursor-grab active:cursor-grabbing select-none border transition-all ${
                          draggedItemIdx === index
                            ? 'bg-[#FF3366]/20 border-[#FF3366] opacity-70 scale-95 ring-2 ring-[#FF3366]'
                            : 'bg-[#18191c] border-white/5 hover:border-red-500/50 hover:bg-red-500/10 shadow-sm'
                        }`}
                      >
                        <div className="shrink-0 flex items-center justify-center">
                          {config.icon(config.color)}
                        </div>
                        <span className="text-white text-[10px] font-bold uppercase tracking-wide truncate">
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== INACTIVE BUTTONS POOL (Click to Add) ===== */}
        {inactiveButtons.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-[#1E1F22]">
            <div className="flex justify-between items-center">
              <label className="text-[#949BA4] text-[11px] uppercase tracking-wider font-bold">
                {lang === 'tr' ? 'Kullanılmayan Pasif Butonlar' : 'Inactive Buttons Pool'}
                <span className="ml-1 text-gray-500">({inactiveButtons.length})</span>
              </label>
              <span className="text-[#4E5058] text-[10px]">
                {lang === 'tr' ? 'Eklemek için tıklayın' : 'Click to add to active'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {inactiveButtons.map((btnId) => {
                const config = BUTTON_DATA[btnId];
                if (!config) return null;
                const label = config.label[lang] || config.label.en;
                return (
                  <button
                    key={btnId}
                    onClick={() => toggleButton(btnId)}
                    title={`${label} — ${lang === 'tr' ? 'Arayüze ekle' : 'Add to interface'}`}
                    className="animate-pop-in h-9 px-3 rounded-[7px] bg-[#1E1F22] border border-[#3A3C40] hover:border-green-500/50 hover:bg-green-500/10 flex items-center gap-2 transition-all"
                  >
                    <div className="shrink-0 flex items-center justify-center opacity-60">
                      {config.icon(config.color)}
                    </div>
                    <span className="text-[#80848E] text-[10px] font-bold uppercase tracking-wide">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===== SEND SECTION ===== */}
      <div className="mt-auto pt-2 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
          <Send size={16} />
          {lang === 'tr' ? 'Arayüzü Kanala Gönder' : 'Send Interface to Channel'}
        </div>
        
        <div className="flex gap-2">
          <select
            className="flex-1 bg-surface-container/30 border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:border-primary-container hover:border-primary-container outline-none transition-all shadow-inner"
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
          >
            <option value="" disabled className="text-on-surface-variant">
              {lang === 'tr' ? 'Metin Kanalı Seçin' : 'Select Text Channel'}
            </option>
            {discordChannels?.filter(c => c.type === 0).map(c => (
              <option key={c.id} value={c.id} className="bg-surface-container-highest">
                # {c.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleSend}
            disabled={!selectedChannel || isSending || activeButtons.length === 0}
            className={`w-14 rounded-lg flex items-center justify-center transition-all ${
              !selectedChannel || isSending || activeButtons.length === 0
                ? 'bg-surface-container border border-outline-variant text-on-surface-variant cursor-not-allowed opacity-70'
                : sendSuccess
                  ? 'bg-green-500/20 text-green-500 border border-green-500/50 hover:bg-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                  : 'bg-surface-container-highest border border-outline-variant hover:border-primary-container text-on-surface hover:text-primary-container shadow-md'
            }`}
          >
            {isSending ? (
              <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : sendSuccess ? (
              <UserCheck size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
